"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/** Booking isn't live yet: signed-out visitors are invited to join; signed-in users see "opening soon". */
export function BookingCta({ slug, label, className }: { slug: string; label: string; className?: string }) {
  const { data, isPending } = useSession();
  const base = "block w-full rounded-full px-5 py-3 text-center text-sm font-semibold";

  if (isPending) return <span className={cn(base, "bg-surface-muted text-transparent", className)}>…</span>;

  if (!data) {
    return (
      <Link
        href={`/signup?next=${encodeURIComponent(`/sessions/${slug}`)}`}
        className={cn(base, "bg-accent text-accent-foreground hover:bg-accent-strong", className)}
      >
        Join free to {label.toLowerCase()}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled
      aria-describedby="booking-soon"
      className={cn(base, "cursor-not-allowed bg-primary/60 text-primary-foreground", className)}
    >
      {label} — opening soon
      <span id="booking-soon" className="sr-only">
        Online booking is launching shortly.
      </span>
    </button>
  );
}
