import type { MetadataRoute } from "next";

// TODO: add sitemap URL from NEXT_PUBLIC_SITE_URL (SPEC §8).
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: "/admin" } };
}
