import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Stars } from "@/components/rating";
import { db } from "@/db";
import { coach, review, user } from "@/db/schema";
import { assertRole, requireRole } from "@/lib/authz";
import { revalidateCatalog } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Reviews · Admin" };

async function setPublished(fd: FormData) {
  "use server";
  await assertRole(["admin"]);
  const id = z.string().uuid().parse(fd.get("id"));
  await db.update(review).set({ isPublished: fd.get("published") === "true" }).where(eq(review.id, id));
  revalidatePath("/admin/reviews");
  revalidateCatalog();
  revalidatePath("/coaches/[slug]", "page");
}

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  await requireRole(["admin"], "/admin/reviews");
  const hidden = (await searchParams).show === "hidden";

  const rows = await db
    .select({ r: review, coachName: coach.displayName, coachSlug: coach.slug, customer: user.name, email: user.email })
    .from(review)
    .innerJoin(coach, eq(review.coachId, coach.id))
    .innerJoin(user, eq(review.customerUserId, user.id))
    .where(eq(review.isPublished, !hidden))
    .orderBy(desc(review.createdAt))
    .limit(200);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Reviews</h1>
      <p className="mt-1 text-sm text-muted">
        Only families who attended a class can review it. Hide anything abusive, off-topic or containing personal details.
      </p>
      <nav aria-label="Filter" className="mt-5 flex gap-2">
        {[
          { label: "Published", href: "/admin/reviews", active: !hidden },
          { label: "Hidden", href: "/admin/reviews?show=hidden", active: hidden },
        ].map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium",
              t.active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:border-primary",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {rows.length ? (
        <ul className="mt-6 space-y-3">
          {rows.map(({ r, coachName, coachSlug, customer, email }) => (
            <li key={r.id} className="rounded-2xl border border-border bg-surface p-5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Stars value={r.rating} />
                <span className="text-xs text-muted">{r.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
              </div>
              {r.comment && <p className="mt-2 whitespace-pre-line">“{r.comment}”</p>}
              <p className="mt-2 text-xs text-muted">
                {customer} ({email}) →{" "}
                <Link href={`/coaches/${coachSlug}`} className="hover:text-foreground">
                  {coachName}
                </Link>
              </p>
              <form action={setPublished} className="mt-3">
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="published" value={hidden ? "true" : "false"} />
                <button className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-muted">
                  {hidden ? "Publish again" : "Hide review"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">
          No {hidden ? "hidden" : "published"} reviews yet.
        </p>
      )}
    </div>
  );
}
