import type { Metadata } from "next";
import Link from "next/link";
import { CoachCard } from "@/components/coach-card";
import { languages } from "@/lib/content";
import type { RawSearchParams } from "@/lib/explore-params";
import { getCategories, getCoaches } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Teachers",
  description: "Trainers and coaches in India teaching live classes for families in the USA.",
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function CoachesPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const sp = await searchParams;
  const categoryParam = one(sp.category);
  const langParam = one(sp.language)?.toLowerCase();
  const language = languages.find((l) => l.toLowerCase() === langParam);

  const categories = await getCategories();
  const category = categories.find((c) => c.slug === categoryParam)?.slug;
  const coaches = await getCoaches({ category, language });

  const href = (next: { category?: string; language?: string }) => {
    const p = new URLSearchParams();
    if (next.category) p.set("category", next.category);
    if (next.language) p.set("language", next.language.toLowerCase());
    const qs = p.toString();
    return qs ? `/coaches?${qs}` : "/coaches";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Meet our teachers</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Teachers in India offering live classes for families in the USA.
      </p>

      <ChipRow label="Category">
        <Chip href={href({ language })} active={!category}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip key={c.slug} href={href({ category: c.slug, language })} active={category === c.slug}>
            {c.name}
          </Chip>
        ))}
      </ChipRow>
      <ChipRow label="Language">
        <Chip href={href({ category })} active={!language}>
          Any
        </Chip>
        {languages.map((l) => (
          <Chip key={l} href={href({ category, language: l })} active={language === l}>
            {l}
          </Chip>
        ))}
      </ChipRow>

      {coaches.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {coaches.map((c) => (
            <CoachCard key={c.slug} coach={c} className="w-full" />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-muted">
          No teachers match yet.{" "}
          <Link href="/coaches" className="font-semibold text-primary hover:underline">
            See all teachers
          </Link>
        </p>
      )}
    </div>
  );
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:border-primary",
      )}
    >
      {children}
    </Link>
  );
}
