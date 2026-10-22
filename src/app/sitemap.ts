import type { MetadataRoute } from "next";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { category, coach, offering } from "@/db/schema";
import { siteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [coaches, offerings, categories] = await Promise.all([
    db.select({ slug: coach.slug, updatedAt: coach.updatedAt }).from(coach).where(eq(coach.status, "approved")),
    db
      .select({ slug: offering.slug, updatedAt: offering.updatedAt })
      .from(offering)
      .innerJoin(coach, eq(offering.coachId, coach.id))
      .where(and(eq(offering.isActive, true), eq(coach.status, "approved"))),
    db.select({ slug: category.slug }).from(category),
  ]);

  const page = (path: string, priority: number, lastModified?: Date): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`,
    lastModified,
    priority,
  });

  return [
    page("/", 1),
    page("/explore", 0.9),
    page("/coaches", 0.8),
    ...categories.map((c) => page(`/explore?category=${c.slug}`, 0.7)),
    ...offerings.map((o) => page(`/sessions/${o.slug}`, 0.8, o.updatedAt)),
    ...coaches.map((c) => page(`/coaches/${c.slug}`, 0.7, c.updatedAt)),
    page("/teach", 0.6),
    page("/request", 0.5),
    ...["/about", "/contact", "/terms", "/privacy", "/refunds", "/delivery", "/disclaimer", "/coach-agreement"].map((p) =>
      page(p, 0.3),
    ),
  ];
}
