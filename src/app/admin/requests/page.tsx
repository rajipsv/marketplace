import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { classRequest, offering } from "@/db/schema";
import { assertRole, requireRole } from "@/lib/authz";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Requests · Admin" };

const tabs = ["new", "contacted", "closed"] as const;

async function setRequestStatus(fd: FormData) {
  "use server";
  await assertRole(["admin"]);
  const id = z.string().uuid().parse(fd.get("id"));
  const status = z.enum(tabs).parse(fd.get("status"));
  await db.update(classRequest).set({ status }).where(eq(classRequest.id, id));
  revalidatePath("/admin/requests");
}

export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireRole(["admin"], "/admin/requests");
  const sp = await searchParams;
  const status = (tabs as readonly string[]).includes(sp.status ?? "") ? (sp.status as (typeof tabs)[number]) : "new";

  const rows = await db
    .select({ r: classRequest, classTitle: offering.title })
    .from(classRequest)
    .leftJoin(offering, eq(classRequest.offeringId, offering.id))
    .where(eq(classRequest.status, status))
    .orderBy(desc(classRequest.createdAt))
    .limit(200);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Class requests</h1>
      <p className="mt-1 text-sm text-muted">What families are asking for — use this to recruit teachers and add times.</p>
      <nav aria-label="Status" className="mt-5 flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t}
            href={`/admin/requests?status=${t}`}
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
        <ul className="mt-6 space-y-3">
          {rows.map(({ r, classTitle }) => (
            <li key={r.id} className="rounded-2xl border border-border bg-surface p-5 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{classTitle ?? r.subject}</p>
                  <p className="text-muted">
                    {r.name} · <a href={`mailto:${r.email}`} className="text-primary hover:underline">{r.email}</a>
                    {r.timezone && ` · ${r.timezone}`}
                  </p>
                </div>
                <span className="text-xs text-muted">
                  {r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <dl className="mt-2 grid gap-1 text-muted sm:grid-cols-2">
                {r.forWhom && <div>For: {r.forWhom}</div>}
                {r.preferredTimes && <div>When: {r.preferredTimes}</div>}
              </dl>
              {r.message && <p className="mt-2 whitespace-pre-line">{r.message}</p>}
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                {tabs
                  .filter((t) => t !== r.status)
                  .map((t) => (
                    <form key={t} action={setRequestStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value={t} />
                      <button className="cursor-pointer rounded-full border border-border px-3 py-1 text-xs font-semibold capitalize hover:bg-surface-muted">
                        Mark {t}
                      </button>
                    </form>
                  ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">No {status} requests.</p>
      )}
    </div>
  );
}
