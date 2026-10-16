import Link from "next/link";
import { requireRole } from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["admin"], "/admin");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-4 border-b border-border pb-4">
        <p className="font-display text-xl font-semibold">Admin</p>
        <nav aria-label="Admin" className="flex gap-4 text-sm font-medium">
          <Link href="/admin" className="text-muted hover:text-foreground">
            Overview
          </Link>
          <Link href="/admin/coaches" className="text-muted hover:text-foreground">
            Teachers
          </Link>
        </nav>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
