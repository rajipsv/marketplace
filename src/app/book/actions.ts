"use server";

import { and, eq, gt, inArray, isNull, lt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { booking, classSession, coach, familyMember, offering } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { evaluateCoupon } from "@/lib/coupons";
import { activeBookingStatuses, CANCEL_CUTOFF_HOURS, openSlots } from "@/lib/slots";
import type { FormState } from "@/lib/validation";

const input = z.object({
  offeringId: z.string().uuid(),
  attendee: z.union([z.literal("self"), z.string().uuid()]),
  startsAt: z.string().datetime().optional(), // 1-on-1
  sessionId: z.string().uuid().optional(), // group / weekly
  coupon: z.string().trim().max(40).optional(),
});

class BookingError extends Error {}

export async function createBooking(_prev: FormState, fd: FormData): Promise<FormState> {
  const auth = await getSession();
  if (!auth) return { error: "Please sign in again." };
  const userId = auth.user.id;

  const parsed = input.safeParse({
    offeringId: fd.get("offeringId"),
    attendee: fd.get("attendee") || "self",
    startsAt: fd.get("startsAt") || undefined,
    sessionId: fd.get("sessionId") || undefined,
    coupon: String(fd.get("coupon") ?? "") || undefined,
  });
  if (!parsed.success) return { error: "Please choose a time." };
  const p = parsed.data;

  const [o] = await db
    .select({
      id: offering.id,
      format: offering.format,
      durationMin: offering.durationMin,
      priceUsdCents: offering.priceUsdCents,
      coachId: coach.id,
      coachUserId: coach.userId,
      timezone: coach.timezone,
    })
    .from(offering)
    .innerJoin(coach, eq(offering.coachId, coach.id))
    .where(and(eq(offering.id, p.offeringId), eq(offering.isActive, true), eq(coach.status, "approved")));
  if (!o) return { error: "This class is no longer available." };
  if (o.coachUserId === userId) return { error: "You can't book your own class." };

  let familyMemberId: string | null = null;
  if (p.attendee !== "self") {
    const [m] = await db
      .select({ id: familyMember.id })
      .from(familyMember)
      .where(and(eq(familyMember.id, p.attendee), eq(familyMember.parentUserId, userId)));
    if (!m) return { error: "Please choose who is attending." };
    familyMemberId = m.id;
  }

  // Price after any coupon, checked inside the booking transaction (row-locked).
  // No payments yet: free bookings confirm immediately, paid ones are reserved.
  const pricing = async (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => {
    let discount = 0;
    let couponId: string | null = null;
    if (p.coupon) {
      const c = await evaluateCoupon(tx, p.coupon, userId, o.priceUsdCents, true);
      if (!c.ok) throw new BookingError(c.error);
      discount = c.discountCents;
      couponId = c.id;
    }
    const price = o.priceUsdCents - discount;
    return {
      status: price === 0 ? ("confirmed" as const) : ("pending_payment" as const),
      priceUsdCents: price,
      discountUsdCents: discount,
      couponId,
    };
  };
  let bookingId: string;

  try {
    if (o.format === "one-on-one") {
      if (!p.startsAt) return { error: "Please choose a time." };
      const start = new Date(p.startsAt);
      // Only times generated from the coach's weekly hours are bookable.
      const slots = await openSlots(o.coachId, o.timezone, o.durationMin);
      if (!slots.includes(start.toISOString())) return { error: "That time was just taken. Please pick another." };
      const end = new Date(start.getTime() + o.durationMin * 60_000);

      bookingId = await db.transaction(async (tx) => {
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
        const [b] = await tx
          .insert(booking)
          .values({ sessionId: s.id, customerUserId: userId, familyMemberId, ...(await pricing(tx)) })
          .returning({ id: booking.id });
        return b.id;
      });
    } else {
      if (!p.sessionId) return { error: "Please choose a date." };
      const sessionId = p.sessionId;
      bookingId = await db.transaction(async (tx) => {
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

        const [b] = await tx
          .insert(booking)
          .values({ sessionId: s.id, customerUserId: userId, familyMemberId, ...(await pricing(tx)) })
          .returning({ id: booking.id });
        return b.id;
      });
    }
  } catch (e) {
    if (e instanceof BookingError) return { error: e.message };
    throw e;
  }

  revalidatePath("/my-sessions");
  redirect(`/my-sessions?booked=${bookingId}`);
}

export async function cancelBooking(fd: FormData) {
  const auth = await getSession();
  if (!auth) return;
  const id = z.string().uuid().parse(fd.get("bookingId"));

  const [row] = await db
    .select({ id: booking.id, status: booking.status, sessionId: booking.sessionId, startsAt: classSession.startsAt, format: offering.format })
    .from(booking)
    .innerJoin(classSession, eq(booking.sessionId, classSession.id))
    .innerJoin(offering, eq(classSession.offeringId, offering.id))
    .where(and(eq(booking.id, id), eq(booking.customerUserId, auth.user.id)));
  if (!row || !activeBookingStatuses.includes(row.status as (typeof activeBookingStatuses)[number])) return;
  if (row.startsAt.getTime() - Date.now() < CANCEL_CUTOFF_HOURS * 3600_000) return;

  await db.transaction(async (tx) => {
    await tx.update(booking).set({ status: "cancelled", cancelledAt: new Date() }).where(eq(booking.id, row.id));
    // A 1-on-1 slot exists only for this booking: free it for others.
    if (row.format === "one-on-one")
      await tx.update(classSession).set({ status: "cancelled" }).where(eq(classSession.id, row.sessionId));
  });
  revalidatePath("/my-sessions");
}

/** Lets the booking page show the discount before the customer books. */
export async function previewCoupon(code: string, offeringId: string) {
  const auth = await getSession();
  if (!auth) return { ok: false as const, error: "Please sign in again." };
  const id = z.string().uuid().safeParse(offeringId);
  if (!id.success) return { ok: false as const, error: "Class not found." };
  const [o] = await db.select({ price: offering.priceUsdCents }).from(offering).where(eq(offering.id, id.data));
  if (!o) return { ok: false as const, error: "Class not found." };
  const c = await evaluateCoupon(db, code.slice(0, 40), auth.user.id, o.price);
  return c.ok
    ? { ok: true as const, code: c.code, description: c.description, discountCents: c.discountCents, finalCents: c.finalCents }
    : c;
}
