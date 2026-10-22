import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { coach, offering } from "@/db/schema";
import { openSlots, sessionsWithSeats } from "@/lib/slots";
import { fail, ok } from "@/server/api";

/**
 * GET /api/v1/offerings/:slug/availability
 * 1-on-1 → { format, slots: ISO start times }; group/weekly → { format, sessions: [{ id, startsAt, seatsLeft }] }.
 * Times are UTC; show them in the device's time zone.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [o] = await db
    .select({ id: offering.id, format: offering.format, durationMin: offering.durationMin, coachId: coach.id, timezone: coach.timezone })
    .from(offering)
    .innerJoin(coach, eq(offering.coachId, coach.id))
    .where(and(eq(offering.slug, slug), eq(offering.isActive, true), eq(coach.status, "approved")));
  if (!o) return fail(404, "not_found", "Class not found.");
  if (o.format === "one-on-one") return ok({ format: o.format, slots: await openSlots(o.coachId, o.timezone, o.durationMin) });
  return ok({ format: o.format, sessions: await sessionsWithSeats(o.id) });
}
