"use server";

import { and, eq, gt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { classRequest, offering } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { firstError, type FormState } from "@/lib/validation";

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null);

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Please enter a valid email").max(120),
  offeringId: z
    .string()
    .trim()
    .transform((v) => v || null)
    .pipe(z.string().uuid().nullable()),
  subject: text(120),
  forWhom: text(80),
  preferredTimes: text(200),
  message: text(1000),
  timezone: text(60),
});

export async function submitRequest(_prev: FormState, fd: FormData): Promise<FormState> {
  // Honeypot: real people never fill this hidden field.
  if (String(fd.get("website") ?? "")) return { ok: true, message: "Thank you! We'll be in touch." };

  const parsed = schema.safeParse({
    name: String(fd.get("name") ?? ""),
    email: String(fd.get("email") ?? ""),
    offeringId: String(fd.get("offeringId") ?? ""),
    subject: String(fd.get("subject") ?? ""),
    forWhom: String(fd.get("forWhom") ?? ""),
    preferredTimes: String(fd.get("preferredTimes") ?? ""),
    message: String(fd.get("message") ?? ""),
    timezone: String(fd.get("timezone") ?? ""),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const r = parsed.data;
  if (!r.offeringId && !r.subject) return { error: "Tell us what you'd like to learn." };

  // Light abuse limit: 5 requests per email per day.
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(classRequest)
    .where(and(eq(classRequest.email, r.email), gt(classRequest.createdAt, new Date(Date.now() - 86400_000))));
  if (n >= 5) return { error: "We've received your requests — we'll be in touch soon." };

  if (r.offeringId) {
    const [o] = await db.select({ id: offering.id }).from(offering).where(eq(offering.id, r.offeringId));
    if (!o) r.offeringId = null;
  }

  const session = await getSession();
  await db.insert(classRequest).values({ ...r, userId: session?.user.id ?? null });
  revalidatePath("/admin/requests");
  return { ok: true, message: "Thank you! We've got your request and will get back to you by email." };
}
