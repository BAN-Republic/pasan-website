const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

/**
 * Extracts the 11-character video id from a YouTube link.
 * Accepts youtu.be/ID, /watch?v=ID, /shorts/ID, /embed/ID, /live/ID and /v/ID.
 * Returns null for anything that is not a YouTube video link.
 */
export function getYouTubeId(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);
  let id: string | null = null;

  if (host === "youtu.be" || host === "www.youtu.be") {
    id = segments[0] ?? null;
  } else if (YOUTUBE_HOSTS.has(host)) {
    if (segments[0] === "watch") {
      id = url.searchParams.get("v");
    } else if (["shorts", "embed", "live", "v"].includes(segments[0] ?? "")) {
      id = segments[1] ?? null;
    }
  }

  return id && YOUTUBE_ID.test(id) ? id : null;
}

export type YouTubeThumbnailQuality = "maxresdefault" | "hqdefault" | "mqdefault";

export const YOUTUBE_THUMBNAIL_SIZE: Record<YouTubeThumbnailQuality, { width: number; height: number }> = {
  maxresdefault: { width: 1280, height: 720 },
  hqdefault: { width: 480, height: 360 },
  mqdefault: { width: 320, height: 180 },
};

/**
 * maxresdefault only exists for some videos. When it's missing YouTube answers
 * 404 with a 120×90 grey placeholder (and some mirrors answer 200 with it), so
 * check status and size; hqdefault always exists. Server-side, inside a cache.
 */
export async function bestYouTubeThumbnail(id: string): Promise<"maxresdefault" | "hqdefault"> {
  try {
    const res = await fetch(youTubeThumbnail(id, "maxresdefault"), {
      method: "HEAD",
      signal: AbortSignal.timeout(4000),
    });
    const length = Number(res.headers.get("content-length") ?? 0);
    return res.ok && (length === 0 || length > 5000) ? "maxresdefault" : "hqdefault";
  } catch {
    return "hqdefault";
  }
}

export function youTubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** Privacy-enhanced embed, as in the reference. Mount only on demand. */
export function youTubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
}

export function youTubeThumbnail(
  id: string,
  quality: YouTubeThumbnailQuality = "maxresdefault",
): string {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
}
