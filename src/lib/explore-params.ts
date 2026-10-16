import { languages } from "@/lib/content";
import type { ExploreFilters } from "@/lib/queries";
import type { Audience, Format } from "@/lib/types";

export type RawSearchParams = Record<string, string | string[] | undefined>;

// URL value → audience. "me" covers adult sessions; family sessions are shown under "family".
export const audienceOptions = [
  { value: "me", label: "For me", audience: "adults" },
  { value: "kids", label: "For my child", audience: "kids" },
  { value: "family", label: "For family", audience: "family" },
] as const satisfies readonly { value: string; label: string; audience: Audience }[];

export const formatOptions = [
  { value: "one-on-one", label: "1-on-1 video" },
  { value: "group", label: "Live group" },
  { value: "weekly-class", label: "Weekly class" },
] as const satisfies readonly { value: Format; label: string }[];

export const priceOptions = [
  { value: "0", label: "Free" },
  { value: "25", label: "Up to $25" },
  { value: "50", label: "Up to $50" },
  { value: "100", label: "Up to $100" },
] as const;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

/** Parses and validates explore query params; unknown values are ignored. */
export function parseExploreParams(sp: RawSearchParams): ExploreFilters {
  const q = first(sp.q)?.slice(0, 80);
  const category = first(sp.category);
  const audience = audienceOptions.find((a) => a.value === first(sp.for))?.audience;
  const format = formatOptions.find((f) => f.value === first(sp.format))?.value;
  const langParam = first(sp.language)?.toLowerCase();
  const language = languages.find((l) => l.toLowerCase() === langParam);
  const price = priceOptions.find((p) => p.value === first(sp.price))?.value;

  return {
    q,
    category: category && /^[a-z0-9-]+$/.test(category) ? category : undefined,
    audience,
    format,
    language,
    maxPriceUsd: price != null ? Number(price) : undefined,
  };
}
