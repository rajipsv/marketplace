import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { familyMember } from "@/db/schema";
import { firstError } from "@/lib/validation";
import type { Result } from "./result";

const MAX_MEMBERS = 8;
const thisYear = () => new Date().getUTCFullYear();

/** Accepts form strings (website) or numbers/null (mobile JSON). */
export const familyMemberInput = z.object({
  name: z.string().trim().min(1, "Please enter a name").max(60),
  birthYear: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v) => (v === "" || v == null ? null : Number(v)))
    .refine((v) => v === null || (Number.isInteger(v) && v >= thisYear() - 100 && v <= thisYear()), "Please enter a valid birth year"),
  notes: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v ?? "").trim().slice(0, 300) || null),
});
export type FamilyMemberInput = z.input<typeof familyMemberInput>;

export async function listFamily(userId: string) {
  return db
    .select({ id: familyMember.id, name: familyMember.name, birthYear: familyMember.birthYear, notes: familyMember.notes })
    .from(familyMember)
    .where(eq(familyMember.parentUserId, userId))
    .orderBy(asc(familyMember.createdAt));
}

export async function addFamilyMember(userId: string, raw: FamilyMemberInput): Promise<Result<{ id: string; name: string }>> {
  const parsed = familyMemberInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error), code: "invalid_input" };
  const existing = await db.select({ id: familyMember.id }).from(familyMember).where(eq(familyMember.parentUserId, userId));
  if (existing.length >= MAX_MEMBERS) return { ok: false, error: `You can add up to ${MAX_MEMBERS} family members.`, code: "conflict" };
  const [row] = await db
    .insert(familyMember)
    .values({ ...parsed.data, parentUserId: userId })
    .returning({ id: familyMember.id, name: familyMember.name });
  return { ok: true, ...row };
}

/** Past bookings keep their record; the attendee link is cleared (on delete set null). */
export async function removeFamilyMember(userId: string, id: string): Promise<Result> {
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "Not found.", code: "not_found" };
  const deleted = await db
    .delete(familyMember)
    .where(and(eq(familyMember.id, id), eq(familyMember.parentUserId, userId)))
    .returning({ id: familyMember.id });
  return deleted.length ? { ok: true } : { ok: false, error: "Not found.", code: "not_found" };
}
