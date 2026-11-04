import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

// Server-side, read-only, published content only. Next's 'use cache' does the
// caching, so skip Sanity's CDN to get fresh data as soon as a webhook expires the tag.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});
