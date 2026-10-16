"use server";

import { fromZonedTime } from "date-fns-tz";
import { and, eq, gt, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { availabilityRule, classSession, coach, coachCategory, offering } from "@/db/schema";
import { assertApprovedCoach } from "@/lib/authz";
import { revalidateCatalog, uniqueSlug, validCategories } from "@/lib/catalog";
import { coachProfileInput, coachProfileSchema, firstError, offeringSchema, type FormState } from "@/lib/validation";

// ── Profile ──────────────────────────────────────────

export async function updateProfile(_prev: FormState, fd: FormData): Promise<FormState> {
  const { user, coach: own } = await assertApprovedCoach();
  const parsed = coachProfileSchema(user.id).safeParse(coachProfileInput(fd));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const p = parsed.data;
  const categories = await validCategories(p.categories);
  if (!categories.length) return { error: "Choose at least one category" };

  await db.transaction(async (tx) => {
    await tx
      .update(coach)
      .set({
        displayName: p.displayName,
        title: p.title,
        city: p.city,
        bio: p.bio,
        yearsExperience: p.yearsExperience,
        languages: p.languages,
        // Keep the existing upload when the form didn't send a new one.
        photoKey: p.photoKey ?? own.photoKey,
        introVideoKey: p.introVideoKey ?? own.introVideoKey,
      })
      .where(eq(coach.id, own.id));
    await tx.delete(coachCategory).where(eq(coachCategory.coachId, own.id));
    await tx.insert(coachCategory).values(categories.map((categorySlug) => ({ coachId: own.id, categorySlug })));
  });

  revalidatePath("/coach", "layout");
  revalidateCatalog(own.slug);
  return { ok: true, message: "Profile saved." };
}

// ── Weekly availability (coach's own time zone) ──────

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const windows = z.array(z.object({ weekday: z.number().int().min(0).max(6), start: hhmm, end: hhmm })).max(70);

export async function saveAvailability(_prev: FormState, fd: FormData): Promise<FormState> {
  const { coach: own } = await assertApprovedCoach();
  let raw: unknown;
  try {
    raw = JSON.parse(String(fd.get("windows") ?? "[]"));
  } catch {
    return { error: "Could not read your hours. Please try again." };
  }
  const parsed = windows.safeParse(raw);
  if (!parsed.success) return { error: "Please check the times you entered." };

  const rules = parsed.data.map((w) => ({ weekday: w.weekday, startMinute: toMinutes(w.start), endMinute: toMinutes(w.end) }));
  for (const r of rules) if (r.startMinute >= r.endMinute) return { error: "Each end time must be after its start time." };
  for (let d = 0; d < 7; d++) {
    const day = rules.filter((r) => r.weekday === d).sort((a, b) => a.startMinute - b.startMinute);
    for (let i = 1; i < day.length; i++)
      if (day[i].startMinute < day[i - 1].endMinute) return { error: "Some time ranges overlap on the same day." };
  }

  await db.transaction(async (tx) => {
    await tx.delete(availabilityRule).where(eq(availabilityRule.coachId, own.id));
    if (rules.length) await tx.insert(availabilityRule).values(rules.map((r) => ({ ...r, coachId: own.id })));
  });
  revalidatePath("/coach/availability");
  return { ok: true, message: "Weekly hours saved." };
}

// ── Classes ──────────────────────────────────────────

export async function saveOffering(_prev: FormState, fd: FormData): Promise<FormState> {
  const { coach: own } = await assertApprovedCoach();
  const parsed = offeringSchema.safeParse({
    title: String(fd.get("title") ?? ""),
    categorySlug: String(fd.get("categorySlug") ?? ""),
    description: String(fd.get("description") ?? ""),
    format: String(fd.get("format") ?? ""),
    audience: String(fd.get("audience") ?? ""),
    durationMin: String(fd.get("durationMin") ?? ""),
    priceUsd: String(fd.get("priceUsd") ?? ""),
    capacity: fd.get("format") === "one-on-one" ? "1" : String(fd.get("capacity") ?? "1"),
    languages: fd.getAll("languages").map(String),
    isActive: fd.get("isActive") === "on",
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const o = parsed.data;
  if (!(await validCategories([o.categorySlug])).length) return { error: "Choose a category" };

  const values = {
    title: o.title,
    categorySlug: o.categorySlug,
    description: o.description,
    format: o.format,
    audience: o.audience,
    durationMin: o.durationMin,
    priceUsdCents: Math.round(o.priceUsd * 100),
    capacity: o.capacity,
    languages: o.languages,
    isActive: o.isActive,
  };

  const id = String(fd.get("id") ?? "");
  let savedId = id;
  if (id) {
    const [row] = await db
      .update(offering)
      .set(values)
      .where(and(eq(offering.id, id), eq(offering.coachId, own.id)))
      .returning({ id: offering.id });
    if (!row) return { error: "Class not found." };
  } else {
    const slug = await uniqueSlug("offering", `${o.title} ${own.displayName}`);
    const [row] = await db.insert(offering).values({ ...values, slug, coachId: own.id }).returning({ id: offering.id });
    savedId = row.id;
  }

  revalidatePath("/coach", "layout");
  revalidateCatalog(own.slug);
  if (!id) redirect(`/coach/classes/${savedId}?created=1`);
  return { ok: true, message: "Class saved." };
}

// ── Scheduled sessions for group / weekly classes ────

const sessionInput = z.object({
  offeringId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: hhmm,
  repeatWeeks: z.coerce.number().int().min(1).max(12),
});

export async function addSessions(_prev: FormState, fd: FormData): Promise<FormState> {
  const { coach: own } = await assertApprovedCoach();
  const parsed = sessionInput.safeParse({
    offeringId: fd.get("offeringId"),
    date: fd.get("date"),
    time: fd.get("time"),
    repeatWeeks: fd.get("repeatWeeks") || "1",
  });
  if (!parsed.success) return { error: "Please choose a valid date and time." };
  const s = parsed.data;

  const [o] = await db
    .select({ id: offering.id, durationMin: offering.durationMin, capacity: offering.capacity, format: offering.format })
    .from(offering)
    .where(and(eq(offering.id, s.offeringId), eq(offering.coachId, own.id)));
  if (!o) return { error: "Class not found." };
  if (o.format === "one-on-one") return { error: "1-on-1 classes are booked from your weekly hours." };

  const first = fromZonedTime(`${s.date}T${s.time}:00`, own.timezone);
  if (first.getTime() < Date.now() + 60 * 60 * 1000) return { error: "Please choose a time at least an hour from now." };

  const week = 7 * 24 * 60 * 60 * 1000;
  const rows = Array.from({ length: s.repeatWeeks }, (_, i) => {
    const startsAt = new Date(first.getTime() + i * week);
    return { startsAt, endsAt: new Date(startsAt.getTime() + o.durationMin * 60 * 1000) };
  });

  for (const r of rows) {
    const clash = await db
      .select({ id: classSession.id })
      .from(classSession)
      .where(
        and(
          eq(classSession.coachId, own.id),
          eq(classSession.status, "scheduled"),
          lt(classSession.startsAt, r.endsAt),
          gt(classSession.endsAt, r.startsAt),
        ),
      )
      .limit(1);
    if (clash.length) return { error: "One of these times overlaps a session you already have." };
  }

  await db.insert(classSession).values(
    rows.map((r) => ({ ...r, offeringId: o.id, coachId: own.id, capacity: o.capacity })),
  );
  revalidatePath(`/coach/classes/${o.id}`);
  revalidateCatalog(own.slug);
  return { ok: true, message: rows.length === 1 ? "Session added." : `${rows.length} sessions added.` };
}

export async function cancelSession(fd: FormData) {
  const { coach: own } = await assertApprovedCoach();
  const id = z.string().uuid().parse(fd.get("sessionId"));
  // TODO(Phase 4): notify and refund booked students before cancelling.
  const [row] = await db
    .update(classSession)
    .set({ status: "cancelled" })
    .where(and(eq(classSession.id, id), eq(classSession.coachId, own.id), eq(classSession.status, "scheduled")))
    .returning({ offeringId: classSession.offeringId });
  if (row) revalidatePath(`/coach/classes/${row.offeringId}`);
  revalidateCatalog(own.slug);
}
