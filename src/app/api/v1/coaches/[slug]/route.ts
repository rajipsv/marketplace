import { getCoachBySlug } from "@/lib/queries";
import { fail, ok } from "@/server/api";

/** GET /api/v1/coaches/:slug — profile, categories, verified credentials and classes. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const c = await getCoachBySlug((await params).slug);
  if (!c) return fail(404, "not_found", "Coach not found.");
  return ok(c, { cache: "public" });
}
