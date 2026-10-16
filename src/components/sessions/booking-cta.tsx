"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/** Sends signed-in users to the booking page; others sign up first and come back. */
export function BookingCta({ slug, label, className }: { slug: string; label: string; className?: string }) {
  const { data, isPending } = useSession();
  const base = "block w-full rounded-full px-5 py-3 text-center text-sm font-semibold";

  if (isPending) return <span className={cn(base, "bg-surface-muted text-transparent", className)}>…</span>;

  const bookPath = `/book/${slug}`;
  return (
    <Link
      href={data ? bookPath : `/signup?next=${encodeURIComponent(bookPath)}`}
      className={cn(base, "bg-accent text-accent-foreground hover:bg-accent-strong", className)}
    >
      {data ? label : `Join free to ${label.toLowerCase()}`}
    </Link>
  );
}
