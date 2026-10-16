import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { RequestForm } from "@/components/request/request-form";
import { db } from "@/db";
import { coach, offering } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { submitRequest } from "./actions";

export const metadata: Metadata = {
  title: "Request a class",
  description: "Tell us what you or your child would like to learn and when — we'll find the right teacher in India.",
};

export default async function RequestPage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const sp = await searchParams;
  const [session, found] = await Promise.all([
    getSession(),
    sp.class
      ? db
          .select({ id: offering.id, title: offering.title })
          .from(offering)
          .innerJoin(coach, eq(offering.coachId, coach.id))
          .where(and(eq(offering.slug, sp.class), eq(offering.isActive, true), eq(coach.status, "approved")))
      : Promise.resolve([]),
  ]);
  const o = found[0] ?? null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{o ? "Request a time" : "Request a class"}</h1>
      <p className="mt-2 text-muted">
        {o
          ? "Tell us when suits you and we'll arrange it with the teacher."
          : "Can't find what you're looking for? Tell us what you'd like to learn and when — we'll find a teacher in India for you."}
      </p>
      <div className="mt-8 rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <RequestForm
          action={submitRequest}
          offering={o}
          defaults={{ name: session?.user.name, email: session?.user.email }}
        />
      </div>
    </div>
  );
}
