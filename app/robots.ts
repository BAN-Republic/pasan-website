import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site";

// The Studio (/admin) and the API routes stay out of search results.
export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    ...(origin ? { sitemap: `${origin}/sitemap.xml`, host: origin } : {}),
  };
}
