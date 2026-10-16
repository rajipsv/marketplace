"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { familyMember } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { firstError, type FormState } from "@/lib/validation";

const thisYear = new Date().getUTCFullYear();
const member = z.object({
  name: z.string().trim().min(1, "Please enter a name").max(60),
  birthYear: z
    .string()
    .trim()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v >= thisYear - 100 && v <= thisYear), "Please enter a valid birth year"),
  notes: z
    .string()
    .trim()
    .max(300)
    .transform((v) => v || null),
});

export async function addFamilyMember(_prev: FormState, fd: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in again." };
  const parsed = member.safeParse({
    name: String(fd.get("name") ?? ""),
    birthYear: String(fd.get("birthYear") ?? ""),
    notes: String(fd.get("notes") ?? ""),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const existing = await db.select({ id: familyMember.id }).from(familyMember).where(eq(familyMember.parentUserId, session.user.id));
  if (existing.length >= 8) return { error: "You can add up to 8 family members." };

  await db.insert(familyMember).values({ ...parsed.data, parentUserId: session.user.id });
  revalidatePath("/account/family");
  return { ok: true, message: `${parsed.data.name} added.` };
}

export async function removeFamilyMember(fd: FormData) {
  const session = await getSession();
  if (!session) return;
  const id = z.string().uuid().parse(fd.get("id"));
  // Past bookings keep their record; the attendee link is cleared (on delete set null).
  await db.delete(familyMember).where(and(eq(familyMember.id, id), eq(familyMember.parentUserId, session.user.id)));
  revalidatePath("/account/family");
}
