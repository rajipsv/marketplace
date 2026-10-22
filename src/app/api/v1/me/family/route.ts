import { addFamilyMember, listFamily } from "@/server/services/family";
import { apiUser, fail, fromResult, ok, readJson, unauthorized } from "@/server/api";

/** GET /api/v1/me/family — children/family members. */
export async function GET(req: Request) {
  const user = await apiUser(req);
  if (!user) return unauthorized();
  return ok(await listFamily(user.id));
}

/** POST /api/v1/me/family  { name, birthYear?, notes? } */
export async function POST(req: Request) {
  const user = await apiUser(req);
  if (!user) return unauthorized();
  const body = await readJson(req);
  if (!body) return fail(400, "invalid_input", "Send a JSON body.");
  return fromResult(
    await addFamilyMember(user.id, {
      name: String(body.name ?? ""),
      birthYear: body.birthYear as string | number | null | undefined,
      notes: typeof body.notes === "string" ? body.notes : null,
    }),
    201,
  );
}
