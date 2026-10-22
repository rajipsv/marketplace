import { getOfferingBySlug } from "@/lib/queries";
import { fail, ok } from "@/server/api";

/** GET /api/v1/offerings/:slug — class details, coach summary and upcoming dates. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const offering = await getOfferingBySlug((await params).slug);
  if (!offering) return fail(404, "not_found", "Class not found.");
  return ok(offering, { cache: "public" });
}
