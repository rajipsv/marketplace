import { cancelBooking } from "@/server/services/bookings";
import { apiUser, fromResult, unauthorized } from "@/server/api";

/** POST /api/v1/bookings/:id/cancel — allowed up to 24 h before the class. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser(req);
  if (!user) return unauthorized();
  return fromResult(await cancelBooking(user.id, (await params).id));
}
