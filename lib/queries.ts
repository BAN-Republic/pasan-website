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
import { getYouTubeId } from "@/lib/youtube";

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

export async function getFilms(): Promise<Film[]> {
  "use cache";
  cacheTag("content");
  cacheLife("hours");
  const films = await client.fetch<Omit<Film, "youtubeId">[]>(FILMS_QUERY);
  return films.flatMap((film) => {
    const youtubeId = getYouTubeId(film.youtubeUrl);
    return youtubeId ? [{ ...film, youtubeId }] : [];
  });
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
  const settings = await client.fetch<Omit<SiteSettings, "showreelYoutubeId"> | null>(
    SETTINGS_QUERY,
    { id: SITE_SETTINGS_ID },
  );
  if (!settings) return null;
  return {
    ...settings,
    showreelYoutubeId: settings.showreelYoutubeUrl
      ? getYouTubeId(settings.showreelYoutubeUrl)
      : null,
  };
}
