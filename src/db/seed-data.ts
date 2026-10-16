// Sample catalogue loaded by `npm run db:seed` for development and demos.
// Coach names are fictional and their accounts cannot sign in.
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
    slug: "lakshmi-raghavan",
    name: "Lakshmi Raghavan",
    title: "Bharatanatyam guru · Kalakshetra trained",
    city: "Chennai",
    languages: ["English", "Tamil"],
    yearsExperience: 18,
    categories: ["kids-culture"],
    verified: true,
  },
  {
    slug: "pandit-arvind-sharma",
    name: "Pt. Arvind Sharma",
    title: "Vedic astrologer · Kundli & muhurat",
    city: "Varanasi",
    languages: ["Hindi", "English"],
    yearsExperience: 22,
    categories: ["spiritual-astrology", "puja-rituals"],
    verified: true,
  },
  {
    slug: "meera-iyer",
    name: "Meera Iyer",
    title: "Prenatal & therapeutic yoga teacher",
    city: "Bengaluru",
    languages: ["English", "Kannada", "Tamil"],
    yearsExperience: 11,
    categories: ["yoga-fitness"],
    verified: true,
  },
  {
    slug: "dr-sameer-kulkarni",
    name: "Dr. Sameer Kulkarni",
    title: "BAMS · Ayurveda & lifestyle consultant",
    city: "Pune",
    languages: ["English", "Marathi", "Hindi"],
    yearsExperience: 14,
    categories: ["health-nutrition"],
    verified: true,
  },
  {
    slug: "srinivas-rao",
    name: "Srinivas Rao",
    title: "Carnatic vocalist · AIR graded artist",
    city: "Hyderabad",
    languages: ["Telugu", "English"],
    yearsExperience: 20,
    categories: ["kids-culture"],
    verified: true,
  },
  {
    slug: "anjali-mehta",
    name: "Anjali Mehta",
    title: "Parenting & life coach (ICF-PCC)",
    city: "Ahmedabad",
    languages: ["English", "Gujarati", "Hindi"],
    yearsExperience: 9,
    categories: ["mind-relationships"],
    verified: true,
  },
];

export const offerings: SeedOffering[] = [
  {
    id: "o1",
    title: "Bharatanatyam for Beginners (Ages 6–10)",
    coachSlug: "lakshmi-raghavan",
    category: "kids-culture",
    format: "weekly-class",
    audience: "kids",
    startsAt: "2026-10-24T13:00:00Z",
    durationMin: 45,
    priceUsd: 0,
    languages: ["English", "Tamil"],
    badge: "Free trial",
  },
  {
    id: "o2",
    title: "Diwali Lakshmi Puja — Live from Varanasi",
    coachSlug: "pandit-arvind-sharma",
    category: "puja-rituals",
    format: "group",
    audience: "family",
    startsAt: "2026-11-08T23:30:00Z",
    durationMin: 60,
    priceUsd: 21,
    languages: ["Hindi", "English"],
    badge: "Festival",
  },
  {
    id: "o3",
    title: "Kundli Reading & Life Guidance",
    coachSlug: "pandit-arvind-sharma",
    category: "spiritual-astrology",
    format: "one-on-one",
    audience: "adults",
    durationMin: 45,
    priceUsd: 49,
    languages: ["Hindi", "English"],
    badge: "Most loved",
  },
  {
    id: "o4",
    title: "Prenatal Yoga — Weekend Mornings",
    coachSlug: "meera-iyer",
    category: "yoga-fitness",
    format: "group",
    audience: "adults",
    startsAt: "2026-10-25T13:30:00Z",
    durationMin: 60,
    priceUsd: 15,
    languages: ["English"],
  },
  {
    id: "o5",
    title: "Ayurveda Consultation: Diet for Your Dosha",
    coachSlug: "dr-sameer-kulkarni",
    category: "health-nutrition",
    format: "one-on-one",
    audience: "adults",
    durationMin: 40,
    priceUsd: 45,
    languages: ["English", "Marathi", "Hindi"],
  },
  {
    id: "o6",
    title: "Carnatic Vocal Basics for Kids",
    coachSlug: "srinivas-rao",
    category: "kids-culture",
    format: "weekly-class",
    audience: "kids",
    startsAt: "2026-10-24T14:30:00Z",
    durationMin: 40,
    priceUsd: 0,
    languages: ["Telugu", "English"],
    badge: "Free trial",
  },
  {
    id: "o7",
    title: "Raising Kids Between Two Cultures",
    coachSlug: "anjali-mehta",
    category: "mind-relationships",
    format: "group",
    audience: "adults",
    startsAt: "2026-10-28T00:30:00Z",
    durationMin: 75,
    priceUsd: 19,
    languages: ["English", "Gujarati", "Hindi"],
    badge: "New",
  },
  {
    id: "o8",
    title: "Kundli Matching for Marriage",
    coachSlug: "pandit-arvind-sharma",
    category: "spiritual-astrology",
    format: "one-on-one",
    audience: "family",
    durationMin: 60,
    priceUsd: 65,
    languages: ["Hindi", "English"],
  },
];
