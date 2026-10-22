import "server-only";
import { and, eq, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { booking, classSession, coachEarning, payout } from "@/db/schema";
import { getSettings } from "@/lib/settings";

/**
 * Daily settlement (cron + admin button). Idempotent: safe to run any number of times.
 * 1. Sessions whose end time has passed become "completed".
 * 2. Each confirmed booking in a finished session gets one earnings row and
 *    becomes "completed". Unpaid reservations never earn anything.
 * 3. Earnings past the refund hold move from "held" to "payable".
 */
export async function settle(now = new Date()) {
  const s = await getSettings();

  const sessions = await db
    .update(classSession)
    .set({ status: "completed" })
    .where(and(eq(classSession.status, "scheduled"), lte(classSession.endsAt, now)))
    .returning({ id: classSession.id });

  const due = await db
    .select({
      bookingId: booking.id,
      paid: booking.priceInrPaise,
      discount: booking.discountInrPaise,
      coachId: classSession.coachId,
      endsAt: classSession.endsAt,
    })
    .from(booking)
    .innerJoin(classSession, eq(booking.sessionId, classSession.id))
    .leftJoin(coachEarning, eq(coachEarning.bookingId, booking.id))
    .where(and(eq(booking.status, "confirmed"), lte(classSession.endsAt, now), isNull(coachEarning.id)));

  let earned = 0;
  for (const d of due) {
    const list = d.paid + d.discount;
    const base = s.discountBasis === "list" ? list : d.paid;
    const commission = Math.round((base * s.commissionPct) / 100);
    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(coachEarning)
        .values({
          bookingId: d.bookingId,
          coachId: d.coachId,
          listInrPaise: list,
          paidInrPaise: d.paid,
          baseInrPaise: base,
          commissionPct: s.commissionPct,
          commissionInrPaise: commission,
          coachShareInrPaise: base - commission,
          availableAt: new Date(d.endsAt.getTime() + s.holdDays * 86400_000),
        })
        .onConflictDoNothing({ target: coachEarning.bookingId })
        .returning({ id: coachEarning.id });
      if (inserted.length) {
        await tx.update(booking).set({ status: "completed" }).where(eq(booking.id, d.bookingId));
        earned++;
      }
    });
  }

  const released = await db
    .update(coachEarning)
    .set({ status: "payable" })
    .where(and(eq(coachEarning.status, "held"), lte(coachEarning.availableAt, now)))
    .returning({ id: coachEarning.id });

  return { sessionsCompleted: sessions.length, earningsCreated: earned, earningsReleased: released.length };
}

/** Payable totals per coach, with TDS and net amount, for the admin payout report. */
export async function payableByCoach() {
  const s = await getSettings();
  const rows = await db
    .select({
      coachId: coachEarning.coachId,
      classes: sql<number>`count(*)::int`,
      share: sql<number>`sum(${coachEarning.coachShareInrPaise})::int`,
      paidByFamilies: sql<number>`sum(${coachEarning.paidInrPaise})::int`,
    })
    .from(coachEarning)
    .where(eq(coachEarning.status, "payable"))
    .groupBy(coachEarning.coachId);
  return rows.map((r) => {
    // TDS (194-O) is calculated on the gross amount families paid; confirm the basis with the CA.
    const tds = Math.min(r.share, Math.round((r.paidByFamilies * s.tdsPct) / 100));
    return { ...r, tds, net: r.share - tds };
  });
}

/** Records a manual payout (bank/UPI transfer done outside the app) for all of a coach's payable earnings. */
export async function recordPayout(coachId: string) {
  const s = await getSettings();
  return db.transaction(async (tx) => {
    const items = await tx
      .select({ id: coachEarning.id, share: coachEarning.coachShareInrPaise, paid: coachEarning.paidInrPaise, createdAt: coachEarning.createdAt })
      .from(coachEarning)
      .where(and(eq(coachEarning.coachId, coachId), eq(coachEarning.status, "payable")))
      .for("update");
    if (!items.length) return { ok: false as const, error: "Nothing payable for this coach." };

    const gross = items.reduce((a, i) => a + i.share, 0);
    const paidByFamilies = items.reduce((a, i) => a + i.paid, 0);
    const tds = Math.min(gross, Math.round((paidByFamilies * s.tdsPct) / 100));
    const day = (d: Date) => d.toISOString().slice(0, 10);
    const periodStart = day(new Date(Math.min(...items.map((i) => i.createdAt.getTime()))));
    const periodEnd = day(new Date());

    const [existing] = await tx
      .select({ id: payout.id })
      .from(payout)
      .where(and(eq(payout.coachId, coachId), eq(payout.periodStart, periodStart), eq(payout.periodEnd, periodEnd)));
    if (existing) return { ok: false as const, error: "A payout for this period was already recorded today." };

    const [p] = await tx
      .insert(payout)
      .values({ coachId, periodStart, periodEnd, grossInrPaise: gross, tdsInrPaise: tds, netInrPaise: gross - tds, status: "paid" })
      .returning({ id: payout.id });
    await tx
      .update(coachEarning)
      .set({ status: "paid", payoutId: p.id })
      .where(and(eq(coachEarning.coachId, coachId), eq(coachEarning.status, "payable")));
    return { ok: true as const, payoutId: p.id, net: gross - tds };
  });
}

