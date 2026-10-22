import type { Metadata } from "next";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-5xl">📶</p>
      <h1 className="mt-4 font-display text-3xl font-semibold">You&apos;re offline</h1>
      <p className="mt-3 text-muted">Check your internet connection and try again. Your bookings are safe.</p>
      {/* Full page load on purpose: the router may be unavailable offline. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/"
        className="mt-8 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
      >
        Try again
      </a>
    </div>
  );
}
