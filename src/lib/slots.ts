import "server-only";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { and, eq, gt, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { availabilityRule, booking, classSession } from "@/db/schema";

export const BOOKING_WINDOW_DAYS = 21;
export const MIN_NOTICE_HOURS = 12;
export { CANCEL_CUTOFF_HOURS } from "@shared/time"; // single source shared with the app
const STEP_MIN = 30;

/** Booking statuses that occupy a seat. */
export const activeBookingStatuses = ["pending_payment", "confirmed"] as const;

/**
 * Open 1-on-1 start times (UTC ISO strings) for a coach, built from their weekly
 * hours in their own time zone, minus anything that overlaps a scheduled session.
 */
export async function openSlots(coachId: string, timeZone: string, durationMin: number) {
  const now = Date.now();
  const earliest = now + MIN_NOTICE_HOURS * 3600_000;
  const latest = now + BOOKING_WINDOW_DAYS * 86400_000;

  const [rules, busy] = await Promise.all([
    db.select().from(availabilityRule).where(eq(availabilityRule.coachId, coachId)),
    db
      .select({ startsAt: classSession.startsAt, endsAt: classSession.endsAt })
      .from(classSession)
      .where(
        and(
          eq(classSession.coachId, coachId),
          eq(classSession.status, "scheduled"),
          lt(classSession.startsAt, new Date(latest + 86400_000)),
          gt(classSession.endsAt, new Date(now)),
        ),
      ),
  ]);
  if (!rules.length) return [];

  const slots: string[] = [];
  for (let d = 0; d <= BOOKING_WINDOW_DAYS; d++) {
    // Calendar date and weekday in the coach's zone.
    const day = formatInTimeZone(new Date(now + d * 86400_000), timeZone, "yyyy-MM-dd");
    const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
    for (const r of rules.filter((x) => x.weekday === weekday)) {
      for (let m = r.startMinute; m + durationMin <= r.endMinute; m += STEP_MIN) {
        const hh = String(Math.floor(m / 60)).padStart(2, "0");
        const mm = String(m % 60).padStart(2, "0");
        const start = fromZonedTime(`${day}T${hh}:${mm}:00`, timeZone).getTime();
        const end = start + durationMin * 60_000;
        if (start < earliest || start > latest) continue;
        if (busy.some((b) => b.startsAt.getTime() < end && b.endsAt.getTime() > start)) continue;
        slots.push(new Date(start).toISOString());
      }
    }
  }
  return [...new Set(slots)].sort();
}

/** Upcoming scheduled sessions of an offering with seats remaining. */
export async function sessionsWithSeats(offeringId: string) {
  const sessions = await db
    .select({ id: classSession.id, startsAt: classSession.startsAt, capacity: classSession.capacity })
    .from(classSession)
    .where(
      and(
        eq(classSession.offeringId, offeringId),
        eq(classSession.status, "scheduled"),
        gt(classSession.startsAt, new Date(Date.now() + 60 * 60_000)),
      ),
    )
    .orderBy(classSession.startsAt)
    .limit(12);
  if (!sessions.length) return [];

  const taken = await db
    .select({ sessionId: booking.sessionId, n: sql<number>`count(*)::int` })
    .from(booking)
    .where(and(inArray(booking.sessionId, sessions.map((s) => s.id)), inArray(booking.status, [...activeBookingStatuses])))
    .groupBy(booking.sessionId);
  const used = new Map(taken.map((t) => [t.sessionId, t.n]));

  return sessions.map((s) => ({
    id: s.id,
    startsAt: s.startsAt.toISOString(),
    seatsLeft: Math.max(0, s.capacity - (used.get(s.id) ?? 0)),
  }));
}
