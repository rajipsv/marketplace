import { Star } from "lucide-react";
import type { Review } from "@shared/types";
import { cn } from "@/lib/utils";

/** "★ 4.8 (12)" — renders nothing until a coach has reviews. */
export function RatingBadge({
  rating,
  className,
  long = false,
}: {
  rating: { avg: number; count: number } | null;
  className?: string;
  long?: boolean;
}) {
  if (!rating?.count) return null;
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label={`Rated ${rating.avg} out of 5 from ${rating.count} reviews`}>
      <Star className="size-3.5 fill-accent text-accent" aria-hidden />
      <span className="font-semibold">{rating.avg.toFixed(1)}</span>
      <span className="opacity-80">({long ? `${rating.count} review${rating.count === 1 ? "" : "s"}` : rating.count})</span>
    </span>
  );
}

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex", className)} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("size-4", i <= value ? "fill-accent text-accent" : "text-border")} aria-hidden />
      ))}
    </span>
  );
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-2xl border border-border bg-surface p-5">
          <Stars value={r.rating} />
          {r.comment && <p className="mt-2 leading-relaxed text-foreground">“{r.comment}”</p>}
          <p className="mt-2 text-xs text-muted">
            {r.firstName} · {r.classTitle} · {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })} ·
            Verified booking
          </p>
        </li>
      ))}
    </ul>
  );
}
