// Catalogue loaded by `npm run db:seed`: categories plus the founding teachers.
// Teacher accounts created here are placeholders and cannot sign in; only facts
// the owner has confirmed are recorded (no invented bios or credentials).
// Times are UTC (ISO 8601); prices are whole US dollars here, stored as cents.

type Format = "group" | "one-on-one" | "weekly-class";
type Audience = "adults" | "kids" | "family";

type SeedCategory = {
  slug: string;
  name: string;
  blurb: string;
  icon: string; // lucide icon name, resolved in CategoryTile
  examples: string[];
};

type SeedCoach = {
  slug: string;
  name: string;
  title: string;
  city: string;
  languages: string[];
  yearsExperience: number;
  categories: string[];
  verified: boolean;
};

type SeedOffering = {
  id: string; // stable seed key only
  title: string;
  coachSlug: string;
  category: string;
  format: Format;
  audience: Audience;
  startsAt?: string; // first scheduled session for group / weekly classes
  durationMin: number;
  priceUsd: number;
  languages: string[];
  badge?: "Most loved" | "Free trial" | "Festival" | "New";
};

export const categories: SeedCategory[] = [
  {
    slug: "kids-culture",
    name: "Kids & Culture",
    blurb: "Dance, music, shlokas and mother-tongue classes",
    icon: "Music",
    examples: ["Bharatanatyam", "Carnatic vocal", "Tabla", "Telugu for kids"],
  },
  {
    slug: "spiritual-astrology",
    name: "Spiritual & Astrology",
    blurb: "Vedic astrology, kundli, numerology, Gita study",
    icon: "Sparkles",
    examples: ["Kundli reading", "Kundli matching", "Vastu", "Gita study"],
  },
  {
    slug: "puja-rituals",
    name: "Puja & Rituals",
    blurb: "Live-streamed pujas and havans by experienced priests",
    icon: "Flame",
    examples: ["Satyanarayan puja", "Griha pravesh", "Lakshmi puja"],
  },
  {
    slug: "yoga-fitness",
    name: "Yoga & Fitness",
    blurb: "Hatha, prenatal, pranayama, Bollywood fitness",
    icon: "Activity",
    examples: ["Morning hatha", "Prenatal yoga", "Senior yoga"],
  },
  {
    slug: "health-nutrition",
    name: "Health & Nutrition",
    blurb: "Ayurveda and Indian diet plans that fit US life",
    icon: "Leaf",
    examples: ["Ayurveda consult", "Diabetes diet", "PCOS nutrition"],
  },
  {
    slug: "mind-relationships",
    name: "Mind & Relationships",
    blurb: "Life, parenting and couples coaching, meditation",
    icon: "Heart",
    examples: ["Parenting coach", "Couples coaching", "Meditation"],
  },
  {
    slug: "career-learning",
    name: "Career & Learning",
    blurb: "Career coaching, tutoring, Vedic maths, SAT prep",
    icon: "GraduationCap",
    examples: ["Vedic maths", "Interview prep", "SAT math"],
  },
];

export const coaches: SeedCoach[] = [
  {
    slug: "sharan",
    name: "Sharan",
    title: "Chess coach",
    city: "Hyderabad",
    languages: ["English"], // TODO: confirm teaching languages
    yearsExperience: 0, // unknown — hidden on the site
    categories: ["career-learning"],
    verified: false,
  },
  {
    slug: "bhramaramba",
    name: "Bhramaramba",
    title: "Maths teacher",
    city: "", // unknown — shown as "India"
    languages: ["English"], // TODO: confirm teaching languages
    yearsExperience: 0,
    categories: ["career-learning"],
    verified: false,
  },
  {
    slug: "sai",
    name: "Sai",
    title: "Dance teacher",
    city: "", // unknown — shown as "India"
    languages: ["English"], // TODO: confirm teaching languages
    yearsExperience: 0,
    categories: ["kids-culture"],
    verified: false,
  },
];

// Format, duration and audience are defaults pending confirmation from the owner.
export const offerings: SeedOffering[] = [
  {
    id: "chess-sharan",
    title: "Chess Coaching with Sharan",
    coachSlug: "sharan",
    category: "career-learning",
    format: "one-on-one",
    audience: "family",
    durationMin: 60,
    priceUsd: 10,
    languages: ["English"],
  },
  {
    id: "maths-bhramaramba",
    title: "Maths Class with Bhramaramba",
    coachSlug: "bhramaramba",
    category: "career-learning",
    format: "one-on-one",
    audience: "kids",
    durationMin: 60,
    priceUsd: 5,
    languages: ["English"],
  },
  {
    id: "dance-sai",
    title: "Dance Class with Sai",
    coachSlug: "sai",
    category: "kids-culture",
    format: "one-on-one",
    audience: "family",
    durationMin: 60,
    priceUsd: 10,
    languages: ["English"],
  },
];

// Profile text is added only when the teacher provides it.
export const coachBios: Record<string, string | undefined> = {};

export const offeringDescriptions: Record<string, string | undefined> = {
  "chess-sharan": "Live one-on-one chess coaching over video, paced to the student's level.",
  "maths-bhramaramba": "Live one-on-one maths lessons over video, focused on the topics the student needs help with.",
  "dance-sai": "Live one-on-one dance lessons over video.",
};
