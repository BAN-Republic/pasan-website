// Domain types for every Sanity schema, shaped as the GROQ projections in
// lib/queries.ts return them. Missing optional fields come back as null.

// `title` labels a single film; `chip` labels the filter in Selected work.
export const FILM_CATEGORIES = [
  { value: "tvc", title: "TVC", chip: "TVC" },
  { value: "promo", title: "Promo film", chip: "Promo films" },
  { value: "music", title: "Jingle · Music video", chip: "Jingles & music" },
  { value: "doc", title: "Documentary", chip: "Documentaries" },
  { value: "corp", title: "Corporate", chip: "Corporate" },
] as const;

export type FilmCategory = (typeof FILM_CATEGORIES)[number]["value"];

export const FILM_ROLES = [
  "Director",
  "Cinematographer",
  "Editor",
  "Colorist",
  "Producer",
] as const;

export type FilmRole = (typeof FILM_ROLES)[number];

export const JOURNEY_STATUSES = ["past", "present", "upcoming"] as const;

export type JourneyStatus = (typeof JOURNEY_STATUSES)[number];

/** Fixed document id of the siteSettings singleton. */
export const SITE_SETTINGS_ID = "siteSettings";

export interface SanityImage {
  alt: string | null;
  hotspot: { x: number; y: number; height: number; width: number } | null;
  crop: { top: number; bottom: number; left: number; right: number } | null;
  asset: {
    _id: string;
    url: string;
    metadata: {
      lqip: string | null;
      dimensions: { width: number; height: number; aspectRatio: number };
    };
  };
}

export interface Film {
  _id: string;
  title: string;
  slug: string;
  youtubeUrl: string;
  /** Derived from youtubeUrl at fetch time (lib/youtube.ts). */
  youtubeId: string;
  client: string;
  product: string | null;
  category: FilmCategory;
  year: number | null;
  role: FilmRole[] | null;
  thumbnail: SanityImage | null;
  description: string | null;
  featured: boolean;
}

export interface JourneyStep {
  _id: string;
  period: string;
  title: string;
  organisation: string | null;
  description: string | null;
  status: JourneyStatus;
}

export interface BtsFrame {
  _id: string;
  image: SanityImage;
  caption: string | null;
  label: string | null;
}

export interface Socials {
  youtube: string | null;
  facebook: string | null;
  instagram: string | null;
  vimeo: string | null;
  linkedin: string | null;
}

export interface Award {
  title: string;
  detail: string | null;
}

export interface Stat {
  value: number;
  suffix: string | null;
  label: string;
}

export interface SiteSettings {
  name: string;
  tagline: string | null;
  roles: string[] | null;
  showreelYoutubeUrl: string | null;
  /** Derived from showreelYoutubeUrl at fetch time. */
  showreelYoutubeId: string | null;
  email: string | null;
  location: string | null;
  availability: string | null;
  socials: Socials | null;
  bioParagraphs: string[] | null;
  awards: Award[] | null;
  stats: Stat[] | null;
  clients: string[] | null;
  marqueeWords: string[] | null;
  craftTags: string[] | null;
  journeyIntro: string | null;
  footerLine: string | null;
  heroImage: SanityImage | null;
  portraitImage: SanityImage | null;
  gradeLabImage: SanityImage | null;
  contactImage: SanityImage | null;
  quote: string | null;
}
