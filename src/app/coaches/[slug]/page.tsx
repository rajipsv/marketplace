import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, BadgeCheck, Languages, MapPin, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { SessionCard } from "@/components/session-card";
import { ShareButtons } from "@/components/share-buttons";
import { coachLocation, mediaUrl } from "@/lib/utils";
import { getCoachBySlug } from "@/lib/queries";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const coach = await getCoachBySlug((await params).slug);
  if (!coach) return { title: "Teacher not found" };
  return { title: coach.name, description: `${coach.name} — ${coach.title}. Live classes for families in the USA.` };
}

export default async function CoachPage({ params }: Props) {
  const coach = await getCoachBySlug((await params).slug);
  if (!coach) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/coaches" className="hover:text-foreground">
          Teachers
        </Link>{" "}
        / {coach.name}
      </nav>

      <header className="mt-6 grid gap-8 rounded-3xl border border-border bg-surface p-6 sm:p-8 md:grid-cols-[200px_1fr]">
        <Avatar name={coach.name} src={mediaUrl(coach.photoKey)} className="aspect-square w-40 rounded-2xl text-6xl md:w-full" />
        <div>
          <h1 className="flex flex-wrap items-center gap-2 font-display text-3xl font-semibold sm:text-4xl">
            {coach.name}
            {coach.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-sans text-xs font-semibold text-primary">
                <BadgeCheck className="size-4" aria-hidden /> Verified
              </span>
            )}
          </h1>
          <p className="mt-1 text-lg text-muted">{coach.title}</p>

          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <li className="flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" aria-hidden /> {coachLocation(coach.city)}
            </li>
            {coach.yearsExperience > 0 && (
              <li className="flex items-center gap-1.5">
                <Award className="size-4 text-primary" aria-hidden /> {coach.yearsExperience} years teaching
              </li>
            )}
            <li className="flex items-center gap-1.5">
              <Languages className="size-4 text-primary" aria-hidden /> {coach.languages.join(", ")}
            </li>
          </ul>

          {coach.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {coach.categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/explore?category=${c.slug}`}
                  className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-strong hover:bg-accent/30"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {coach.bio && <p className="mt-5 max-w-3xl leading-relaxed text-muted">{coach.bio}</p>}
          <div className="mt-5">
            <ShareButtons path={`/coaches/${coach.slug}`} text={`${coach.name} — ${coach.title}, teaching live online classes for US families:`} />
          </div>
        </div>
      </header>

      {coach.credentials.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Verified credentials</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {coach.credentials.map((c) => (
              <li key={`${c.title}-${c.year}`} className="flex gap-3 rounded-2xl border border-border bg-surface p-4">
                <ShieldCheck className="size-5 shrink-0 text-success" aria-hidden />
                <span>
                  <span className="block font-medium">{c.title}</span>
                  <span className="text-sm text-muted">{[c.issuer, c.year].filter(Boolean).join(" · ")}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Classes with {coach.name.split(" ")[0]}</h2>
        {coach.offerings.length ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {coach.offerings.map((o) => (
              <SessionCard key={o.id} offering={o} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-muted">No classes are open right now. Check back soon.</p>
        )}
      </section>
    </div>
  );
}
