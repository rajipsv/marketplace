import { ok } from "@/server/api";
import { getCategories } from "@/lib/queries";

/** GET /api/v1/categories */
export async function GET() {
  return ok(await getCategories(), { cache: "public" });
}
