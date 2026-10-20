import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db } from "@/db";
import { offering } from "@/db/schema";
import { requireApprovedCoach } from "@/lib/authz";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = { title: "Your classes" };

const formatLabel = { "one-on-one": "1-on-1", group: "Group", "weekly-class": "Weekly" } as const;

export default async function CoachClassesPage() {
  const { coach } = await requireApprovedCoach("/coach/classes");
  const rows = await db.select().from(offering).where(eq(offering.coachId, coach.id)).orderBy(asc(offering.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Your classes</h1>
        <Link
          href="/coach/classes/new"
          className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
        >
          <Plus className="size-4" aria-hidden /> New class
        </Link>
      </div>

      {rows.length ? (
        <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
          {rows.map((o) => (
            <li key={o.id}>
              <Link href={`/coach/classes/${o.id}`} className="flex flex-wrap items-center gap-3 px-5 py-4 hover:bg-surface-muted">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{o.title}</span>
                  <span className="text-sm text-muted">
                    {formatLabel[o.format]} · {o.durationMin} min · {formatInr(o.priceInrPaise / 100)}
                  </span>
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${o.isActive ? "bg-success/10 text-success" : "bg-surface-muted text-muted"}`}
                >
                  {o.isActive ? "Visible" : "Hidden"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">
          You haven&apos;t created any classes yet.
        </p>
      )}
    </div>
  );
}
