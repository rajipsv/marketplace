import { listBookings } from "@/server/services/bookings";
import { apiUser, ok, unauthorized } from "@/server/api";

/** GET /api/v1/me/bookings — all bookings, newest class first, with canCancel. */
export async function GET(req: Request) {
  const user = await apiUser(req);
  if (!user) return unauthorized();
  return ok(await listBookings(user.id));
}
