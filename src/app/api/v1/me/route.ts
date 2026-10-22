import { apiUser, ok, unauthorized } from "@/server/api";

/** GET /api/v1/me — the signed-in user. */
export async function GET(req: Request) {
  const user = await apiUser(req);
  if (!user) return unauthorized();
  return ok({ id: user.id, name: user.name, email: user.email, role: user.role, timezone: user.timezone });
}
