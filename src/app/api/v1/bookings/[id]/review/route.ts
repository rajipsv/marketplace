import { revalidateCatalog } from "@/lib/catalog";
import { submitReview } from "@/server/services/reviews";
import { apiUser, fail, fromResult, readJson, unauthorized } from "@/server/api";

/** POST /api/v1/bookings/:id/review  { rating: 1–5, comment? } — only after attending, once per booking. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser(req);
  if (!user) return unauthorized();
  const b = await readJson(req);
  if (!b) return fail(400, "invalid_input", "Send a JSON body.");
  const r = await submitReview(user.id, (await params).id, {
    rating: b.rating as number,
    comment: typeof b.comment === "string" ? b.comment : null,
  });
  if (r.ok) revalidateCatalog();
  return fromResult(r, 201);
}
