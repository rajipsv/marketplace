import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, IndianRupee, Laptop, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Teach with us",
  description: "Teach families in the USA from home in India. Set your own schedule; get paid to your Indian bank account.",
};

const benefits = [
  { icon: Laptop, title: "Teach from home", text: "Live classes run in the browser. All you need is a laptop and good internet." },
  { icon: CalendarClock, title: "Your schedule", text: "Set your weekly hours in IST. We show them to families in their US time zone." },
  { icon: IndianRupee, title: "Paid in INR", text: "Families pay online by card; you're paid to your Indian bank account." },
  { icon: ShieldCheck, title: "We handle the rest", text: "Bookings, payments, reminders and support — so you can focus on teaching." },
];

const steps = [
  "Create a free account and fill in your teaching profile",
  "Upload your photo and any certificates (kept private)",
  "Our team reviews your application",
  "Once approved, add your classes and weekly availability",
];

export default function TeachPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-accent-strong">For trainers, coaches and tutors in India</p>
        <h1 className="mt-2 font-display text-4xl leading-tight font-semibold sm:text-5xl">
          Teach Indian families across the USA — from home.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Maths, chess, coding, music, dance, languages, fitness, yoga and more. Share what you know with
          students who want to learn it.
        </p>
        <Link
          href="/teach/apply"
          className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-strong"
        >
          Apply to teach
        </Link>
      </div>

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(({ icon: Icon, title, text }) => (
          <li key={title} className="rounded-2xl border border-border bg-surface p-6">
            <Icon className="size-7 text-primary" aria-hidden />
            <p className="mt-3 font-display text-lg font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </li>
        ))}
      </ul>

      <section className="mt-14 rounded-3xl bg-primary px-6 py-10 text-primary-foreground sm:px-10">
        <h2 className="font-display text-2xl font-semibold">How to join</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s} className="rounded-2xl bg-white/10 p-5">
              <span className="text-sm font-semibold text-accent">Step {i + 1}</span>
              <p className="mt-2">{s}</p>
            </li>
          ))}
        </ol>
        <Link
          href="/teach/apply"
          className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-strong"
        >
          Start your application
        </Link>
      </section>
    </div>
  );
}
