import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");

  const { user } = session;
  const rows = [
    ["Name", user.name],
    ["Email", user.email],
    ["Account type", user.role],
    ["Time zone", user.timezone],
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-3xl font-semibold">Namaste, {user.name.split(" ")[0]}</h1>
      <p className="mt-2 text-muted">Your bookings and family profiles will appear here.</p>

      <dl className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 px-5 py-4 text-sm">
            <dt className="text-muted">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        {user.role === "admin" && <DashLink href="/admin">Open admin</DashLink>}
        {(user.role === "coach" || user.role === "admin") && <DashLink href="/coach">Teacher dashboard</DashLink>}
        {user.role === "customer" && <DashLink href="/teach">Teach with us</DashLink>}
        <SignOutButton />
      </div>
    </div>
  );
}

function DashLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong">
      {children}
    </Link>
  );
}
