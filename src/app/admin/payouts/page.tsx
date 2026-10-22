import type { Metadata } from "next";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { coach, coachEarning, payout } from "@/db/schema";
import { assertRole, requireRole } from "@/lib/authz";
import { payableByCoach, recordPayout, settle } from "@/lib/earnings";
import { getSettings } from "@/lib/settings";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = { title: "Payouts · Admin" };

const rupees = (paise: number) => formatInr(paise / 100).replace("Free", "₹0");

async function runSettlement() {
  "use server";
  await assertRole(["admin"]);
  const r = await settle();
  revalidatePath("/admin/payouts");
  redirect(`/admin/payouts?settled=${r.sessionsCompleted}-${r.earningsCreated}-${r.earningsReleased}`);
}

async function markPaid(fd: FormData) {
  "use server";
  await assertRole(["admin"]);
  const coachId = z.string().uuid().parse(fd.get("coachId"));
  const r = await recordPayout(coachId);
  revalidatePath("/admin/payouts");
  redirect(`/admin/payouts?${r.ok ? `paid=${r.net}` : `error=${encodeURIComponent(r.error)}`}`);
}

export default async function AdminPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ settled?: string; paid?: string; error?: string }>;
}) {
  await requireRole(["admin"], "/admin/payouts");
  const sp = await searchParams;
  const s = await getSettings();

  const [payable, held, recent, [totals]] = await Promise.all([
    payableByCoach(),
    db
      .select({
        coachId: coachEarning.coachId,
        classes: sql<number>`count(*)::int`,
        share: sql<number>`sum(${coachEarning.coachShareInrPaise})::int`,
        nextAt: sql<Date>`min(${coachEarning.availableAt})`,
      })
      .from(coachEarning)
      .where(eq(coachEarning.status, "held"))
      .groupBy(coachEarning.coachId),
    db.select().from(payout).orderBy(desc(payout.createdAt)).limit(20),
    db
      .select({
        commission: sql<number>`coalesce(sum(${coachEarning.commissionInrPaise}), 0)::int`,
        collected: sql<number>`coalesce(sum(${coachEarning.paidInrPaise}), 0)::int`,
        promoFunded: sql<number>`coalesce(sum(${coachEarning.baseInrPaise} - ${coachEarning.paidInrPaise}), 0)::int`,
      })
      .from(coachEarning)
      .where(inArray(coachEarning.status, ["held", "payable", "paid"])),
  ]);

  const ids = [...new Set([...payable, ...held, ...recent].map((r) => r.coachId))];
  const names = new Map(
    ids.length
      ? (await db.select({ id: coach.id, name: coach.displayName }).from(coach).where(inArray(coach.id, ids))).map((c) => [c.id, c.name])
      : [],
  );

  const [sc, ec, er] = (sp.settled ?? "").split("-");

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Coach payouts</h1>
          <p className="mt-1 text-sm text-muted">
            {100 - s.commissionPct}% to coaches · {s.commissionPct}% platform · {s.holdDays}-day refund hold · TDS {s.tdsPct}% ·
            promos based on {s.discountBasis === "list" ? "full price" : "amount paid"} (change in Settings)
          </p>
        </div>
        <form action={runSettlement}>
          <button className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted">
            Run settlement now
          </button>
        </form>
      </div>

      {sp.settled && (
        <p role="status" className="rounded-xl bg-success/10 px-4 py-2 text-sm text-success">
          Settlement done: {sc} sessions completed, {ec} new earnings, {er} released for payout. (Runs automatically every day.)
        </p>
      )}
      {sp.paid && (
        <p role="status" className="rounded-xl bg-success/10 px-4 py-2 text-sm text-success">
          Payout recorded: {rupees(Number(sp.paid))} net.
        </p>
      )}
      {sp.error && (
        <p role="alert" className="rounded-xl bg-kumkum/10 px-4 py-2 text-sm text-kumkum">
          {sp.error}
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-3">
        <Stat label="Collected from families" value={rupees(totals.collected)} />
        <Stat label="Platform commission earned" value={rupees(totals.commission)} />
        <Stat label="Promotions funded by platform" value={rupees(Math.max(0, totals.promoFunded))} />
      </ul>

      <section>
        <h2 className="font-display text-xl font-semibold">Ready to pay</h2>
        <p className="mt-1 text-sm text-muted">
          Transfer the net amount to the coach&apos;s bank/UPI, then mark it paid. (Automatic RazorpayX payouts come later.)
        </p>
        {payable.length ? (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Coach</th>
                  <th className="px-4 py-3">Classes</th>
                  <th className="px-4 py-3">Earnings</th>
                  <th className="px-4 py-3">TDS</th>
                  <th className="px-4 py-3">Net to pay</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payable.map((r) => (
                  <tr key={r.coachId}>
                    <td className="px-4 py-3 font-medium">{names.get(r.coachId)}</td>
                    <td className="px-4 py-3">{r.classes}</td>
                    <td className="px-4 py-3">{rupees(r.share)}</td>
                    <td className="px-4 py-3">{rupees(r.tds)}</td>
                    <td className="px-4 py-3 font-semibold">{rupees(r.net)}</td>
                    <td className="px-4 py-3 text-right">
                      <form action={markPaid}>
                        <input type="hidden" name="coachId" value={r.coachId} />
                        <button className="cursor-pointer rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-strong">
                          Mark paid
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>Nothing to pay right now.</Empty>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">In refund hold</h2>
        {held.length ? (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface text-sm">
            {held.map((h) => (
              <li key={h.coachId} className="flex flex-wrap justify-between gap-3 px-5 py-3">
                <span className="font-medium">{names.get(h.coachId)}</span>
                <span className="text-muted">
                  {h.classes} classes · {rupees(h.share)} · first release {new Date(h.nextAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No earnings in hold.</Empty>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Recent payouts</h2>
        {recent.length ? (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface text-sm">
            {recent.map((p) => (
              <li key={p.id} className="flex flex-wrap justify-between gap-3 px-5 py-3">
                <span className="font-medium">{names.get(p.coachId)}</span>
                <span className="text-muted">
                  {p.periodStart} → {p.periodEnd} · gross {rupees(p.grossInrPaise)} · TDS {rupees(p.tdsInrPaise)} · net{" "}
                  <span className="font-semibold text-foreground">{rupees(p.netInrPaise)}</span> · {p.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No payouts yet.</Empty>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <li className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
    </li>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted">{children}</p>;
}
