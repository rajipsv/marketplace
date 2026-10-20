import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { formatInTimeZone } from "date-fns-tz";
import { db } from "@/db";
import { booking, classSession, coach, familyMember, offering, user } from "@/db/schema";
import { requireRole } from "@/lib/authz";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = { title: "Bookings · Admin" };

export default async function AdminBookingsPage() {
  await requireRole(["admin"], "/admin/bookings");
  const rows = await db
    .select({
      id: booking.id,
      status: booking.status,
      priceInrPaise: booking.priceInrPaise,
      createdAt: booking.createdAt,
      startsAt: classSession.startsAt,
      title: offering.title,
      coachName: coach.displayName,
      customerName: user.name,
      customerEmail: user.email,
      customerTz: user.timezone,
      child: familyMember.name,
    })
    .from(booking)
    .innerJoin(classSession, eq(booking.sessionId, classSession.id))
    .innerJoin(offering, eq(classSession.offeringId, offering.id))
    .innerJoin(coach, eq(offering.coachId, coach.id))
    .innerJoin(user, eq(booking.customerUserId, user.id))
    .leftJoin(familyMember, eq(booking.familyMemberId, familyMember.id))
    .orderBy(desc(booking.createdAt))
    .limit(200);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Bookings</h1>
      <p className="mt-1 text-sm text-muted">Latest 200. Class times in IST and the customer&apos;s own time zone.</p>
      {rows.length ? (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <span className="font-medium">{r.title}</span>
                    <span className="block text-xs text-muted">{r.coachName}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.customerName}
                    {r.child && <span className="text-muted"> for {r.child}</span>}
                    <span className="block text-xs text-muted">{r.customerEmail}</span>
                  </td>
                  <td className="px-4 py-3">
                    {formatInTimeZone(r.startsAt, "Asia/Kolkata", "d MMM, h:mm a")} IST
                    <span className="block text-xs text-muted">
                      {formatInTimeZone(r.startsAt, r.customerTz, "d MMM, h:mm a zzz")}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatInr(r.priceInrPaise / 100)}</td>
                  <td className="px-4 py-3 capitalize">{r.status.replace("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">No bookings yet.</p>
      )}
    </div>
  );
}
