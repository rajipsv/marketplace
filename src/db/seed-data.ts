// Catalogue loaded by `npm run db:seed`: categories plus the founding teachers.
// Teacher accounts created here are placeholders and cannot sign in; only facts
// the owner has confirmed are recorded (no invented bios or credentials).
// Times are UTC (ISO 8601); prices are whole rupees here, stored as paise.

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
  priceInr: number;
  languages: string[];
  badge?: "Most loved" | "Free trial" | "Festival" | "New";
};

export const categories: SeedCategory[] = [
  {
    slug: "academics-chess-coding",
    name: "Academics, Chess & Coding",
    blurb: "Maths, science, test prep, chess and coding with expert tutors and coaches",
    icon: "GraduationCap",
    examples: ["Maths", "Science", "SAT prep", "Chess", "Coding for kids"],
  },
  {
    slug: "music-dance-arts",
    name: "Music, Dance & Arts",
    blurb: "Vocal, instruments, classical and Bollywood dance, drawing and art",
    icon: "Music",
    examples: ["Carnatic vocal", "Keyboard", "Bharatanatyam", "Bollywood dance", "Drawing"],
  },
  {
    slug: "fitness-yoga-sports",
    name: "Fitness, Yoga & Sports",
    blurb: "Personal training, yoga, meditation, Zumba and sports coaching",
    icon: "Activity",
    examples: ["Personal training", "Yoga", "Meditation", "Zumba", "Cricket coaching"],
  },
  {
    slug: "languages-career",
    name: "Languages & Career Coaching",
    blurb: "Mother-tongue classes, spoken English, public speaking and career coaching",
    icon: "Languages",
    examples: ["Telugu", "Hindi", "Spoken English", "Public speaking", "Interview prep"],
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
    categories: ["academics-chess-coding"],
    verified: false,
  },
  {
    slug: "bhramaramba",
    name: "Bhramaramba",
    title: "Maths teacher",
    city: "", // unknown — shown as "India"
    languages: ["English"], // TODO: confirm teaching languages
    yearsExperience: 0,
    categories: ["academics-chess-coding"],
    verified: false,
  },
  {
    slug: "sai",
    name: "Sai",
    title: "Dance teacher",
    city: "", // unknown — shown as "India"
    languages: ["English"], // TODO: confirm teaching languages
    yearsExperience: 0,
    categories: ["music-dance-arts"],
    verified: false,
  },
];

// Format, duration and audience are defaults pending confirmation from the owner.
export const offerings: SeedOffering[] = [
  {
    id: "chess-sharan",
    title: "Chess Coaching with Sharan",
    coachSlug: "sharan",
    category: "academics-chess-coding",
    format: "one-on-one",
    audience: "family",
    durationMin: 60,
    priceInr: 899,
    languages: ["English"],
  },
  {
    id: "maths-bhramaramba",
    title: "Maths Class with Bhramaramba",
    coachSlug: "bhramaramba",
    category: "academics-chess-coding",
    format: "one-on-one",
    audience: "kids",
    durationMin: 60,
    priceInr: 449,
    languages: ["English"],
  },
  {
    id: "dance-sai",
    title: "Dance Class with Sai",
    coachSlug: "sai",
    category: "music-dance-arts",
    format: "one-on-one",
    audience: "family",
    durationMin: 60,
    priceInr: 899,
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
