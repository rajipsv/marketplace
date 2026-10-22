import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarClock, Check, Clock, Languages, Users, Video } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { LocalTime } from "@/components/local-time";
import { BookingCta } from "@/components/sessions/booking-cta";
import { JsonLd } from "@/components/json-ld";
import { ShareButtons } from "@/components/share-buttons";
import { siteUrl } from "@/lib/site-url";
import { siteConfig } from "@/config/site";
import { getPromo } from "@/lib/coupons";
import { getOfferingBySlug, type OfferingDetail } from "@/lib/queries";
import type { Format } from "@/lib/types";
import { coachFacts, formatInr, mediaUrl } from "@/lib/utils";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const offering = await getOfferingBySlug((await params).slug);
  if (!offering) return { title: "Class not found" };
  const description = offering.description ?? `${offering.title} with ${offering.coach.name}, live online for US families.`;
  return {
    title: offering.title,
    description,
    alternates: { canonical: `/sessions/${offering.slug}` },
    openGraph: { title: `${offering.title} · with ${offering.coach.name}`, description, url: `/sessions/${offering.slug}` },
  };
}

const formatLabel: Record<Format, string> = {
  "one-on-one": "Private 1-on-1 video session",
  group: "Live group session",
  "weekly-class": "Weekly live class",
};

const included: Record<Format, string[]> = {
  "one-on-one": [
    "A private live video call that runs in your browser",
    "Time to ask your own questions",
    "A time slot chosen to suit your US schedule",
  ],
  group: [
    "A live session that runs in your browser — no download",
    "Live Q&A with the teacher",
    "Small, friendly group",
  ],
  "weekly-class": [
    "A regular weekly slot in US time",
    "Small batches so every student gets attention",
    "Parents manage everything from one family account",
  ],
};

const faqs = (o: OfferingDetail) => [
  {
    q: "What time is it for me?",
    a: "Every time on this page is shown in your own time zone, with the teacher's India time underneath for reference.",
  },
  {
    q: "How do I join?",
    a: "Your booking appears in My Sessions, and the join link is shown there before the class. Classes run in your web browser — no app needed.",
  },
  {
    q: o.audience === "kids" ? "Does a parent need to be present?" : "Is this suitable for beginners?",
    a:
      o.audience === "kids"
        ? "A parent books and manages the class from their account. For younger children we recommend a parent stays nearby for the first class."
        : "Yes. Tell the teacher about your background at the start and they'll adapt the session.",
  },
  {
    q: "What if I need to cancel?",
    a: "You can cancel from My Sessions up to 24 hours before the class starts.",
  },
];

