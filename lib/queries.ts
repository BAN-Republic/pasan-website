import { cacheLife, cacheTag } from "next/cache";
import { defineQuery } from "next-sanity";
import { client } from "@/lib/sanity.client";
import {
  SITE_SETTINGS_ID,
  type BtsFrame,
  type Film,
  type JourneyStep,
  type SiteSettings,
} from "@/lib/types";
import { bestYouTubeThumbnail, getYouTubeId } from "@/lib/youtube";

// Shape every image the same way so next/image gets dimensions and a blur placeholder.
const IMAGE = /* groq */ `{
  alt,
  hotspot,
  crop,
  asset->{ _id, url, metadata { lqip, dimensions { width, height, aspectRatio } } }
}`;

export const FILMS_QUERY = defineQuery(`
  *[_type == "film" && published != false && defined(youtubeUrl)] | order(orderRank) {
    _id,
    title,
    "slug": slug.current,
    youtubeUrl,
    client,
    product,
    category,
    year,
    role,
    thumbnail ${IMAGE},
    description,
    "featured": featured == true
  }
`);

export const JOURNEY_QUERY = defineQuery(`
  *[_type == "journeyStep"] | order(orderRank) {
    _id,
    period,
    title,
    organisation,
    description,
    status
  }
`);

export const BTS_QUERY = defineQuery(`
  *[_type == "btsFrame" && defined(image.asset)] | order(orderRank) {
    _id,
    image ${IMAGE},
    caption,
    label
  }
`);

export const SETTINGS_QUERY = defineQuery(`
  *[_id == $id][0] {
    name,
    tagline,
    roles,
    showreelYoutubeUrl,
    email,
    location,
    availability,
    socials { youtube, facebook, instagram, vimeo, linkedin },
    bioParagraphs,
    awards[] { title, detail },
    stats[] { value, suffix, label },
    clients,
    marqueeWords,
    craftTags,
    journeyIntro,
    footerLine,
    heroImage ${IMAGE},
    portraitImage ${IMAGE},
    gradeLabImage ${IMAGE},
    contactImage ${IMAGE},
    quote
  }
`);

// Cached fetch helpers. All share the 'content' tag, which the Sanity webhook
// expires (SPEC §7). cacheLife('hours') is only a fallback if a webhook is missed.

/**
 * Published films in display order: Studio order, except that the first
 * featured film moves to the front (it becomes the large card).
 */
export async function getFilms(): Promise<Film[]> {
  "use cache";
  cacheTag("content");
  cacheLife("hours");
  const raw = await client.fetch<Omit<Film, "youtubeId" | "youtubeThumbnail">[]>(FILMS_QUERY);
  const films = await Promise.all(
    raw.map(async (film) => {
      const youtubeId = getYouTubeId(film.youtubeUrl);
      if (!youtubeId) return null;
      // Only needed when there is no Sanity thumbnail.
      const youtubeThumbnail = film.thumbnail ? "hqdefault" : await bestYouTubeThumbnail(youtubeId);
      return { ...film, youtubeId, youtubeThumbnail } satisfies Film;
    }),
  );
  const list = films.filter((film): film is Film => film !== null);
  const featured = list.findIndex((film) => film.featured);
  return featured > 0 ? [list[featured], ...list.filter((_, i) => i !== featured)] : list;
}

export async function getJourney(): Promise<JourneyStep[]> {
  "use cache";
  cacheTag("content");
  cacheLife("hours");
  return client.fetch<JourneyStep[]>(JOURNEY_QUERY);
}

export async function getBtsFrames(): Promise<BtsFrame[]> {
  "use cache";
  cacheTag("content");
  cacheLife("hours");
  return client.fetch<BtsFrame[]>(BTS_QUERY);
}

export async function getSettings(): Promise<SiteSettings | null> {
  "use cache";
  cacheTag("content");
  cacheLife("hours");
  const settings = await client.fetch<
    Omit<SiteSettings, "showreelYoutubeId" | "showreelYoutubeThumbnail"> | null
  >(
    SETTINGS_QUERY,
    { id: SITE_SETTINGS_ID },
  );
  if (!settings) return null;
  const showreelYoutubeId = settings.showreelYoutubeUrl
    ? getYouTubeId(settings.showreelYoutubeUrl)
    : null;
  return {
    ...settings,
    showreelYoutubeId,
    showreelYoutubeThumbnail: showreelYoutubeId ? await bestYouTubeThumbnail(showreelYoutubeId) : null,
  };
}
