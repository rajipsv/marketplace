import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private or per-user pages
      disallow: ["/admin", "/coach/", "/account", "/my-sessions", "/book/", "/api/", "/media/private", "/login", "/signup", "/offline"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
