"use server";

import { redirect } from "next/navigation";
import type { z } from "zod";
import { db } from "@/db";
import { coach, coachCategory, credential } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { getOwnCoach } from "@/lib/authz";
import { uniqueSlug, validCategories } from "@/lib/catalog";
import {
  coachProfileInput,
  coachProfileSchema,
  credentialSchema,
  firstError,
  type FormState,
} from "@/lib/validation";

export async function submitApplication(_prev: FormState, fd: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in again." };
  const userId = session.user.id;
  if (await getOwnCoach(userId)) redirect("/teach/apply");

  if (fd.get("acceptAgreement") !== "on") return { error: "Please accept the Coach agreement to apply." };

  const parsed = coachProfileSchema(userId).safeParse(coachProfileInput(fd));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const p = parsed.data;

  const categories = await validCategories(p.categories);
  if (!categories.length) return { error: "Choose at least one category" };

  const creds: z.output<ReturnType<typeof credentialSchema>>[] = [];
  for (const i of [0, 1, 2]) {
    const title = String(fd.get(`credTitle_${i}`) ?? "").trim();
    if (!title) continue;
    const c = credentialSchema(userId).safeParse({
      title,
      issuer: String(fd.get(`credIssuer_${i}`) ?? ""),
      year: String(fd.get(`credYear_${i}`) ?? ""),
      documentKey: String(fd.get(`credDoc_${i}`) ?? ""),
    });
    if (!c.success) return { error: `Qualification ${i + 1}: ${firstError(c.error)}` };
    creds.push(c.data);
  }

  const slug = await uniqueSlug("coach", p.displayName);
  await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(coach)
      .values({
        userId,
        slug,
        displayName: p.displayName,
        title: p.title,
        city: p.city,
        bio: p.bio,
        yearsExperience: p.yearsExperience,
        languages: p.languages,
        photoKey: p.photoKey,
        introVideoKey: p.introVideoKey,
        status: "pending",
        agreementAcceptedAt: new Date(),
      })
      .returning({ id: coach.id });
    await tx.insert(coachCategory).values(categories.map((categorySlug) => ({ coachId: row.id, categorySlug })));
    if (creds.length) await tx.insert(credential).values(creds.map((c) => ({ ...c, coachId: row.id })));
  });

  redirect("/teach/apply");
}
