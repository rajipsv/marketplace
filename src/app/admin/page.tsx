import type { Metadata } from "next";
import { requireRole } from "@/lib/authz";
import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { classRequest, coach, offering, user } from "@/db/schema";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminHome() {
  await requireRole(["admin"], "/admin");
  const [[pending], [approved], [customers], [classes], [requests]] = await Promise.all([
    db.select({ n: count() }).from(coach).where(eq(coach.status, "pending")),
    db.select({ n: count() }).from(coach).where(eq(coach.status, "approved")),
    db.select({ n: count() }).from(user).where(eq(user.role, "customer")),
    db.select({ n: count() }).from(offering).where(eq(offering.isActive, true)),
    db.select({ n: count() }).from(classRequest).where(eq(classRequest.status, "new")),
  ]);

  const stats = [
    { label: "Applications to review", value: pending.n, href: "/admin/coaches?status=pending", highlight: pending.n > 0 },
    { label: "New class requests", value: requests.n, href: "/admin/requests", highlight: requests.n > 0 },
    { label: "Approved teachers", value: approved.n, href: "/admin/coaches?status=approved" },
    { label: "Customers", value: customers.n },
    { label: "Active classes", value: classes.n },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Overview</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const body = (
            <>
              <p className="text-sm text-muted">{s.label}</p>
              <p className="mt-1 font-display text-4xl font-semibold">{s.value}</p>
            </>
          );
          const cls = `block rounded-2xl border bg-surface p-5 ${s.highlight ? "border-accent" : "border-border"}`;
          return (
            <li key={s.label}>
              {s.href ? (
                <Link href={s.href} className={`${cls} hover:border-primary`}>
                  {body}
                </Link>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
