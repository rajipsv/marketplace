import { submitClassRequest } from "@/server/services/requests";
import { apiUser, fail, fromResult, readJson } from "@/server/api";

/** POST /api/v1/requests — request a time or a class (sign-in optional). */
export async function POST(req: Request) {
  const b = await readJson(req);
  if (!b) return fail(400, "invalid_input", "Send a JSON body.");
  const user = await apiUser(req);
  const s = (k: string) => (typeof b[k] === "string" ? (b[k] as string) : undefined);
  return fromResult(
    await submitClassRequest(
      {
        name: s("name") ?? user?.name ?? "",
        email: s("email") ?? user?.email ?? "",
        offeringId: s("offeringId"),
        subject: s("subject"),
        forWhom: s("forWhom"),
        preferredTimes: s("preferredTimes"),
        message: s("message"),
        timezone: s("timezone"),
      },
      user?.id ?? null,
    ),
    201,
  );
}
