"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

// Client-side so the header doesn't make every page dynamic.
export function HeaderAuth() {
  const { data, isPending } = useSession();

  if (isPending) return <span className="h-9 w-32" aria-hidden />;

  if (data) {
    const role = data.user.role;
    const dash =
      role === "admin" ? { href: "/admin", label: "Admin" } : role === "coach" ? { href: "/coach", label: "Dashboard" } : null;
    return (
      <>
        {dash && (
          <Link href={dash.href} className="rounded-full px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-muted">
            {dash.label}
          </Link>
        )}
        <Link
        href="/account"
        className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted"
      >
        {data.user.name.split(" ")[0]}&apos;s account
      </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/login" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-surface-muted">
        Sign in
      </Link>
      <Link
        href="/signup"
        className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
      >
        Join free
      </Link>
    </>
  );
}
