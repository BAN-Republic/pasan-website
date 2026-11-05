/** The site's public origin (no trailing slash) from NEXT_PUBLIC_SITE_URL, or null when unset/invalid. */
export function siteOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}
