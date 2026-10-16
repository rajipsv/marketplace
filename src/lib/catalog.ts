import "server-only";
import { eq, like, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { category, coach, offering } from "@/db/schema";
import { slugify } from "@/lib/utils";

/** A slug unique within `table`: base, base-2, base-3… */
export async function uniqueSlug(table: "coach" | "offering", text: string) {
  const base = slugify(text) || "item";
  const t = table === "coach" ? coach : offering;
  const taken = new Set(
    (await db.select({ slug: t.slug }).from(t).where(or(eq(t.slug, base), like(t.slug, `${base}-%`)))).map((r) => r.slug),
  );
  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
}

/** Category slugs that exist; drops anything else a client sent. */
export async function validCategories(slugs: string[]) {
  const all = new Set((await db.select({ slug: category.slug }).from(category)).map((c) => c.slug));
  return slugs.filter((s) => all.has(s));
}

/** Refresh public catalogue pages after teacher or class changes. */
export function revalidateCatalog(coachSlug?: string) {
  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/coaches");
  if (coachSlug) revalidatePath(`/coaches/${coachSlug}`);
  revalidatePath("/sessions/[slug]", "page");
}
