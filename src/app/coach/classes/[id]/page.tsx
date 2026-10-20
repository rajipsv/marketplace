import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, gt } from "drizzle-orm";
import { formatInTimeZone } from "date-fns-tz";
import { OfferingForm } from "@/components/coach/offering-form";
import { SessionScheduler } from "@/components/coach/session-scheduler";
import { db } from "@/db";
import { classSession, offering } from "@/db/schema";
import { requireApprovedCoach } from "@/lib/authz";
import { getCategories } from "@/lib/queries";
import { addSessions, cancelSession, saveOffering } from "../../actions";

export const metadata: Metadata = { title: "Edit class" };

export default async function EditClassPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { coach } = await requireApprovedCoach(`/coach/classes/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [o] = await db.select().from(offering).where(and(eq(offering.id, id), eq(offering.coachId, coach.id)));
  if (!o) notFound();

  const [categories, sessions, sp] = await Promise.all([
    getCategories(),
    db
      .select()
      .from(classSession)
      .where(and(eq(classSession.offeringId, o.id), eq(classSession.status, "scheduled"), gt(classSession.startsAt, new Date())))
      .orderBy(asc(classSession.startsAt)),
    searchParams,
  ]);

  return (
    <div className="space-y-10">
      <div>
        <Link href="/coach/classes" className="text-sm text-muted hover:text-foreground">
          ← Your classes
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold">{o.title}</h1>
        {sp.created && (
          <p role="status" className="mt-3 rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
            Class created.{" "}
            {o.format === "one-on-one"
              ? "Families can book it during your weekly hours."
              : "Now add the dates you'll teach it below."}
          </p>
        )}
        {o.isActive && (
          <Link href={`/sessions/${o.slug}`} className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
            View public page ↗
          </Link>
        )}
      </div>

      {o.format !== "one-on-one" && (
        <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">Session dates</h2>
          <p className="mt-1 text-sm text-muted">Times are in India time (IST). Families see them in their own time zone.</p>
          {sessions.length > 0 && (
            <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span>
                    {formatInTimeZone(s.startsAt, coach.timezone, "EEE d MMM yyyy, h:mm a")} IST
                    <span className="text-muted"> · {formatInTimeZone(s.startsAt, "America/New_York", "h:mm a")} US Eastern</span>
                  </span>
                  <form action={cancelSession}>
                    <input type="hidden" name="sessionId" value={s.id} />
                    <button className="cursor-pointer rounded-full border border-border px-3 py-1 text-xs font-semibold hover:border-kumkum hover:text-kumkum">
                      Cancel
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6">
            <SessionScheduler action={addSessions} offeringId={o.id} />
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="mb-5 font-display text-xl font-semibold">Class details</h2>
        <OfferingForm
          action={saveOffering}
          categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
          defaults={{
            id: o.id,
            title: o.title,
            categorySlug: o.categorySlug,
            description: o.description,
            format: o.format,
            audience: o.audience,
            durationMin: o.durationMin,
            priceInr: o.priceInrPaise / 100,
            capacity: o.capacity,
            languages: o.languages,
            isActive: o.isActive,
          }}
        />
      </section>
    </div>
  );
}
