import { createBooking } from "@/server/services/bookings";
import { apiUser, fail, fromResult, readJson, unauthorized } from "@/server/api";

/**
 * POST /api/v1/bookings
 * { offeringId, attendee: "self" | familyMemberId, startsAt? (1-on-1, ISO from availability), sessionId? (group), coupon? }
 * → 201 { bookingId, status: "confirmed" | "pending_payment" }
 */
export async function POST(req: Request) {
  const user = await apiUser(req);
  if (!user) return unauthorized();
  const b = await readJson(req);
  if (!b) return fail(400, "invalid_input", "Send a JSON body.");
  const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
  return fromResult(
    await createBooking(user.id, {
      offeringId: String(b.offeringId ?? ""),
      attendee: str(b.attendee) ?? "self",
      startsAt: str(b.startsAt),
      sessionId: str(b.sessionId),
      coupon: str(b.coupon),
    }),
    201,
  );
}
