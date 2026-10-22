import { removeFamilyMember } from "@/server/services/family";
import { apiUser, fromResult, unauthorized } from "@/server/api";

/** DELETE /api/v1/me/family/:id */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser(req);
  if (!user) return unauthorized();
  return fromResult(await removeFamilyMember(user.id, (await params).id));
}
