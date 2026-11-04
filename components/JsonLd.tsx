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
 * Showreel VideoObject and an ItemList of the films. Only facts from Sanity;
 * uploadDate is left out because we don't store it.
 */
export default function JsonLd({ settings, films }: JsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const data: object[] = [];

  if (settings?.showreelYoutubeId) {
    const id = settings.showreelYoutubeId;
    data.push({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: `${settings.name} · Director's showreel`,
      description: settings.tagline ?? `Director's showreel of ${settings.name}`,
      thumbnailUrl: youTubeThumbnail(id, settings.showreelYoutubeThumbnail ?? "hqdefault"),
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
      itemListElement: films.map((film, i) => ({
        "@type": "ListItem",
        position: i + 1,
        ...(siteUrl ? { url: `${siteUrl}/${filmHash(film.slug)}` } : {}),
        item: {
          "@type": "VideoObject",
          name: film.title,
          description: film.description ?? `${categoryLabel(film.category)} · ${film.client}`,
          thumbnailUrl: youTubeThumbnail(film.youtubeId, film.youtubeThumbnail),
          embedUrl: embed(film.youtubeId),
          contentUrl: youTubeWatchUrl(film.youtubeId),
        },
      })),
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
