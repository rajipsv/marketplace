import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { RatingBadge } from "@/components/rating";
import type { CoachSummary } from "@/lib/types";
import { cn, coachFacts, mediaUrl } from "@/lib/utils";

export function CoachCard({ coach, className }: { coach: CoachSummary; className?: string }) {
  return (
    <Link
      href={`/coaches/${coach.slug}`}
      className={cn(
        "group flex w-60 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:shadow-md",
        className,
      )}
    >
      <Avatar name={coach.name} src={mediaUrl(coach.photoKey)} className="aspect-square w-full text-6xl" />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="flex items-center gap-1 font-display text-lg font-semibold group-hover:text-primary">
          {coach.name}
          {coach.verified && <BadgeCheck className="size-4 text-primary" aria-label="Verified" />}
        </p>
        <p className="text-sm text-muted">{coach.title}</p>
        <RatingBadge rating={coach.rating} className="text-sm" long />
        <p className="mt-auto pt-2 text-xs text-muted">
          {coachFacts(coach).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
