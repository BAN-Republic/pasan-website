import { filmHash } from "@/lib/player";
import { categoryLabel, type Film, type SiteSettings } from "@/lib/types";
import { youTubeEmbedUrl, youTubeThumbnail, youTubeWatchUrl } from "@/lib/youtube";

interface JsonLdProps {
  settings: SiteSettings | null;
  films: Film[];
}

function embed(id: string) {
  // Structured data points at the plain embed, without autoplay.
  return youTubeEmbedUrl(id).split("?")[0];
}

/**
 * Showreel VideoObject and an ItemList of the films. Only facts from Sanity:
 * a VideoObject needs uploadDate, so one is only emitted when a release date is
 * set; films without one stay in the ItemList as a plain entry.
 */
export default function JsonLd({ settings, films }: JsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const data: object[] = [];

  if (settings?.showreelYoutubeId && settings.showreelReleaseDate) {
    const id = settings.showreelYoutubeId;
    data.push({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: `${settings.name} · Director's showreel`,
      description: settings.tagline ?? `Director's showreel of ${settings.name}`,
      thumbnailUrl: youTubeThumbnail(id, settings.showreelYoutubeThumbnail ?? "hqdefault"),
      uploadDate: settings.showreelReleaseDate,
      embedUrl: embed(id),
      contentUrl: youTubeWatchUrl(id),
      creator: { "@type": "Person", name: settings.name },
    });
  }

  if (films.length > 0) {
    data.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Selected work",
      numberOfItems: films.length,
      itemListElement: films.map((film, i) => {
        const url = siteUrl ? `${siteUrl}/${filmHash(film.slug)}` : youTubeWatchUrl(film.youtubeId);
        if (!film.releaseDate) {
          return { "@type": "ListItem", position: i + 1, name: film.title, url };
        }
        return {
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "VideoObject",
            name: film.title,
            description: film.description ?? `${categoryLabel(film.category)} · ${film.client}`,
            thumbnailUrl: youTubeThumbnail(film.youtubeId, film.youtubeThumbnail),
            uploadDate: film.releaseDate,
            embedUrl: embed(film.youtubeId),
            contentUrl: youTubeWatchUrl(film.youtubeId),
            url,
          },
        };
      }),
    });
  }

  if (data.length === 0) return null;
  return (
    <script
      type="application/ld+json"
      // `<` escaped so a title can never close the script tag (Next.js JSON-LD guide).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
