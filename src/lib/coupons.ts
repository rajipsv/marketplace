import "server-only";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { booking, coupon } from "@/db/schema";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Conn = typeof db | Tx;

/** Bookings that use up a coupon (cancelled/refunded ones give it back). */
const redeemedStatuses = ["pending_payment", "confirmed", "completed", "no_show"] as const;

export const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, "");

export type CouponCheck =
  | { ok: true; id: string; code: string; description: string; percentOff: number; discountCents: number; finalCents: number }
  | { ok: false; error: string };

/**
 * Validates a code for this customer and price. Pass a transaction plus
 * `lock: true` when booking, so concurrent redemptions can't exceed the limit.
 */
export async function evaluateCoupon(
  conn: Conn,
  rawCode: string,
  customerUserId: string,
  priceCents: number,
  lock = false,
): Promise<CouponCheck> {
  const code = normalizeCode(rawCode);
  if (!code) return { ok: false, error: "Please enter a code." };

  const q = conn.select().from(coupon).where(eq(coupon.code, code));
  const [c] = lock ? await q.for("update") : await q;
  if (!c || !c.isActive) return { ok: false, error: "That code isn't valid." };
  if (c.validUntil && c.validUntil.getTime() < Date.now()) return { ok: false, error: "That code has expired." };
  if (priceCents === 0) return { ok: false, error: "This class is already free." };

  const [{ used }] = await conn
    .select({ used: sql<number>`count(*)::int` })
    .from(booking)
    .where(and(eq(booking.couponId, c.id), inArray(booking.status, [...redeemedStatuses])));
  if (c.maxRedemptions != null && used >= c.maxRedemptions) return { ok: false, error: "This offer has been fully claimed." };

  const [{ mine }] = await conn
    .select({ mine: sql<number>`count(*)::int` })
    .from(booking)
    .where(and(eq(booking.couponId, c.id), eq(booking.customerUserId, customerUserId), inArray(booking.status, [...redeemedStatuses])));
  if (mine > 0) return { ok: false, error: "You've already used this code." };

  if (c.firstBookingOnly) {
    const [{ prior }] = await conn
      .select({ prior: sql<number>`count(*)::int` })
      .from(booking)
      .where(and(eq(booking.customerUserId, customerUserId), ne(booking.status, "cancelled")));
    if (prior > 0) return { ok: false, error: "This code is for your first booking only." };
  }

  const discountCents = Math.min(priceCents, Math.round((priceCents * c.percentOff) / 100));
  return {
    ok: true,
    id: c.id,
    code: c.code,
    description: c.description,
    percentOff: c.percentOff,
    discountCents,
    finalCents: priceCents - discountCents,
  };
}

/** Public summary of a promoted coupon (for banners), or null if not currently usable. */
export async function getPromo(code: string) {
  const [c] = await db.select().from(coupon).where(eq(coupon.code, normalizeCode(code)));
  if (!c || !c.isActive || (c.validUntil && c.validUntil.getTime() < Date.now())) return null;
  const [{ used }] = await db
    .select({ used: sql<number>`count(*)::int` })
    .from(booking)
    .where(and(eq(booking.couponId, c.id), inArray(booking.status, [...redeemedStatuses])));
  const remaining = c.maxRedemptions == null ? null : Math.max(0, c.maxRedemptions - used);
  if (remaining === 0) return null;
  return { code: c.code, description: c.description, percentOff: c.percentOff, remaining, firstBookingOnly: c.firstBookingOnly };
}