export default async function SessionPage({ params }: Props) {
  const [offering, promo] = await Promise.all([getOfferingBySlug((await params).slug), getPromo(siteConfig.promoCode)]);
  if (!offering) notFound();
  const { coach } = offering;
  const ctaLabel = offering.format === "one-on-one" ? "Choose a time" : offering.priceInr === 0 ? "Book free trial" : "Book";
  const price = (
    <>
      {formatInr(offering.priceInr)}
      {offering.format === "weekly-class" && offering.priceInr > 0 && (
        <span className="text-base font-normal text-muted"> / class</span>
      )}
    </>
  );

  const base = siteUrl();
  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-10 lg:pb-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Course",
              name: offering.title,
              description: offering.description ?? offering.title,
              url: `${base}/sessions/${offering.slug}`,
              inLanguage: offering.languages,
              provider: { "@type": "Organization", name: siteConfig.name, url: base },
              instructor: { "@type": "Person", name: coach.name, url: `${base}/coaches/${coach.slug}` },
              offers: {
                "@type": "Offer",
                price: offering.priceInr,
                priceCurrency: "INR",
                url: `${base}/sessions/${offering.slug}`,
                availability: "https://schema.org/InStock",
              },
              hasCourseInstance: {
                "@type": "CourseInstance",
                courseMode: "online",
                ...(offering.startsAt ? { startDate: offering.startsAt } : {}),
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: faqs(offering).map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/explore" className="hover:text-foreground">
          Explore
        </Link>{" "}
        /{" "}
        <Link href={`/explore?category=${offering.category.slug}`} className="hover:text-foreground">
          {offering.category.name}
        </Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
        <article>
          {offering.badge && (
            <span className="mb-3 inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-strong">
              {offering.badge}
            </span>
          )}
          <h1 className="font-display text-3xl leading-tight font-semibold sm:text-4xl">{offering.title}</h1>

          <Link href={`/coaches/${coach.slug}`} className="group mt-5 flex items-center gap-3">
            <Avatar name={coach.name} src={mediaUrl(coach.photoKey)} className="size-12 rounded-full text-lg" />
            <span>
              <span className="flex items-center gap-1 font-semibold group-hover:text-primary">
                {coach.name}
                {coach.verified && <BadgeCheck className="size-4 text-primary" aria-label="Verified" />}
              </span>
              <span className="block text-sm text-muted">{coach.title}</span>
            </span>
          </Link>

          <div className="mt-5">
            <ShareButtons
              path={`/sessions/${offering.slug}`}
              text={`${offering.title} with ${coach.name} — live online classes for US families:`}
            />
          </div>

          <ul className="mt-6 grid gap-3 rounded-2xl border border-border bg-surface p-5 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-primary" aria-hidden /> {offering.durationMin} minutes
            </li>
            <li className="flex items-center gap-2">
              {offering.format === "one-on-one" ? (
                <Video className="size-4 text-primary" aria-hidden />
              ) : (
                <Users className="size-4 text-primary" aria-hidden />
              )}
              {formatLabel[offering.format]}
            </li>
            <li className="flex items-center gap-2">
              <Languages className="size-4 text-primary" aria-hidden /> {offering.languages.join(", ")}
            </li>
          </ul>

          {offering.description && (
            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold">About this class</h2>
              <p className="mt-2 leading-relaxed text-muted">{offering.description}</p>
            </section>
          )}

          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold">What&apos;s included</h2>
            <ul className="mt-3 space-y-2">
              {included[offering.format].map((item) => (
                <li key={item} className="flex gap-2 text-muted">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {offering.format !== "one-on-one" && (
            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold">Upcoming dates</h2>
              {offering.upcoming.length ? (
                <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
                  {offering.upcoming.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                      <CalendarClock className="size-4 shrink-0 text-primary" aria-hidden />
                      <LocalTime iso={s.startsAt} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-muted">New dates are being scheduled. Check back soon.</p>
              )}
            </section>
          )}

          <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display text-xl font-semibold">About your teacher</h2>
            <p className="mt-1 text-sm text-muted">
              {coachFacts(coach, "years teaching").join(" · ")}
            </p>
            {offering.coachBio && <p className="mt-3 leading-relaxed text-muted">{offering.coachBio}</p>}
            <Link
              href={`/coaches/${coach.slug}`}
              className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
            >
              View {coach.name.split(" ")[0]}&apos;s profile →
            </Link>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold">Questions</h2>
            <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
              {faqs(offering).map((f) => (
                <details key={f.q} className="group px-5 py-4">
                  <summary className="cursor-pointer list-none font-medium marker:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {f.q}
                      <span aria-hidden className="text-muted transition group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </article>

        {/* Desktop booking card */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-3xl font-semibold">{price}</p>
            <div className="mt-3 text-sm">
              {offering.startsAt ? (
                <>
                  <span className="text-muted">Next session</span>
                  <LocalTime iso={offering.startsAt} className="mt-1 block" />
                </>
              ) : (
                <span className="text-muted">Pick a time that suits you</span>
              )}
            </div>
            <BookingCta slug={offering.slug} label={ctaLabel} className="mt-5" />
            <p className="mt-3 text-center text-xs text-muted">Prices in ₹ (INR) · Free to join</p>
            {promo && offering.priceInr > 0 && (
              <p className="mt-3 rounded-xl bg-accent/20 px-3 py-2 text-center text-xs">
                New here? Code <span className="font-mono font-semibold">{promo.code}</span>: {promo.description.toLowerCase()}
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile sticky booking bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <p className="text-xl font-semibold">{price}</p>
          <BookingCta slug={offering.slug} label={ctaLabel} className="flex-1" />
        </div>
      </div>
    </div>
  );
}
