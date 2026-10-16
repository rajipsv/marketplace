// View models passed from server queries to UI components.

export type Format = "group" | "one-on-one" | "weekly-class";
export type Audience = "adults" | "kids" | "family";
export type Badge = "Most loved" | "Free trial" | "Festival" | "New";

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  icon: string;
  examples: string[];
};

export type CoachSummary = {
  slug: string;
  name: string;
  title: string;
  city: string;
  languages: string[];
  yearsExperience: number;
  verified: boolean;
  photoKey: string | null;
};

export type OfferingCard = {
  id: string;
  slug: string;
  title: string;
  format: Format;
  audience: Audience;
  startsAt: string | null; // next scheduled session (UTC ISO); null for 1-on-1
  durationMin: number;
  priceUsd: number;
  languages: string[];
  badge: Badge | null;
  coach: CoachSummary;
};
