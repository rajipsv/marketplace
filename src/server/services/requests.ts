import "server-only";
import { and, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { classRequest, offering } from "@/db/schema";
import { firstError } from "@/lib/validation";
import type { Result } from "./result";

const text = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v ?? "").trim().slice(0, max) || null);

export const classRequestInput = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Please enter a valid email").max(120),
  offeringId: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v ?? "").trim() || null)
    .pipe(z.string().uuid().nullable()),
  subject: text(120),
  forWhom: text(80),
  preferredTimes: text(200),
  message: text(1000),
  timezone: text(60),
});
export type ClassRequestInput = z.input<typeof classRequestInput>;

const DAILY_LIMIT = 5;

export async function submitClassRequest(raw: ClassRequestInput, userId: string | null): Promise<Result> {
  const parsed = classRequestInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error), code: "invalid_input" };
  const r = parsed.data;
  if (!r.offeringId && !r.subject) return { ok: false, error: "Tell us what you'd like to learn.", code: "invalid_input" };

  // Light abuse limit per email per day.
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(classRequest)
    .where(and(eq(classRequest.email, r.email), gt(classRequest.createdAt, new Date(Date.now() - 86400_000))));
  if (n >= DAILY_LIMIT) return { ok: false, error: "We've received your requests — we'll be in touch soon.", code: "rate_limited" };

  if (r.offeringId) {
    const [o] = await db.select({ id: offering.id }).from(offering).where(eq(offering.id, r.offeringId));
    if (!o) r.offeringId = null;
  }
  await db.insert(classRequest).values({ ...r, userId });
  return { ok: true };
}
