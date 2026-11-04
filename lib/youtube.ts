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

export function youTubeThumbnail(
  id: string,
  quality: YouTubeThumbnailQuality = "maxresdefault",
): string {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
}
