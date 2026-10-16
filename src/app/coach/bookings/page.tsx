import type { Metadata } from "next";
import { and, asc, eq, gt, inArray } from "drizzle-orm";
import { formatInTimeZone } from "date-fns-tz";
import { db } from "@/db";
import { booking, classSession, familyMember, offering, user } from "@/db/schema";
import { requireApprovedCoach } from "@/lib/authz";
import { activeBookingStatuses } from "@/lib/slots";

export const metadata: Metadata = { title: "Bookings" };

export default async function CoachBookingsPage() {
  const { coach } = await requireApprovedCoach("/coach/bookings");
  const rows = await db
    .select({
      bookingId: booking.id,
      status: booking.status,
      sessionId: classSession.id,
      startsAt: classSession.startsAt,
      title: offering.title,
      parentName: user.name,
      childName: familyMember.name,
      childNotes: familyMember.notes,
      childBirthYear: familyMember.birthYear,
    })
    .from(booking)
    .innerJoin(classSession, eq(booking.sessionId, classSession.id))
    .innerJoin(offering, eq(classSession.offeringId, offering.id))
    .innerJoin(user, eq(booking.customerUserId, user.id))
    .leftJoin(familyMember, eq(booking.familyMemberId, familyMember.id))
    .where(
      and(
        eq(classSession.coachId, coach.id),
        gt(classSession.startsAt, new Date(Date.now() - 2 * 3600_000)),
        inArray(booking.status, [...activeBookingStatuses]),
      ),
    )
    .orderBy(asc(classSession.startsAt));

  // Group students under each session.
  const sessions = new Map<string, { startsAt: Date; title: string; students: typeof rows }>();
  for (const r of rows) {
    const s = sessions.get(r.sessionId) ?? { startsAt: r.startsAt, title: r.title, students: [] };
    s.students.push(r);
    sessions.set(r.sessionId, s);
  }
  const year = new Date().getUTCFullYear();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Upcoming bookings</h1>
      <p className="mt-1 text-muted">Times are in India time (IST).</p>
      {sessions.size ? (
        <ul className="mt-6 space-y-4">
          {[...sessions.entries()].map(([id, s]) => (
            <li key={id} className="rounded-2xl border border-border bg-surface p-5">
              <p className="font-semibold">{s.title}</p>
              <p className="text-sm text-muted">
                {formatInTimeZone(s.startsAt, coach.timezone, "EEE d MMM, h:mm a")} IST ·{" "}
                {formatInTimeZone(s.startsAt, "America/New_York", "h:mm a")} US Eastern
              </p>
              <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                {s.students.map((st) => (
                  <li key={st.bookingId} className="flex flex-wrap justify-between gap-2">
                    <span>
                      {st.childName ? (
                        <>
                          <span className="font-medium">{st.childName}</span>
                          {st.childBirthYear && <span className="text-muted"> · ~{year - st.childBirthYear} yrs</span>}
                          {st.childNotes && <span className="text-muted"> · {st.childNotes}</span>}
                          <span className="text-muted"> (parent: {st.parentName.split(" ")[0]})</span>
                        </>
                      ) : (
                        <span className="font-medium">{st.parentName.split(" ")[0]}</span>
                      )}
                    </span>
                    <span className="text-xs text-muted">{st.status === "confirmed" ? "Confirmed" : "Reserved (unpaid)"}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">
          No upcoming bookings yet.
        </p>
      )}
    </div>
  );
}
