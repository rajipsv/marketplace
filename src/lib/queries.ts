import "server-only";
import { and, asc, eq, gt, inArray } from "drizzle-orm";
import { db } from "@/db";
import { category, classSession, coach, offering } from "@/db/schema";
import type { Category, CoachSummary, OfferingCard } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  return db
    .select({
      slug: category.slug,
      name: category.name,
      blurb: category.blurb,
      icon: category.icon,
      examples: category.examples,
    })
    .from(category)
    .orderBy(asc(category.sortOrder));
}

const coachSummary = {
  slug: coach.slug,
  name: coach.displayName,
  title: coach.title,
  city: coach.city,
  languages: coach.languages,
  yearsExperience: coach.yearsExperience,
  verified: coach.verified,
};

export async function getFeaturedCoaches(limit = 8): Promise<CoachSummary[]> {
  return db
    .select(coachSummary)
    .from(coach)
    .where(eq(coach.status, "approved"))
    .orderBy(asc(coach.createdAt))
    .limit(limit);
}

/** Active offerings from approved coaches, each with its next upcoming session time. */
export async function getOfferingCards(): Promise<OfferingCard[]> {
  const rows = await db
    .select({
      id: offering.id,
      slug: offering.slug,
      title: offering.title,
      format: offering.format,
      audience: offering.audience,
      durationMin: offering.durationMin,
      priceUsdCents: offering.priceUsdCents,
      languages: offering.languages,
      badge: offering.badge,
      coach: coachSummary,
    })
    .from(offering)
    .innerJoin(coach, eq(offering.coachId, coach.id))
    .where(and(eq(offering.isActive, true), eq(coach.status, "approved")))
    .orderBy(asc(offering.createdAt));

  const next = new Map<string, Date>();
  if (rows.length) {
    const sessions = await db
      .selectDistinctOn([classSession.offeringId], {
        offeringId: classSession.offeringId,
        startsAt: classSession.startsAt,
      })
      .from(classSession)
      .where(
        and(
          inArray(
            classSession.offeringId,
            rows.map((r) => r.id),
          ),
          eq(classSession.status, "scheduled"),
          gt(classSession.startsAt, new Date()),
        ),
      )
      .orderBy(classSession.offeringId, asc(classSession.startsAt));
    for (const s of sessions) next.set(s.offeringId, s.startsAt);
  }

  return rows.map(({ priceUsdCents, ...r }) => ({
    ...r,
    priceUsd: priceUsdCents / 100,
    startsAt: next.get(r.id)?.toISOString() ?? null,
  }));
}
