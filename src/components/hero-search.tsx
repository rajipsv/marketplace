"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const audiences = [
  { value: "me", label: "For me" },
  { value: "kids", label: "For my child" },
  { value: "family", label: "For family" },
] as const;

const popular = ["Bharatanatyam", "Kundli reading", "Telugu for kids", "Prenatal yoga", "Diwali puja"];

export function HeroSearch() {
  const router = useRouter();
  const [audience, setAudience] = useState<(typeof audiences)[number]["value"]>("me");
  const [q, setQ] = useState("");

  function go(query: string) {
    const params = new URLSearchParams({ for: audience });
    if (query.trim()) params.set("q", query.trim());
    router.push(`/explore?${params}`);
  }

  return (
    <div className="w-full max-w-2xl">
      <div role="radiogroup" aria-label="Who is this for?" className="mb-3 flex flex-wrap gap-2">
        {audiences.map((a) => (
          <button
            key={a.value}
            type="button"
            role="radio"
            aria-checked={audience === a.value}
            onClick={() => setAudience(a.value)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              audience === a.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface hover:border-primary",
            )}
          >
            {a.label}
          </button>
        ))}
      </div>

      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
        className="flex items-center gap-2 rounded-full border border-border bg-surface p-1.5 pl-5 shadow-md focus-within:border-primary"
      >
        <Search className="size-5 shrink-0 text-muted" aria-hidden />
        <label htmlFor="hero-q" className="sr-only">
          Search classes, teachers or topics
        </label>
        <input
          id="hero-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try “Carnatic vocal”, “Vedic astrology”, “yoga in Tamil”"
          className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-strong"
        >
          Search
        </button>
      </form>

      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
        Popular:
        {popular.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            className="cursor-pointer underline-offset-4 hover:text-foreground hover:underline"
          >
            {p}
          </button>
        ))}
      </p>
    </div>
  );
}
