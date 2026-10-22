import "server-only";
import { and, desc, eq, gt, inArray, isNull, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { booking, classSession, coach, familyMember, offering } from "@/db/schema";
import { evaluateCoupon } from "@/lib/coupons";
import { activeBookingStatuses, CANCEL_CUTOFF_HOURS, openSlots } from "@/lib/slots";
import type { Result } from "./result";

// Shared by the website (server actions) and the mobile API (/api/v1).

export const bookingInput = z.object({
  offeringId: z.string().uuid(),
  attendee: z.union([z.literal("self"), z.string().uuid()]).default("self"),
  startsAt: z.string().datetime().optional(), // 1-on-1
  sessionId: z.string().uuid().optional(), // group / weekly
  coupon: z.string().trim().max(40).optional(),
});
export type BookingInput = z.input<typeof bookingInput>;

class BookingError extends Error {}
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function createBooking(userId: string, raw: BookingInput): Promise<Result<{ bookingId: string; status: string }>> {
  const parsed = bookingInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Please choose a time.", code: "invalid_input" };
  const p = parsed.data;

  const [o] = await db
    .select({
      id: offering.id,
      format: offering.format,
      durationMin: offering.durationMin,
      priceInrPaise: offering.priceInrPaise,
      coachId: coach.id,
      coachUserId: coach.userId,
      timezone: coach.timezone,
    })
    .from(offering)
    .innerJoin(coach, eq(offering.coachId, coach.id))
    .where(and(eq(offering.id, p.offeringId), eq(offering.isActive, true), eq(coach.status, "approved")));
  if (!o) return { ok: false, error: "This class is no longer available.", code: "not_found" };
  if (o.coachUserId === userId) return { ok: false, error: "You can't book your own class.", code: "forbidden" };

  let familyMemberId: string | null = null;
  if (p.attendee !== "self") {
    const [m] = await db
      .select({ id: familyMember.id })
      .from(familyMember)
      .where(and(eq(familyMember.id, p.attendee), eq(familyMember.parentUserId, userId)));
    if (!m) return { ok: false, error: "Please choose who is attending.", code: "invalid_input" };
    familyMemberId = m.id;
  }

  // Price after any coupon, checked inside the booking transaction (row-locked).
  // No payments yet: free bookings confirm immediately, paid ones are reserved.
  const pricing = async (tx: Tx) => {
    let discount = 0;
    let couponId: string | null = null;
    if (p.coupon) {
      const c = await evaluateCoupon(tx, p.coupon, userId, o.priceInrPaise, true);
      if (!c.ok) throw new BookingError(c.error);
      discount = c.discountPaise;
      couponId = c.id;
    }
    const price = o.priceInrPaise - discount;
    return {
      status: price === 0 ? ("confirmed" as const) : ("pending_payment" as const),
      priceInrPaise: price,
      discountInrPaise: discount,
      couponId,
    };
  };

  try {
    if (o.format === "one-on-one") {
      if (!p.startsAt) return { ok: false, error: "Please choose a time.", code: "invalid_input" };
      const start = new Date(p.startsAt);
      // Only times generated from the coach's weekly hours are bookable.
      const slots = await openSlots(o.coachId, o.timezone, o.durationMin);
      if (!slots.includes(start.toISOString()))
        return { ok: false, error: "That time was just taken. Please pick another.", code: "conflict" };
      const end = new Date(start.getTime() + o.durationMin * 60_000);

      return await db.transaction(async (tx) => {
        // Serialise bookings per coach so two people can't take the same slot.
        await tx.select({ id: coach.id }).from(coach).where(eq(coach.id, o.coachId)).for("update");
        const clash = await tx
          .select({ id: classSession.id })
          .from(classSession)
          .where(
            and(
              eq(classSession.coachId, o.coachId),
              eq(classSession.status, "scheduled"),
              lt(classSession.startsAt, end),
              gt(classSession.endsAt, start),
            ),
          )
          .limit(1);
        if (clash.length) throw new BookingError("That time was just taken. Please pick another.");
        const [s] = await tx
          .insert(classSession)
          .values({ offeringId: o.id, coachId: o.coachId, startsAt: start, endsAt: end, capacity: 1 })
          .returning({ id: classSession.id });
        const price = await pricing(tx);
        const [b] = await tx
          .insert(booking)
          .values({ sessionId: s.id, customerUserId: userId, familyMemberId, ...price })
          .returning({ id: booking.id });
        return { ok: true as const, bookingId: b.id, status: price.status };
      });
    }

    if (!p.sessionId) return { ok: false, error: "Please choose a date.", code: "invalid_input" };
    const sessionId = p.sessionId;
    return await db.transaction(async (tx) => {
      const [s] = await tx
        .select({ id: classSession.id, capacity: classSession.capacity, startsAt: classSession.startsAt, status: classSession.status })
        .from(classSession)
        .where(and(eq(classSession.id, sessionId), eq(classSession.offeringId, o.id)))
        .for("update");
      if (!s || s.status !== "scheduled" || s.startsAt.getTime() < Date.now() + 60 * 60_000)
        throw new BookingError("This date is no longer available.");

      const [{ n }] = await tx
        .select({ n: sql<number>`count(*)::int` })
        .from(booking)
        .where(and(eq(booking.sessionId, s.id), inArray(booking.status, [...activeBookingStatuses])));
      if (n >= s.capacity) throw new BookingError("Sorry, this date is full.");

      const dup = await tx
        .select({ id: booking.id })
        .from(booking)
        .where(
          and(
            eq(booking.sessionId, s.id),
            eq(booking.customerUserId, userId),
            familyMemberId ? eq(booking.familyMemberId, familyMemberId) : isNull(booking.familyMemberId),
            inArray(booking.status, [...activeBookingStatuses]),
          ),
        )
        .limit(1);
      if (dup.length) throw new BookingError("You've already booked this date for them.");

      const price = await pricing(tx);
      const [b] = await tx
        .insert(booking)
        .values({ sessionId: s.id, customerUserId: userId, familyMemberId, ...price })
        .returning({ id: booking.id });
      return { ok: true as const, bookingId: b.id, status: price.status };
    });
  } catch (e) {
    if (e instanceof BookingError) return { ok: false, error: e.message, code: "conflict" };
    throw e;
  }
}

export async function cancelBooking(userId: string, bookingId: string): Promise<Result<{ bookingId: string }>> {
  if (!z.string().uuid().safeParse(bookingId).success) return { ok: false, error: "Booking not found.", code: "not_found" };
  const [row] = await db
    .select({ id: booking.id, status: booking.status, sessionId: booking.sessionId, startsAt: classSession.startsAt, format: offering.format })
    .from(booking)
    .innerJoin(classSession, eq(booking.sessionId, classSession.id))
    .innerJoin(offering, eq(classSession.offeringId, offering.id))
    .where(and(eq(booking.id, bookingId), eq(booking.customerUserId, userId)));
  if (!row) return { ok: false, error: "Booking not found.", code: "not_found" };
  if (!activeBookingStatuses.includes(row.status as (typeof activeBookingStatuses)[number]))
    return { ok: false, error: "This booking can't be cancelled.", code: "conflict" };
  if (row.startsAt.getTime() - Date.now() < CANCEL_CUTOFF_HOURS * 3600_000)
    return { ok: false, error: `Bookings can only be cancelled up to ${CANCEL_CUTOFF_HOURS} hours before the class.`, code: "conflict" };

  await db.transaction(async (tx) => {
    await tx.update(booking).set({ status: "cancelled", cancelledAt: new Date() }).where(eq(booking.id, row.id));
    // A 1-on-1 slot exists only for this booking: free it for others.
    if (row.format === "one-on-one")
      await tx.update(classSession).set({ status: "cancelled" }).where(eq(classSession.id, row.sessionId));
  });
  return { ok: true, bookingId: row.id };
}

export async function previewCoupon(userId: string, code: string, offeringId: string) {
  const id = z.string().uuid().safeParse(offeringId);
  if (!id.success) return { ok: false as const, error: "Class not found." };
  const [o] = await db.select({ price: offering.priceInrPaise }).from(offering).where(eq(offering.id, id.data));
  if (!o) return { ok: false as const, error: "Class not found." };
  const c = await evaluateCoupon(db, code.slice(0, 40), userId, o.price);
  return c.ok
    ? { ok: true as const, code: c.code, description: c.description, discountPaise: c.discountPaise, finalPaise: c.finalPaise }
    : { ok: false as const, error: c.error };
}

/** A customer's bookings, newest class first. */
export async function listBookings(userId: string) {
  const rows = await db
    .select({
      id: booking.id,
      status: booking.status,
      priceInrPaise: booking.priceInrPaise,
      discountInrPaise: booking.discountInrPaise,
      startsAt: classSession.startsAt,
      endsAt: classSession.endsAt,
      offering: { slug: offering.slug, title: offering.title, durationMin: offering.durationMin, format: offering.format },
      coach: { slug: coach.slug, name: coach.displayName },
      attendee: { id: familyMember.id, name: familyMember.name },
    })
    .from(booking)
    .innerJoin(classSession, eq(booking.sessionId, classSession.id))
    .innerJoin(offering, eq(classSession.offeringId, offering.id))
    .innerJoin(coach, eq(offering.coachId, coach.id))
    .leftJoin(familyMember, eq(booking.familyMemberId, familyMember.id))
    .where(eq(booking.customerUserId, userId))
    .orderBy(desc(classSession.startsAt));
  const now = Date.now();
  return rows.map((r) => ({
    ...r,
    attendee: r.attendee?.id ? r.attendee : null,
    canCancel:
      (r.status === "confirmed" || r.status === "pending_payment") &&
      r.startsAt.getTime() - now > CANCEL_CUTOFF_HOURS * 3600_000,
  }));
}
