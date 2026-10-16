import { siteConfig } from "@/config/site";

/** Shared layout for policy pages: readable column, consistent headings. */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">Effective {siteConfig.legal.effectiveDate}</p>
      <div className="mt-8 space-y-4 leading-relaxed text-muted [&_a]:font-semibold [&_a]:text-primary [&_a:hover]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground [&_ul]:space-y-1">
        {children}
      </div>
    </article>
  );
}

/** Business identity block used across policies. */
export function BusinessDetails() {
  const l = siteConfig.legal;
  return (
    <p>
      <strong>{l.businessName}</strong>
      <br />
      {l.address}
      <br />
      Email: <a href={`mailto:${l.email}`}>{l.email}</a>
      <br />
      Phone: {l.phone}
    </p>
  );
}
