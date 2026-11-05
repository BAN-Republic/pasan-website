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
  /** From the Sanity hotspot, so object-fit: cover crops around it. */
  style?: { objectPosition: string };
}

const pct = (n: number) => `${Math.round(Math.min(1, Math.max(0, n)) * 1000) / 10}%`;

/**
 * Props for next/image from a Sanity image, capped at `maxWidth` px wide.
 * The editor's crop is applied by the image URL (rect=…); the hotspot becomes
 * object-position, because the layouts size images with object-fit: cover.
 */
export function sanityImageProps(
  image: SanityImage,
  maxWidth: number,
  fallbackAlt = "",
): ImageProps {
  const { width, height } = image.asset.metadata.dimensions;
  const crop = image.crop ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const cropWidth = width * (1 - crop.left - crop.right);
  const cropHeight = height * (1 - crop.top - crop.bottom);
  const w = Math.round(Math.min(maxWidth, cropWidth));
  const lqip = image.asset.metadata.lqip;
  const hotspot = image.hotspot;
  return {
    src: builder.image(image).width(w).auto("format").url(),
    width: w,
    height: Math.round((w * cropHeight) / cropWidth),
    alt: image.alt || fallbackAlt,
    ...(lqip ? { placeholder: "blur" as const, blurDataURL: lqip } : {}),
    ...(hotspot
      ? {
          style: {
            // Hotspot is relative to the original image; re-base it on the crop.
            objectPosition: `${pct((hotspot.x - crop.left) / (1 - crop.left - crop.right))} ${pct((hotspot.y - crop.top) / (1 - crop.top - crop.bottom))}`,
          },
        }
      : {}),
  };
}

/**
 * A transparent logo shown at `displayWidth` CSS px (set the size in CSS and pass
 * `sizes`). The source is 2× that for retina. width/height are the source file's
 * own pixel size, as Sanity rounds it: using the display size instead made the
 * height attribute differ from the rendered height by a rounding pixel, which
 * next/image reports as "width or height modified, but not the other".
 * No blur placeholder: it would show a box behind the transparency.
 */
export function logoImageProps(image: SanityImage, displayWidth: number, fallbackAlt: string): ImageProps {
  const { width, height } = image.asset.metadata.dimensions;
  const sourceWidth = Math.min(width, displayWidth * 2);
  return {
    src: builder.image(image).width(sourceWidth).auto("format").url(),
    width: sourceWidth,
    height: Math.round((sourceWidth * height) / width),
    alt: image.alt || fallbackAlt,
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
