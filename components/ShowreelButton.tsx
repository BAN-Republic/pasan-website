"use client";

import { openReel } from "@/lib/player";

interface ShowreelButtonProps {
  youtubeId: string | null;
}

export default function ShowreelButton({ youtubeId }: ShowreelButtonProps) {
  if (!youtubeId) return null;
  return (
    <button className="btn-reel" type="button" data-reel="" data-cur="Play" onClick={openReel}>
      <span className="ring">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 1.5v13l11-6.5z" />
        </svg>
      </span>
      Watch Showreel
    </button>
  );
}
