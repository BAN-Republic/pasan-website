import type { MetadataRoute } from "next";
import { sanityImageUrl } from "@/lib/image";
import { getSettings } from "@/lib/queries";
import { siteOrigin } from "@/lib/site";

// One-page site: the home page is the only URL. Films open as #film-… hashes,
// which search engines treat as the same page, so they aren't listed.
// Empty until NEXT_PUBLIC_SITE_URL is set (sitemaps need absolute URLs).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  if (!origin) return [];
  const settings = await getSettings();
  const images = [settings?.heroImage, settings?.portraitImage]
    .filter((image) => image != null)
    .map((image) => sanityImageUrl(image, 1600));
  return [{ url: `${origin}/`, changeFrequency: "monthly", priority: 1, ...(images.length ? { images } : {}) }];
}
