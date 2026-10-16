import Link from "next/link";
import { requireRole } from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["admin"], "/admin");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-4 border-b border-border pb-4">
        <p className="font-display text-xl font-semibold">Admin</p>
        <nav aria-label="Admin" className="no-scrollbar flex gap-4 overflow-x-auto text-sm font-medium whitespace-nowrap">
          <Link href="/admin" className="text-muted hover:text-foreground">
            Overview
          </Link>
          <Link href="/admin/coaches" className="text-muted hover:text-foreground">
            Teachers
          </Link>
          <Link href="/admin/bookings" className="text-muted hover:text-foreground">
            Bookings
          </Link>
          <Link href="/admin/requests" className="text-muted hover:text-foreground">
            Requests
          </Link>
          <Link href="/admin/coupons" className="text-muted hover:text-foreground">
            Offer codes
          </Link>
        </nav>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
