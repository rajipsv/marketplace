import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/**
 * Page-level `openGraph` replaces the layout's instead of merging, so pages
 * that customise link previews spread these defaults first.
 */
export const baseOpenGraph = {
  type: "website",
  siteName: siteConfig.name,
  locale: "en_US",
  images: ["/opengraph-image"],
} satisfies NonNullable<Metadata["openGraph"]>;
