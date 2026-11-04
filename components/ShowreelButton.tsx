"use client";

interface ShowreelButtonProps {
  youtubeId: string | null;
}

export default function ShowreelButton({ youtubeId }: ShowreelButtonProps) {
  if (!youtubeId) return null;
  return (
    <button
      className="btn-reel"
      type="button"
      data-reel=""
      data-cur="Play"
      // TODO(Step 6): open the showreel in VideoModal. Until then, YouTube in a new tab.
      onClick={() =>
        window.open(`https://www.youtube.com/watch?v=${youtubeId}`, "_blank", "noopener,noreferrer")
      }
    >
      <span className="ring">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 1.5v13l11-6.5z" />
        </svg>
      </span>
      Watch Showreel
    </button>
  );
}
