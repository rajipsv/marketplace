"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { audienceOptions, formatOptions, priceOptions } from "@/lib/explore-params";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

export function FilterBar({ categories, languages }: { categories: Option[]; languages: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`${pathname}?${next}`, { scroll: false }));
  }

  const active = ["q", "category", "for", "language", "format", "price"].some((k) => params.get(k));

  return (
    <div className={cn("space-y-4 transition-opacity", pending && "opacity-60")}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          update("q", q.trim() || null);
        }}
        className="flex items-center gap-2 rounded-full border border-border bg-surface p-1.5 pl-4 focus-within:border-primary"
      >
        <Search className="size-4 shrink-0 text-muted" aria-hidden />
        <label htmlFor="explore-q" className="sr-only">
          Search classes, teachers or topics
        </label>
        <input
          id="explore-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search classes, teachers or topics"
          className="min-w-0 flex-1 bg-transparent py-1.5 outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent-strong"
        >
          Search
        </button>
      </form>

      <div role="radiogroup" aria-label="Who is this for?" className="flex flex-wrap gap-2">
        {[{ value: "", label: "Everyone" }, ...audienceOptions].map((a) => {
          const selected = (params.get("for") ?? "") === a.value;
          return (
            <button
              key={a.value || "all"}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => update("for", a.value || null)}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:border-primary",
              )}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select label="Category" value={params.get("category")} onChange={(v) => update("category", v)} options={categories} />
        <Select
          label="Language"
          value={params.get("language")}
          onChange={(v) => update("language", v)}
          options={languages.map((l) => ({ value: l.toLowerCase(), label: l }))}
        />
        <Select label="Format" value={params.get("format")} onChange={(v) => update("format", v)} options={[...formatOptions]} />
        <Select label="Price" value={params.get("price")} onChange={(v) => update("price", v)} options={[...priceOptions]} />
      </div>

      {active && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            startTransition(() => router.replace(pathname, { scroll: false }));
          }}
          className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          <X className="size-4" aria-hidden /> Clear all filters
        </button>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: Option[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="mt-1 w-full cursor-pointer rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
      >
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
