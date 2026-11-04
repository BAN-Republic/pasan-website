import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "@/sanity/env";
import type { Film, SanityImage } from "@/lib/types";
import { YOUTUBE_THUMBNAIL_SIZE, youTubeThumbnail } from "@/lib/youtube";

// Kept apart from lib/sanity.client.ts so client components can build image
// URLs without bundling the Sanity query client.
const builder = createImageUrlBuilder({ projectId, dataset });

export interface ImageProps {
  src: string;
  width: number;
  height: number;
  alt: string;
  placeholder?: "blur";
  blurDataURL?: string;
}

/** Props for next/image from a Sanity image, capped at `maxWidth` px wide. */
export function sanityImageProps(
  image: SanityImage,
  maxWidth: number,
  fallbackAlt = "",
): ImageProps {
  const { width, height } = image.asset.metadata.dimensions;
  const w = Math.min(maxWidth, width);
  const lqip = image.asset.metadata.lqip;
  return {
    src: builder.image(image).width(w).auto("format").url(),
    width: w,
    height: Math.round((w * height) / width),
    alt: image.alt || fallbackAlt,
    ...(lqip ? { placeholder: "blur" as const, blurDataURL: lqip } : {}),
  };
}

/** Card thumbnail: the Sanity image if set, otherwise the best YouTube frame (chosen in getFilms). */
export function filmThumbnailProps(film: Film): ImageProps {
  if (film.thumbnail) return sanityImageProps(film.thumbnail, 1280);
  return youTubeThumbnailProps(film.youtubeId, film.youtubeThumbnail);
}

export function youTubeThumbnailProps(id: string, quality: "maxresdefault" | "hqdefault"): ImageProps {
  return { src: youTubeThumbnail(id, quality), ...YOUTUBE_THUMBNAIL_SIZE[quality], alt: "" };
}
