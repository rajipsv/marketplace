import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  const l = siteConfig.legal;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Contact us</h1>
      <p className="mt-2 text-muted">We usually reply within one business day (India time).</p>

      <ul className="mt-8 space-y-4 rounded-3xl border border-border bg-surface p-6">
        <li className="flex gap-3">
          <Mail className="mt-0.5 size-5 text-primary" aria-hidden />
          <span>
            <span className="block font-semibold">Email</span>
            <a href={`mailto:${l.email}`} className="text-primary hover:underline">
              {l.email}
            </a>
          </span>
        </li>
        <li className="flex gap-3">
          <Phone className="mt-0.5 size-5 text-primary" aria-hidden />
          <span>
            <span className="block font-semibold">Phone / WhatsApp</span>
            {l.phone}
          </span>
        </li>
        <li className="flex gap-3">
          <MapPin className="mt-0.5 size-5 text-primary" aria-hidden />
          <span>
            <span className="block font-semibold">{l.businessName}</span>
            {l.address}
          </span>
        </li>
      </ul>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/request" className="rounded-2xl border border-border bg-surface p-5 hover:border-primary">
          <span className="block font-semibold">Looking for a class?</span>
          <span className="text-sm text-muted">Tell us what you&apos;d like to learn and when.</span>
        </Link>
        <Link href="/teach" className="rounded-2xl border border-border bg-surface p-5 hover:border-primary">
          <span className="block font-semibold">Want to teach?</span>
          <span className="text-sm text-muted">Apply to teach families in the USA.</span>
        </Link>
      </div>
    </div>
  );
}
