import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";

// Only the public, canonical pages. The auth-gated /welcome redirects without a
// session, and per-user /t/[handle] trackers are dynamic and unbounded, so
// neither belongs in the sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${BRAND.url}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BRAND.url}/discovery`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
