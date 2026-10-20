import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "About us" };

export default function AboutPage() {
  const { name, legal } = siteConfig;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">About {name}</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-muted">
        <p>
          Indian families in the United States want their children — and themselves — to keep learning the things that
          matter to them: music, dance, languages, maths, chess, yoga and more. The best teachers for many of these are in
          India, but time zones, payments and trust get in the way.
        </p>
        <p>
          {name} brings them together. Teachers in India set their hours in IST; families see every class in their own US
          time zone, book in a few taps, pay securely online, and join live from the browser. Teachers are paid in rupees.
        </p>
        <p>
          Every teacher is reviewed before their profile goes live, and families can always reach a real person when they
          need help.
        </p>
        <p>
          {name} is operated by <span className="font-semibold text-foreground">{legal.businessName}</span>, {legal.address}.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/explore" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-strong">
          Explore classes
        </Link>
        <Link href="/contact" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-surface-muted">
          Contact us
        </Link>
      </div>
    </div>
  );
}
