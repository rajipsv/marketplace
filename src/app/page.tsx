import Link from "next/link";
import { CalendarClock, CreditCard, Laptop, UserPlus, Video } from "lucide-react";
import { CategoryTile } from "@/components/category-tile";
import { CoachCard } from "@/components/coach-card";
import { HeroSearch } from "@/components/hero-search";
import { SessionCard } from "@/components/session-card";
import { getCategories, getFeaturedCoaches, getOfferingCards } from "@/lib/queries";

// Re-fetch catalogue data at most once a minute.
export const revalidate = 60;

const trust = [
  { icon: Video, title: "Live 1-on-1 classes", text: "Real teachers in India, not recordings" },
  { icon: CalendarClock, title: "US-friendly times", text: "Shown in your time zone, with IST for reference" },
  { icon: Laptop, title: "In your browser", text: "No app or download needed" },
  { icon: CreditCard, title: "Pay in USD", text: "Free to join. Pay only when you book" },
];

const steps = [
  { icon: UserPlus, title: "Join free", text: "Create your free account in under a minute." },
  { icon: CalendarClock, title: "Pick a time", text: "Every slot is shown in your time zone, with IST for reference." },
  { icon: Video, title: "Join live", text: "Classes run in your browser. No app or download needed." },
];

export default async function Home() {
  const [categories, coaches, offerings] = await Promise.all([
    getCategories(),
    getFeaturedCoaches(),
    getOfferingCards(),
  ]);
  const kids = offerings.filter((o) => o.audience === "kids").slice(0, 2);
  const popular = offerings.slice(0, 4);

  return (
    <>
      {/* Hero — search is the primary CTA (marketplace pattern) */}
      <section className="relative overflow-hidden">
        <div className="bg-rangoli absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 pb-16 pt-14 sm:pt-20">
          <p className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            For Indian families across the USA
          </p>
          <h1 className="max-w-3xl font-display text-4xl leading-tight font-semibold sm:text-6xl">
            Learn from India&apos;s best teachers,{" "}
            <span className="text-primary">live in your time zone.</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted">
            Chess, maths, dance and more. Book live 1-on-1 classes with teachers in India, at
            times that suit US families.
          </p>
          <HeroSearch />
        </div>
      </section>

      {/* Trust strip */}
      <section aria-label="Why families trust us" className="border-y border-border bg-surface">
        <ul className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <Icon className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Categories */}
      <Section title="What would you like to learn?" href="/explore" linkLabel="Browse all">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <CategoryTile key={c.slug} category={c} />
          ))}
        </div>
      </Section>

      {/* Kids spotlight */}
      {kids.length > 0 && (
      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground sm:px-10">
          <div className="bg-rangoli absolute inset-0 opacity-25" aria-hidden />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold">Keep your kids close to their roots</h2>
              <p className="mt-3 text-primary-foreground/85">
                Live classes for children, scheduled around the US school week. Parents book and
                manage everything from one account.
              </p>
              <Link
                href="/explore?for=kids"
                className="mt-6 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-strong"
              >
                See kids&apos; classes
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {kids.map((o) => (
                <div key={o.id} className="text-foreground">
                  <SessionCard offering={o} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Popular */}
      <Section title="Popular classes" href="/explore" linkLabel="See all classes">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((o) => (
            <SessionCard key={o.id} offering={o} />
          ))}
        </div>
      </Section>


      {/* Coaches */}
      <Section title="Meet some of our teachers" href="/coaches" linkLabel="All teachers">
        <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
          {coaches.map((c) => (
            <CoachCard key={c.slug} coach={c} />
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section title="How it works">
        <ol className="grid gap-6 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="rounded-2xl border border-border bg-surface p-6">
              <span className="text-sm font-semibold text-accent-strong">Step {i + 1}</span>
              <Icon className="mt-3 size-7 text-primary" aria-hidden />
              <p className="mt-3 font-display text-xl font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </Section>


      {/* Demand capture */}
      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-border bg-surface px-6 py-8 sm:flex-row sm:items-center sm:px-10">
          <div className="flex-1">
            <h2 className="font-display text-2xl font-semibold">Looking for something else?</h2>
            <p className="mt-2 text-muted">
              Kuchipudi, Telugu reading, Vedic maths, carnatic violin… Tell us what you or your child want to learn and
              when, and we&apos;ll find the right teacher in India.
            </p>
          </div>
          <Link
            href="/request"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-strong"
          >
            Request a class
          </Link>
        </div>
      </section>

      {/* Teach CTA */}
      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-accent/50 bg-accent/15 px-6 py-10 sm:flex-row sm:items-center sm:px-10">
          <div className="flex-1">
            <h2 className="font-display text-2xl font-semibold">Are you a teacher or coach in India?</h2>
            <p className="mt-2 text-muted">
              Teach students across the USA from home. You set your schedule, and we handle
              bookings, payments in USD and payouts to your Indian bank account.
            </p>
          </div>
          <Link
            href="/teach"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
          >
            Apply to teach
          </Link>
        </div>
      </section>
    </>
  );
}

function Section({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto mt-20 max-w-6xl px-4">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
        {href && (
          <Link href={href} className="shrink-0 text-sm font-semibold text-primary hover:underline">
            {linkLabel} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
