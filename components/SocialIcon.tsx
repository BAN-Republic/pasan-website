import type { Socials } from "@/lib/types";

export type SocialKey = keyof Socials;

export const SOCIAL_LABELS: Record<SocialKey, string> = {
  youtube: "YouTube",
  facebook: "Facebook",
  instagram: "Instagram",
  vimeo: "Vimeo",
  linkedin: "LinkedIn",
};

/** Social links that are set, in a fixed order. */
export function socialLinks(socials: Socials | null): { key: SocialKey; url: string }[] {
  if (!socials) return [];
  return (Object.keys(SOCIAL_LABELS) as SocialKey[]).flatMap((key) =>
    socials[key] ? [{ key, url: socials[key] }] : [],
  );
}

// YouTube and Facebook are from the design reference; the others follow the same 1.5px line style.
export default function SocialIcon({ name }: { name: SocialKey }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "youtube" && (
        <>
          <rect x="2" y="5" width="20" height="14" rx="4" />
          <path d="M10 9l5 3-5 3z" />
        </>
      )}
      {name === "facebook" && <path d="M14 8h3V4h-3a4 4 0 00-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8z" />}
      {name === "instagram" && (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.5" />
        </>
      )}
      {name === "vimeo" && <path d="M3 8.5l1 1.2s2-1.6 2.7-.8c.7.8 3.3 10.3 4.2 11.2.9.9 2.6.4 4.4-1.8C17.1 16 21 11 21 7.6S18.7 3.4 16 5.2c-1.3.9-2.4 2.8-2.7 3.9 1.4-.8 2.8-.7 2.4 1.4-.4 2.1-2.2 4.5-3 4.5s-1.6-4.6-2.3-7.3C9.6 4.9 7.7 5 6.4 5.8 5 6.7 3 8.5 3 8.5z" />}
      {name === "linkedin" && (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 014 0v4M12 10v7" />
        </>
      )}
    </svg>
  );
}
