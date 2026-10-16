import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground"
          >
            ॐ
          </span>
          {siteConfig.name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-5 text-sm font-medium md:flex">
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/teach"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-primary hover:bg-surface-muted sm:inline-block"
          >
            Teach with us
          </Link>
          <Link href="/login" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-surface-muted">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
          >
            Join free
          </Link>
        </div>
      </div>
    </header>
  );
}
