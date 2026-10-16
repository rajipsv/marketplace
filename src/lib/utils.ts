import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsd(amount: number) {
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter((p) => /^[A-Z]/.test(p))
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

/** "Hyderabad, India", or just "India" when the city isn't known. */
export function coachLocation(city: string) {
  return city ? `${city}, India` : "India";
}

/** Profile facts that are known, e.g. ["Hyderabad, India", "12 yrs", "English, Telugu"]. */
export function coachFacts(c: { city: string; yearsExperience: number; languages: string[] }, yearsLabel = "yrs") {
  return [
    coachLocation(c.city),
    c.yearsExperience > 0 ? `${c.yearsExperience} ${yearsLabel}` : null,
    c.languages.length ? c.languages.join(", ") : null,
  ].filter(Boolean) as string[];
}
