import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FilterBar } from "@/components/explore/filter-bar";
import { SessionCard } from "@/components/session-card";
import { languages } from "@/lib/content";
import { parseExploreParams, type RawSearchParams } from "@/lib/explore-params";
import { getCategories, getOfferingCards } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Explore classes",
  description: "Find live 1-on-1 and group classes with verified teachers in India, scheduled for US time zones.",
};

export default async function ExplorePage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const filters = parseExploreParams(await searchParams);
  const [categories, offerings] = await Promise.all([getCategories(), getOfferingCards(filters)]);
  const current = categories.find((c) => c.slug === filters.category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{current ? current.name : "Explore classes"}</h1>
      <p className="mt-2 max-w-2xl text-muted">
        {current
          ? current.blurb
          : "Live 1-on-1 and group classes with verified teachers in India. Every time is shown in your time zone."}
      </p>

      <div className="mt-8">
        <Suspense>
          <FilterBar categories={categories.map((c) => ({ value: c.slug, label: c.name }))} languages={languages} />
        </Suspense>
      </div>

      <p className="mt-8 text-sm text-muted" aria-live="polite">
        {offerings.length} {offerings.length === 1 ? "class" : "classes"} found
      </p>

      {offerings.length ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {offerings.map((o) => (
            <SessionCard key={o.id} offering={o} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="font-display text-xl font-semibold">No classes match these filters yet</p>
          <p className="mt-2 text-sm text-muted">
            Try removing a filter, or{" "}
            <Link href="/explore" className="font-semibold text-primary hover:underline">
              see all classes
            </Link>
            . New teachers are joining every week.
          </p>
        </div>
      )}
    </div>
  );
}
