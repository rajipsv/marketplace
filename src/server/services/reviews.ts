import "server-only";
import { and, desc, eq, inArray, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { booking, classSession, offering, review, user } from "@/db/schema";
import { firstError } from "@/lib/validation";
import type { Result } from "./result";

/** Bookings that count as "attended" for reviewing. */
const attendedStatuses = ["confirmed", "completed"] as const;

export const reviewInput = z.object({
  rating: z.coerce.number().int().min(1, "Choose 1 to 5 stars").max(5),
  comment: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v ?? "").trim().slice(0, 1000) || null),
});

/** Verified review: only the family that attended, after the class ended, once per booking. */
export async function submitReview(userId: string, bookingId: string, raw: z.input<typeof reviewInput>): Promise<Result> {
  if (!z.string().uuid().safeParse(bookingId).success) return { ok: false, error: "Booking not found.", code: "not_found" };
  const parsed = reviewInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error), code: "invalid_input" };

  const [b] = await db
    .select({ id: booking.id, status: booking.status, endsAt: classSession.endsAt, coachId: offering.coachId })
    .from(booking)
    .innerJoin(classSession, eq(booking.sessionId, classSession.id))
    .innerJoin(offering, eq(classSession.offeringId, offering.id))
    .where(and(eq(booking.id, bookingId), eq(booking.customerUserId, userId)));
  if (!b) return { ok: false, error: "Booking not found.", code: "not_found" };
  if (!attendedStatuses.includes(b.status as (typeof attendedStatuses)[number]) || b.endsAt.getTime() > Date.now())
    return { ok: false, error: "You can rate a class after you've attended it.", code: "conflict" };

  const inserted = await db
    .insert(review)
    .values({ bookingId: b.id, coachId: b.coachId, customerUserId: userId, ...parsed.data })
    .onConflictDoNothing({ target: review.bookingId })
    .returning({ id: review.id });
  return inserted.length ? { ok: true } : { ok: false, error: "You've already rated this class.", code: "conflict" };
}

/** Average rating and count per coach (published reviews only). */
export async function ratingsFor(coachIds: string[]) {
  const map = new Map<string, { avg: number; count: number }>();
  if (!coachIds.length) return map;
  const rows = await db
    .select({
      coachId: review.coachId,
      avg: sql<number>`round(avg(${review.rating})::numeric, 1)::float`,
      count: sql<number>`count(*)::int`,
    })
    .from(review)
    .where(and(inArray(review.coachId, coachIds), eq(review.isPublished, true)))
    .groupBy(review.coachId);
  for (const r of rows) map.set(r.coachId, { avg: r.avg, count: r.count });
  return map;
}

/** Latest published reviews for a coach, with the reviewer's first name and class. */
export async function reviewsForCoach(coachId: string, limit = 10) {
  const rows = await db
    .select({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      name: user.name,
      classTitle: offering.title,
    })
    .from(review)
    .innerJoin(user, eq(review.customerUserId, user.id))
    .innerJoin(booking, eq(review.bookingId, booking.id))
    .innerJoin(classSession, eq(booking.sessionId, classSession.id))
    .innerJoin(offering, eq(classSession.offeringId, offering.id))
    .where(and(eq(review.coachId, coachId), eq(review.isPublished, true)))
    .orderBy(desc(review.createdAt))
    .limit(limit);
  return rows.map(({ name, ...r }) => ({ ...r, firstName: name.split(" ")[0], createdAt: r.createdAt.toISOString() }));
}

/** For a customer's bookings: which are rateable now, and existing ratings. */
export async function reviewStateFor(userId: string, bookingIds: string[]) {
  const state = new Map<string, { rating: number | null; canReview: boolean }>();
  if (!bookingIds.length) return state;
  const [existing, attended] = await Promise.all([
    db.select({ bookingId: review.bookingId, rating: review.rating }).from(review).where(inArray(review.bookingId, bookingIds)),
    db
      .select({ id: booking.id })
      .from(booking)
      .innerJoin(classSession, eq(booking.sessionId, classSession.id))
      .where(
        and(
          inArray(booking.id, bookingIds),
          eq(booking.customerUserId, userId),
          inArray(booking.status, [...attendedStatuses]),
          lt(classSession.endsAt, new Date()),
        ),
      ),
  ]);
  const rated = new Map(existing.map((e) => [e.bookingId, e.rating]));
  const ok = new Set(attended.map((a) => a.id));
  for (const id of bookingIds) state.set(id, { rating: rated.get(id) ?? null, canReview: ok.has(id) && !rated.has(id) });
  return state;
}
