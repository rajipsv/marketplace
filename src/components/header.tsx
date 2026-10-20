import Link from "next/link";
import { HeaderAuth } from "@/components/auth/header-auth";
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
            {siteConfig.name[0]}
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
          <HeaderAuth />
        </div>
      </div>

      {/* Phones: the main links as a swipeable row under the logo bar */}
      <nav
        aria-label="Main"
        className="no-scrollbar flex gap-5 overflow-x-auto border-t border-border px-4 py-2.5 text-sm font-medium whitespace-nowrap md:hidden"
      >
        {siteConfig.nav.map((item) => (
          <Link key={item.href} href={item.href} className="text-muted hover:text-foreground">
            {item.label}
          </Link>
        ))}
        <Link href="/teach" className="text-primary">
          Teach with us
        </Link>
      </nav>
    </header>
  );
}
