// Loads the sample catalogue into the database. Safe to re-run: existing rows
// are matched by email / slug / coach+start time; only coach bios and offering
// descriptions are refreshed.
//   npm run db:seed
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { categories, coachBios, coaches, offeringDescriptions, offerings } from "./seed-data";

const client = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });
const db = drizzle(client, { schema, casing: "snake_case" });

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function main() {
  await db
    .insert(schema.category)
    .values(categories.map((c, i) => ({ ...c, sortOrder: i })))
    .onConflictDoNothing();
  console.log(`categories: ${categories.length}`);

  const coachIds = new Map<string, string>();
  for (const c of coaches) {
    const email = `${c.slug}@example.com`;
    await db
      .insert(schema.user)
      .values({ id: randomUUID(), name: c.name, email, emailVerified: true, role: "coach", timezone: "Asia/Kolkata" })
      .onConflictDoNothing();
    const [u] = await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.email, email));

    await db
      .insert(schema.coach)
      .values({
        userId: u.id,
        slug: c.slug,
        displayName: c.name,
        title: c.title,
        city: c.city,
        languages: c.languages,
        yearsExperience: c.yearsExperience,
        verified: c.verified,
        status: "approved",
        bio: coachBios[c.slug] ?? null,
      })
      .onConflictDoUpdate({ target: schema.coach.slug, set: { bio: coachBios[c.slug] ?? null } });
    const [row] = await db.select({ id: schema.coach.id }).from(schema.coach).where(eq(schema.coach.slug, c.slug));
    coachIds.set(c.slug, row.id);

    await db
      .insert(schema.coachCategory)
      .values(c.categories.map((categorySlug) => ({ coachId: row.id, categorySlug })))
      .onConflictDoNothing();
  }
  console.log(`coaches: ${coaches.length}`);

  for (const o of offerings) {
    const coachId = coachIds.get(o.coachSlug)!;
    const slug = slugify(o.title);
    await db
      .insert(schema.offering)
      .values({
        coachId,
        categorySlug: o.category,
        slug,
        title: o.title,
        format: o.format,
        audience: o.audience,
        durationMin: o.durationMin,
        priceInrPaise: Math.round(o.priceInr * 100),
        capacity: o.format === "one-on-one" ? 1 : 12,
        languages: o.languages,
        badge: o.badge ?? null,
        description: offeringDescriptions[o.id] ?? null,
      })
      .onConflictDoUpdate({ target: schema.offering.slug, set: { description: offeringDescriptions[o.id] ?? null } });
    const [row] = await db
      .select({ id: schema.offering.id, capacity: schema.offering.capacity })
      .from(schema.offering)
      .where(eq(schema.offering.slug, slug));

    if (o.startsAt) {
      // Weekly classes get four weekly sessions; group sessions get one.
      const count = o.format === "weekly-class" ? 4 : 1;
      const first = new Date(o.startsAt).getTime();
      await db
        .insert(schema.classSession)
        .values(
          Array.from({ length: count }, (_, i) => {
            const startsAt = new Date(first + i * 7 * 24 * 3600 * 1000);
            return {
              offeringId: row.id,
              coachId,
              startsAt,
              endsAt: new Date(startsAt.getTime() + o.durationMin * 60 * 1000),
              capacity: row.capacity,
            };
          }),
        )
        .onConflictDoNothing();
    }
  }
  console.log(`offerings: ${offerings.length}`);
}

main()
  .then(() => console.log("Seed complete"))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => client.end());
