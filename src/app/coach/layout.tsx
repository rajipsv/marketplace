import Link from "next/link";
import { requireApprovedCoach } from "@/lib/authz";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/coach", label: "Overview" },
  { href: "/coach/profile", label: "Profile" },
  { href: "/coach/availability", label: "Weekly hours" },
  { href: "/coach/classes", label: "Classes" },
];

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const { coach } = await requireApprovedCoach("/coach");
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border pb-4">
        <p className="font-display text-xl font-semibold">Teacher dashboard</p>
        <nav aria-label="Teacher dashboard" className="no-scrollbar flex gap-4 overflow-x-auto text-sm font-medium">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap text-muted hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link href={`/coaches/${coach.slug}`} className="ml-auto text-sm font-semibold text-primary hover:underline">
          View public profile ↗
        </Link>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
