import type { Metadata } from "next";
import Link from "next/link";
import { and, count, eq, gt } from "drizzle-orm";
import { CheckCircle2, Circle } from "lucide-react";
import { db } from "@/db";
import { availabilityRule, classSession, coachPayoutAccount, offering } from "@/db/schema";
import { requireApprovedCoach } from "@/lib/authz";

export const metadata: Metadata = { title: "Teacher dashboard" };

export default async function CoachHome() {
  const { coach } = await requireApprovedCoach("/coach");
  const [[classes], [hours], [upcoming], [payoutRow]] = await Promise.all([
    db.select({ n: count() }).from(offering).where(and(eq(offering.coachId, coach.id), eq(offering.isActive, true))),
    db.select({ n: count() }).from(availabilityRule).where(eq(availabilityRule.coachId, coach.id)),
    db
      .select({ n: count() })
      .from(classSession)
      .where(and(eq(classSession.coachId, coach.id), eq(classSession.status, "scheduled"), gt(classSession.startsAt, new Date()))),
    db.select({ n: count() }).from(coachPayoutAccount).where(eq(coachPayoutAccount.coachId, coach.id)),
  ]);

  const checklist = [
    { done: Boolean(coach.photoKey), label: "Add a profile photo", href: "/coach/profile" },
    { done: Boolean(coach.bio), label: "Write a short bio", href: "/coach/profile" },
    { done: hours.n > 0, label: "Set your weekly hours (for 1-on-1 bookings)", href: "/coach/availability" },
    { done: classes.n > 0, label: "Create your first class", href: "/coach/classes/new" },
    { done: payoutRow.n > 0, label: "Add your bank or UPI details and PAN to get paid", href: "/coach/payout-details" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Namaste, {coach.displayName.split(" ")[0]}</h1>
      <p className="mt-1 text-muted">Here&apos;s how your teaching profile is set up.</p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Active classes" value={classes.n} />
        <Stat label="Weekly time slots" value={hours.n} />
        <Stat label="Upcoming sessions" value={upcoming.n} />
      </ul>

      <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-display text-xl font-semibold">Getting started</h2>
        <ul className="mt-4 space-y-3">
          {checklist.map((c) => (
            <li key={c.label}>
              <Link href={c.href} className="flex items-center gap-3 hover:text-primary">
                {c.done ? (
                  <CheckCircle2 className="size-5 text-success" aria-label="Done" />
                ) : (
                  <Circle className="size-5 text-muted" aria-label="To do" />
                )}
                <span className={c.done ? "text-muted line-through" : ""}>{c.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <li className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-4xl font-semibold">{value}</p>
    </li>
  );
}
