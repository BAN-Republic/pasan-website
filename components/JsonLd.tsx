import { toPlainText } from "next-sanity";
import { socialLinks } from "@/components/SocialIcon";
import { sanityImageUrl } from "@/lib/image";
import { filmHash } from "@/lib/player";
import { siteOrigin } from "@/lib/site";
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
 * Person (SPEC §8), the showreel VideoObject and an ItemList of the films. Only facts from Sanity:
 * a VideoObject needs uploadDate, so one is only emitted when a release date is
 * set; films without one stay in the ItemList as a plain entry.
 */
export default function JsonLd({ settings, films }: JsonLdProps) {
  const siteUrl = siteOrigin();
  const data: object[] = [];
  const personId = siteUrl ? `${siteUrl}/#person` : undefined;

  if (settings) {
    const sameAs = socialLinks(settings.socials).map((s) => s.url);
    const portrait = settings.portraitImage ?? settings.heroImage;
    data.push({
      "@context": "https://schema.org",
      "@type": "Person",
      ...(personId ? { "@id": personId, url: `${siteUrl}/` } : {}),
      name: settings.name,
      jobTitle: "Commercial Film Director",
      ...(settings.tagline ? { description: settings.tagline } : {}),
      ...(portrait ? { image: sanityImageUrl(portrait, 1200) } : {}),
      ...(settings.email ? { email: `mailto:${settings.email}` } : {}),
      ...(settings.phone ? { telephone: settings.phone } : {}),
      ...(settings.location ? { homeLocation: { "@type": "Place", name: settings.location } } : {}),
      ...(settings.craftTags?.length ? { knowsAbout: settings.craftTags } : {}),
      ...(settings.awards?.length ? { award: settings.awards.map((a) => (a.detail?.length ? `${a.title}: ${toPlainText(a.detail)}` : a.title)) } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    });
  }

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
      creator: personId ? { "@id": personId } : { "@type": "Person", name: settings.name },
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
