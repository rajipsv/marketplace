import { previewCoupon } from "@/server/services/bookings";
import { apiUser, fail, ok, readJson, unauthorized } from "@/server/api";

/** POST /api/v1/coupons/preview  { code, offeringId } → { code, description, discountPaise, finalPaise } */
export async function POST(req: Request) {
  const user = await apiUser(req);
  if (!user) return unauthorized();
  const b = await readJson(req);
  if (!b) return fail(400, "invalid_input", "Send a JSON body.");
  const r = await previewCoupon(user.id, String(b.code ?? ""), String(b.offeringId ?? ""));
  return r.ok ? ok({ code: r.code, description: r.description, discountPaise: r.discountPaise, finalPaise: r.finalPaise }) : fail(422, "invalid_coupon", r.error);
}
