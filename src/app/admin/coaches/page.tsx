import type { Metadata } from "next";
import { requireRole } from "@/lib/authz";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Avatar } from "@/components/avatar";
import { db } from "@/db";
import { coach, user } from "@/db/schema";
import { cn, mediaUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Teachers · Admin" };

const tabs = ["pending", "approved", "rejected", "suspended"] as const;
type Status = (typeof tabs)[number];

export default async function AdminCoaches({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireRole(["admin"], "/admin/coaches");
  const sp = await searchParams;
  const status: Status = tabs.includes(sp.status as Status) ? (sp.status as Status) : "pending";

  const rows = await db
    .select({
      id: coach.id,
      name: coach.displayName,
      title: coach.title,
      city: coach.city,
      photoKey: coach.photoKey,
      verified: coach.verified,
      createdAt: coach.createdAt,
      email: user.email,
    })
    .from(coach)
    .innerJoin(user, eq(coach.userId, user.id))
    .where(eq(coach.status, status))
    .orderBy(desc(coach.createdAt));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Teachers</h1>
      <nav aria-label="Status" className="mt-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t}
            href={`/admin/coaches?status=${t}`}
            aria-current={t === status ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium capitalize",
              t === status ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:border-primary",
            )}
          >
            {t}
          </Link>
        ))}
      </nav>

      {rows.length ? (
        <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={`/admin/coaches/${r.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-muted">
                <Avatar name={r.name} src={mediaUrl(r.photoKey)} className="size-12 shrink-0 rounded-full text-base" />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    {r.name} {r.verified && <span className="text-xs font-medium text-primary">· verified</span>}
                  </span>
                  <span className="block truncate text-sm text-muted">
                    {r.title}
                    {r.city && ` · ${r.city}`} · {r.email}
                  </span>
                </span>
                <span className="hidden text-xs text-muted sm:block">
                  {r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">
          No {status} teachers.
        </p>
      )}
    </div>
  );
}
