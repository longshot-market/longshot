import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";

// Allow crawling of the public pages; keep the auth flow, API, and per-user
// tracker pages out of the index. Points crawlers at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/welcome", "/api/", "/t/"],
    },
    sitemap: `${BRAND.url}/sitemap.xml`,
    host: BRAND.url,
  };
}
