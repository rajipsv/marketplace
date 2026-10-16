import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { CalendarClock } from "lucide-react";
import { LocalTime } from "@/components/local-time";
import { db } from "@/db";
import { booking, classSession, coach, familyMember, offering } from "@/db/schema";
import { requireUser } from "@/lib/authz";
import { CANCEL_CUTOFF_HOURS } from "@/lib/slots";
import { formatUsd } from "@/lib/utils";
import { cancelBooking } from "../book/actions";

export const metadata: Metadata = { title: "My sessions" };

const statusLabel: Record<string, { text: string; cls: string }> = {
  confirmed: { text: "Confirmed", cls: "bg-success/10 text-success" },
  pending_payment: { text: "Reserved · payment opens soon", cls: "bg-accent/20 text-accent-strong" },
  cancelled: { text: "Cancelled", cls: "bg-surface-muted text-muted" },
  refunded: { text: "Refunded", cls: "bg-surface-muted text-muted" },
  completed: { text: "Completed", cls: "bg-surface-muted text-muted" },
  no_show: { text: "Missed", cls: "bg-surface-muted text-muted" },
};

export default async function MySessionsPage({ searchParams }: { searchParams: Promise<{ booked?: string }> }) {
  const user = await requireUser("/my-sessions");
  const sp = await searchParams;

  const rows = await db
    .select({
      id: booking.id,
      status: booking.status,
      priceUsdCents: booking.priceUsdCents,
      startsAt: classSession.startsAt,
      sessionStatus: classSession.status,
      title: offering.title,
      slug: offering.slug,
      durationMin: offering.durationMin,
      coachName: coach.displayName,
      coachSlug: coach.slug,
      attendee: familyMember.name,
    })
    .from(booking)
    .innerJoin(classSession, eq(booking.sessionId, classSession.id))
    .innerJoin(offering, eq(classSession.offeringId, offering.id))
    .innerJoin(coach, eq(offering.coachId, coach.id))
    .leftJoin(familyMember, eq(booking.familyMemberId, familyMember.id))
    .where(eq(booking.customerUserId, user.id))
    .orderBy(desc(classSession.startsAt));

  const now = Date.now();
  const isActive = (s: string) => s === "confirmed" || s === "pending_payment";
  const upcoming = rows.filter((r) => isActive(r.status) && r.startsAt.getTime() > now).reverse();
  const past = rows.filter((r) => !upcoming.includes(r));
  const justBooked = rows.find((r) => r.id === sp.booked);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold">My sessions</h1>

      {justBooked && (
        <div role="status" className="mt-5 rounded-2xl border border-success/30 bg-success/10 p-5 text-sm">
          <p className="font-semibold text-success">
            {justBooked.status === "confirmed" ? "You're booked!" : "Your spot is reserved!"}
          </p>
          <p className="mt-1 text-foreground">
            {justBooked.title} with {justBooked.coachName}
            {justBooked.attendee && ` for ${justBooked.attendee}`}.{" "}
            {justBooked.status === "pending_payment" && "We'll send a payment link before the class."}
          </p>
        </div>
      )}

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">Upcoming</h2>
        {upcoming.length ? (
          <ul className="mt-3 space-y-3">
            {upcoming.map((r) => {
              const canCancel = r.startsAt.getTime() - now > CANCEL_CUTOFF_HOURS * 3600_000;
              return (
                <li key={r.id} className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link href={`/sessions/${r.slug}`} className="font-semibold hover:text-primary">
                        {r.title}
                      </Link>
                      <p className="text-sm text-muted">
                        with {r.coachName} · {r.durationMin} min{r.attendee ? ` · for ${r.attendee}` : ""}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusLabel[r.status].cls}`}>
                      {statusLabel[r.status].text}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <CalendarClock className="size-4 shrink-0 text-primary" aria-hidden />
                    <LocalTime iso={r.startsAt.toISOString()} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-sm">
                    <span className="text-muted">{formatUsd(r.priceUsdCents / 100)}</span>
                    <span className="text-muted">· Join link appears here before the class</span>
                    {canCancel ? (
                      <form action={cancelBooking} className="ml-auto">
                        <input type="hidden" name="bookingId" value={r.id} />
                        <button className="cursor-pointer font-semibold text-muted hover:text-kumkum">Cancel</button>
                      </form>
                    ) : (
                      <span className="ml-auto text-xs text-muted">Can&apos;t cancel within {CANCEL_CUTOFF_HOURS} h</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">
            No upcoming sessions.{" "}
            <Link href="/explore" className="font-semibold text-primary hover:underline">
              Find a class
            </Link>
          </p>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Past &amp; cancelled</h2>
          <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
            {past.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                <span>
                  <span className="font-medium">{r.title}</span>
                  <span className="text-muted">
                    {" "}
                    · {r.startsAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {r.attendee ? ` · ${r.attendee}` : ""}
                  </span>
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${(statusLabel[r.status] ?? statusLabel.completed).cls}`}>
                  {r.status === "confirmed" || r.status === "pending_payment" ? "Past" : statusLabel[r.status].text}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
