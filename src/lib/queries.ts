import "server-only";
import { cache } from "react";
import { and, arrayContains, asc, eq, gt, ilike, inArray, isNotNull, lte, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { category, classSession, coach, coachCategory, credential, offering } from "@/db/schema";
import type { Audience, Category, CoachSummary, Format, OfferingCard } from "@/lib/types";

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
  photoKey: coach.photoKey,
};

const offeringCardFields = {
  id: offering.id,
  slug: offering.slug,
  title: offering.title,
  format: offering.format,
  audience: offering.audience,
  durationMin: offering.durationMin,
  priceInrPaise: offering.priceInrPaise,
  languages: offering.languages,
  badge: offering.badge,
  coach: coachSummary,
};

const publicOffering = and(eq(offering.isActive, true), eq(coach.status, "approved"));

// ── Coaches ──────────────────────────────────────────

export async function getCoaches(filters: { category?: string; language?: string } = {}): Promise<CoachSummary[]> {
  const where: SQL[] = [eq(coach.status, "approved")];
  if (filters.language) where.push(arrayContains(coach.languages, [filters.language]));
  if (filters.category) {
    where.push(
      inArray(
        coach.id,
        db.select({ id: coachCategory.coachId }).from(coachCategory).where(eq(coachCategory.categorySlug, filters.category)),
      ),
    );
  }
  return db
    .select(coachSummary)
    .from(coach)
    .where(and(...where))
    .orderBy(asc(coach.createdAt));
}

export const getFeaturedCoaches = async (limit = 8) => (await getCoaches()).slice(0, limit);

// cache(): generateMetadata and the page share one query per request.
export const getCoachBySlug = cache(async (slug: string) => {
  const [row] = await db
    .select({ id: coach.id, bio: coach.bio, ...coachSummary })
    .from(coach)
    .where(and(eq(coach.slug, slug), eq(coach.status, "approved")));
  if (!row) return null;

  const [categories, credentials, offerings] = await Promise.all([
    db
      .select({ slug: category.slug, name: category.name })
      .from(coachCategory)
      .innerJoin(category, eq(coachCategory.categorySlug, category.slug))
      .where(eq(coachCategory.coachId, row.id))
      .orderBy(asc(category.sortOrder)),
    db
      .select({
        title: credential.title,
        issuer: credential.issuer,
        year: credential.year,
        verifiedAt: credential.verifiedAt,
      })
      .from(credential)
      .where(and(eq(credential.coachId, row.id), isNotNull(credential.verifiedAt)))
      .orderBy(asc(credential.year)),
    getOfferingCards({ coachId: row.id }),
  ]);

  const { id, ...coachFields } = row;
  void id; // internal key, not exposed to pages
  return { ...coachFields, categories, credentials, offerings };
});

// ── Offerings ────────────────────────────────────────

export type ExploreFilters = {
  q?: string;
  category?: string;
  audience?: Audience;
  language?: string;
  format?: Format;
  maxPriceInr?: number;
  coachId?: string;
};

/** Active offerings from approved coaches, filtered, each with its next upcoming session. */
export async function getOfferingCards(filters: ExploreFilters = {}): Promise<OfferingCard[]> {
  const where: (SQL | undefined)[] = [publicOffering];
  if (filters.category) where.push(eq(offering.categorySlug, filters.category));
  if (filters.audience) where.push(eq(offering.audience, filters.audience));
  if (filters.format) where.push(eq(offering.format, filters.format));
  if (filters.language) where.push(arrayContains(offering.languages, [filters.language]));
  if (filters.maxPriceInr != null) where.push(lte(offering.priceInrPaise, Math.round(filters.maxPriceInr * 100)));
  if (filters.coachId) where.push(eq(offering.coachId, filters.coachId));
  if (filters.q) {
    const term = `%${filters.q.replace(/[%_\\]/g, "\\$&")}%`;
    where.push(
      or(
        ilike(offering.title, term),
        ilike(offering.description, term),
        ilike(coach.displayName, term),
        ilike(coach.title, term),
        ilike(category.name, term),
      ),
    );
  }

  const rows = await db
    .select(offeringCardFields)
    .from(offering)
    .innerJoin(coach, eq(offering.coachId, coach.id))
    .innerJoin(category, eq(offering.categorySlug, category.slug))
    .where(and(...where))
    .orderBy(asc(offering.createdAt));

  const next = await nextSessionTimes(rows.map((r) => r.id));
  return rows.map(({ priceInrPaise, ...r }) => ({
    ...r,
    priceInr: priceInrPaise / 100,
    startsAt: next.get(r.id)?.toISOString() ?? null,
  }));
}

async function nextSessionTimes(offeringIds: string[]) {
  const next = new Map<string, Date>();
  if (!offeringIds.length) return next;
  const sessions = await db
    .selectDistinctOn([classSession.offeringId], {
      offeringId: classSession.offeringId,
      startsAt: classSession.startsAt,
    })
    .from(classSession)
    .where(
      and(
        inArray(classSession.offeringId, offeringIds),
        eq(classSession.status, "scheduled"),
        gt(classSession.startsAt, new Date()),
      ),
    )
    .orderBy(classSession.offeringId, asc(classSession.startsAt));
  for (const s of sessions) next.set(s.offeringId, s.startsAt);
  return next;
}

export const getOfferingBySlug = cache(async (slug: string) => {
  const [row] = await db
    .select({
      ...offeringCardFields,
      description: offering.description,
      capacity: offering.capacity,
      category: { slug: category.slug, name: category.name },
      coachBio: coach.bio,
    })
    .from(offering)
    .innerJoin(coach, eq(offering.coachId, coach.id))
    .innerJoin(category, eq(offering.categorySlug, category.slug))
    .where(and(eq(offering.slug, slug), publicOffering));
  if (!row) return null;

  const upcoming = await db
    .select({ id: classSession.id, startsAt: classSession.startsAt, endsAt: classSession.endsAt })
    .from(classSession)
    .where(
      and(
        eq(classSession.offeringId, row.id),
        eq(classSession.status, "scheduled"),
        gt(classSession.startsAt, new Date()),
      ),
    )
    .orderBy(asc(classSession.startsAt))
    .limit(8);

  const { priceInrPaise, ...rest } = row;
  return {
    ...rest,
    priceInr: priceInrPaise / 100,
    startsAt: upcoming[0]?.startsAt.toISOString() ?? null,
    upcoming: upcoming.map((s) => ({ id: s.id, startsAt: s.startsAt.toISOString(), endsAt: s.endsAt.toISOString() })),
  };
});

export type OfferingDetail = NonNullable<Awaited<ReturnType<typeof getOfferingBySlug>>>;
export type CoachDetail = NonNullable<Awaited<ReturnType<typeof getCoachBySlug>>>;
