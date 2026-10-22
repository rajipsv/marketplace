import { parseExploreParams } from "@/lib/explore-params";
import { getOfferingCards } from "@/lib/queries";
import { ok } from "@/server/api";

/**
 * GET /api/v1/offerings?q=&category=&for=me|kids|family&language=&format=&price=
 * Same filters as the website's Explore page. Prices are in rupees.
 */
export async function GET(req: Request) {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  return ok(await getOfferingCards(parseExploreParams(params)), { cache: "public" });
}
