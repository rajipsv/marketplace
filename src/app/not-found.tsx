import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-6xl font-semibold text-accent-strong">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-muted">The class or teacher may have moved, or the link may be mistyped.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/explore"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
        >
          Explore classes
        </Link>
        <Link href="/" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-surface-muted">
          Home
        </Link>
      </div>
    </div>
  );
}
