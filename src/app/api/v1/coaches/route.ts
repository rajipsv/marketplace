import { languages } from "@/lib/content";
import { getCoaches } from "@/lib/queries";
import { ok } from "@/server/api";

/** GET /api/v1/coaches?category=&language= */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const lang = sp.get("language")?.toLowerCase();
  const category = sp.get("category") ?? undefined;
  return ok(
    await getCoaches({
      category: category && /^[a-z0-9-]+$/.test(category) ? category : undefined,
      language: languages.find((l) => l.toLowerCase() === lang),
    }),
    { cache: "public" },
  );
}
