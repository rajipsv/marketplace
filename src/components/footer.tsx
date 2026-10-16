import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getCategories } from "@/lib/queries";

const company = [
  { label: "About us", href: "/about" },
  { label: "Teach with us", href: "/teach" },
  { label: "Trust & safety", href: "/trust" },
  { label: "Help & FAQ", href: "/help" },
  { label: "Contact", href: "/contact" },
];

const legal = [
  { label: "Terms of service", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Cancellation & refunds", href: "/refunds" },
  { label: "Disclaimer", href: "/disclaimer" },
];

export async function Footer() {
  const categories = await getCategories();
  return (
    <footer className="mt-24 border-t border-border bg-surface-muted">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl font-semibold">{siteConfig.name}</p>
          <p className="mt-2 text-sm text-muted">{siteConfig.description}</p>
        </div>
        <FooterList title="Explore" items={categories.map((c) => ({ label: c.name, href: `/explore?category=${c.slug}` }))} />
        <FooterList title="Company" items={company} />
        <FooterList title="Legal" items={legal} />
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed text-muted">
          Sessions are for learning, cultural, spiritual and wellness purposes. They are not medical,
          psychological, legal or financial advice. Astrology and related readings are offered for
          spiritual guidance. © {new Date().getFullYear()} {siteConfig.name}.
        </p>
      </div>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="hover:text-foreground">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
