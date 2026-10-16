import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { BookingForm } from "@/components/book/booking-form";
import { db } from "@/db";
import { coach, familyMember, offering } from "@/db/schema";
import { requireUser } from "@/lib/authz";
import { openSlots, sessionsWithSeats } from "@/lib/slots";
import { createBooking, previewCoupon } from "../actions";

export const metadata: Metadata = { title: "Book a class" };

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { slug } = await params;
  const { code } = await searchParams;
  const user = await requireUser(`/book/${slug}`);

  const [o] = await db
    .select({
      id: offering.id,
      slug: offering.slug,
      title: offering.title,
      format: offering.format,
      durationMin: offering.durationMin,
      priceUsdCents: offering.priceUsdCents,
      coachId: coach.id,
      coachName: coach.displayName,
      timezone: coach.timezone,
    })
    .from(offering)
    .innerJoin(coach, eq(offering.coachId, coach.id))
    .where(and(eq(offering.slug, slug), eq(offering.isActive, true), eq(coach.status, "approved")));
  if (!o) notFound();

  const [members, slots, sessions] = await Promise.all([
    db
      .select({ id: familyMember.id, name: familyMember.name })
      .from(familyMember)
      .where(eq(familyMember.parentUserId, user.id))
      .orderBy(asc(familyMember.createdAt)),
    o.format === "one-on-one" ? openSlots(o.coachId, o.timezone, o.durationMin) : Promise.resolve(undefined),
    o.format === "one-on-one" ? Promise.resolve(undefined) : sessionsWithSeats(o.id),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href={`/sessions/${o.slug}`} className="text-sm text-muted hover:text-foreground">
        ← Back to class
      </Link>
      <h1 className="mt-2 font-display text-3xl font-semibold">{o.title}</h1>
      <p className="mt-1 text-muted">
        with {o.coachName} · {o.durationMin} minutes · {o.format === "one-on-one" ? "1-on-1 video" : "live group"}
      </p>
      <div className="mt-8">
        <BookingForm
          action={createBooking}
          offeringId={o.id}
          priceUsd={o.priceUsdCents / 100}
          selfName={user.name.split(" ")[0]}
          members={members}
          slots={slots}
          sessions={sessions}
          requestHref={`/request?class=${o.slug}`}
          preview={previewCoupon}
          initialCode={code?.slice(0, 40)}
        />
      </div>
    </div>
  );
}
