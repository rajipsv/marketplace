import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { booking, classSession, coachEarning, familyMember, offering, payout } from "@/db/schema";
import { requireApprovedCoach } from "@/lib/authz";
import { getSettings } from "@/lib/settings";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = { title: "Earnings" };

const rupees = (paise: number) => formatInr(paise / 100).replace("Free", "₹0");
const statusLabel = { held: "In refund hold", payable: "Ready to pay", paid: "Paid", reversed: "Reversed" } as const;

export default async function CoachEarningsPage() {
  const { coach } = await requireApprovedCoach("/coach/earnings");
  const s = await getSettings();

  const [rows, payouts] = await Promise.all([
    db
      .select({
        id: coachEarning.id,
        status: coachEarning.status,
        share: coachEarning.coachShareInrPaise,
        base: coachEarning.baseInrPaise,
        paid: coachEarning.paidInrPaise,
        availableAt: coachEarning.availableAt,
        startsAt: classSession.startsAt,
        title: offering.title,
        student: familyMember.name,
      })
      .from(coachEarning)
      .innerJoin(booking, eq(coachEarning.bookingId, booking.id))
      .innerJoin(classSession, eq(booking.sessionId, classSession.id))
      .innerJoin(offering, eq(classSession.offeringId, offering.id))
      .leftJoin(familyMember, eq(booking.familyMemberId, familyMember.id))
      .where(eq(coachEarning.coachId, coach.id))
      .orderBy(desc(classSession.startsAt))
      .limit(100),
    db.select().from(payout).where(eq(payout.coachId, coach.id)).orderBy(desc(payout.createdAt)).limit(20),
  ]);

  const sum = (st: string) => rows.filter((r) => r.status === st).reduce((a, r) => a + r.share, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Earnings</h1>
        <p className="mt-1 text-sm text-muted">
          You earn {100 - s.commissionPct}% of each completed class. Earnings become payable {s.holdDays} days after the class
          and are paid to your bank account in rupees, with TDS deducted as required by law.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-3">
        <Stat label="In refund hold" value={rupees(sum("held"))} />
        <Stat label="Ready to be paid" value={rupees(sum("payable"))} />
        <Stat label="Paid so far" value={rupees(payouts.reduce((a, p) => a + p.netInrPaise, 0))} hint="after TDS" />
      </ul>

      <section>
        <h2 className="font-display text-xl font-semibold">Completed classes</h2>
        {rows.length ? (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface text-sm">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <span>
                  <span className="font-medium">{r.title}</span>
                  <span className="text-muted">
                    {" "}
                    · {r.startsAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    {r.student && ` · ${r.student}`}
                  </span>
                </span>
                <span className="text-right">
                  <span className="font-semibold">{rupees(r.share)}</span>
                  <span className="block text-xs text-muted">
                    {statusLabel[r.status]}
                    {r.status === "held" && ` until ${r.availableAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}`}
                    {r.base !== r.paid && " · promo class"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted">
            Earnings appear here after your first completed class.
          </p>
        )}
      </section>

      {payouts.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-semibold">Payouts</h2>
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface text-sm">
            {payouts.map((p) => (
              <li key={p.id} className="flex flex-wrap justify-between gap-3 px-5 py-3">
                <span className="text-muted">
                  {p.periodStart} → {p.periodEnd}
                </span>
                <span>
                  {rupees(p.grossInrPaise)} − TDS {rupees(p.tdsInrPaise)} ={" "}
                  <span className="font-semibold">{rupees(p.netInrPaise)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <li className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </li>
  );
}
