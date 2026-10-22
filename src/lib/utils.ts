import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { coachFacts, coachLocation, formatInr, initials } from "@shared/format";

/** URL for a public R2 object key (served via /media unless a public bucket URL is set). */
export function mediaUrl(key: string | null | undefined) {
  if (!key) return null;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  return base ? `${base}/${key}` : `/media/${key}`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}
