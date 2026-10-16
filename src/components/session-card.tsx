import Link from "next/link";
import { BadgeCheck, Clock, Languages, Users, Video } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { LocalTime } from "@/components/local-time";
import type { Badge, Format, OfferingCard } from "@/lib/types";
import { cn, coachLocation, formatUsd } from "@/lib/utils";

const formatLabel: Record<Format, string> = {
  group: "Live group",
  "one-on-one": "1-on-1 video",
  "weekly-class": "Weekly class",
};

const badgeStyle: Record<Badge, string> = {
  "Most loved": "bg-primary text-primary-foreground",
  "Free trial": "bg-success text-white",
  Festival: "bg-kumkum text-white",
  New: "bg-accent text-accent-foreground",
};

export function SessionCard({ offering }: { offering: OfferingCard }) {
  const { coach } = offering;

  return (
    <Link
      href={`/sessions/${offering.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary"
    >
      <div className="relative aspect-[4/3]">
        <Avatar name={coach.name} className="absolute inset-0 text-5xl" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />
        {offering.badge && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold",
              badgeStyle[offering.badge],
            )}
          >
            {offering.badge}
          </span>
        )}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          {offering.format === "one-on-one" ? (
            <Video className="size-3.5" />
          ) : (
            <Users className="size-3.5" />
          )}
          {formatLabel[offering.format]}
        </span>
        <div className="absolute inset-x-3 bottom-3 text-white">
          <p className="flex items-center gap-1 text-sm font-medium">
            {coach.name}
            {coach.verified && <BadgeCheck className="size-4 text-accent" aria-label="Verified" />}
          </p>
          <p className="text-xs text-white/80">{coachLocation(coach.city)}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-display text-lg leading-snug font-semibold group-hover:text-primary">
          {offering.title}
        </h3>

        <div className="text-sm">
          {offering.startsAt ? (
            <LocalTime iso={offering.startsAt} />
          ) : (
            <span className="block font-medium">Pick a time that suits you</span>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {offering.durationMin} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Languages className="size-3.5" />
            {offering.languages.join(", ")}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-lg font-semibold">
            {formatUsd(offering.priceUsd)}
            {offering.format === "weekly-class" && offering.priceUsd > 0 && (
              <span className="text-sm font-normal text-muted"> / class</span>
            )}
          </span>
          <span className="text-sm font-semibold text-primary">
            {offering.format === "one-on-one" ? "Choose time →" : "Book →"}
          </span>
        </div>
      </div>
    </Link>
  );
}
