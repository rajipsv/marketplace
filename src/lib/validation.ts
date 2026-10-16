import { z } from "zod";
import { languages } from "@/lib/content";

/** R2 key that this user uploaded under the given prefix (see /api/uploads). */
const ownKey = (prefix: string, userId: string) =>
  z
    .string()
    .trim()
    .refine((k) => k === "" || (k.startsWith(`${prefix}/${userId}/`) && !k.includes("..")), "Invalid upload")
    .transform((k) => k || null);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null);

export function coachProfileSchema(userId: string) {
  return z.object({
    displayName: z.string().trim().min(2, "Please enter your name").max(60),
    title: z.string().trim().min(2, "Please describe what you teach").max(80),
    city: z.string().trim().max(60),
    bio: optionalText(1500),
    yearsExperience: z.coerce.number().int().min(0).max(70),
    languages: z.array(z.enum(languages as [string, ...string[]])).min(1, "Choose at least one language"),
    categories: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1, "Choose at least one category").max(3),
    photoKey: ownKey("public/coaches", userId),
    introVideoKey: ownKey("public/intro-videos", userId),
  });
}

export function credentialSchema(userId: string) {
  return z.object({
    title: z.string().trim().min(2).max(120),
    issuer: optionalText(120),
    year: z
      .string()
      .trim()
      .transform((v) => (v ? Number(v) : null))
      .refine((v) => v === null || (Number.isInteger(v) && v >= 1950 && v <= 2100), "Invalid year"),
    documentKey: ownKey("private/credentials", userId),
  });
}

export const offeringSchema = z.object({
  title: z.string().trim().min(4, "Please enter a class title").max(100),
  categorySlug: z.string().regex(/^[a-z0-9-]+$/),
  description: optionalText(2000),
  format: z.enum(["one-on-one", "group", "weekly-class"]),
  audience: z.enum(["adults", "kids", "family"]),
  durationMin: z.coerce.number().int().min(15).max(240),
  priceUsd: z.coerce.number().min(0).max(1000),
  capacity: z.coerce.number().int().min(1).max(50),
  languages: z.array(z.enum(languages as [string, ...string[]])).min(1, "Choose at least one language"),
  isActive: z.boolean(),
});

/** Reads a coach profile submission from FormData into the schema's input shape. */
export function coachProfileInput(fd: FormData) {
  return {
    displayName: String(fd.get("displayName") ?? ""),
    title: String(fd.get("title") ?? ""),
    city: String(fd.get("city") ?? ""),
    bio: String(fd.get("bio") ?? ""),
    yearsExperience: String(fd.get("yearsExperience") ?? "0") || "0",
    languages: fd.getAll("languages").map(String),
    categories: fd.getAll("categories").map(String),
    photoKey: String(fd.get("photoKey") ?? ""),
    introVideoKey: String(fd.get("introVideoKey") ?? ""),
  };
}

export type FormState = { error?: string; ok?: boolean; message?: string };

export function firstError(err: z.ZodError) {
  return err.issues[0]?.message ?? "Please check the form and try again.";
}
