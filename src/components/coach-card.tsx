import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { CoachSummary } from "@/lib/types";

export function CoachCard({ coach }: { coach: CoachSummary }) {
  return (
    <Link
      href={`/coaches/${coach.slug}`}
      className="group flex w-60 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:shadow-md"
    >
      <Avatar name={coach.name} className="aspect-square w-full text-6xl" />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="flex items-center gap-1 font-display text-lg font-semibold group-hover:text-primary">
          {coach.name}
          {coach.verified && <BadgeCheck className="size-4 text-primary" aria-label="Verified" />}
        </p>
        <p className="text-sm text-muted">{coach.title}</p>
        <p className="mt-auto pt-2 text-xs text-muted">
          {coach.yearsExperience} yrs · {coach.city} · {coach.languages.join(", ")}
        </p>
      </div>
    </Link>
  );
}
