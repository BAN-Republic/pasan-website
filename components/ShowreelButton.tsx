interface ShowreelButtonProps {
  youtubeId: string | null;
}

// TODO(Step 6): open VideoModal with the showreel.
export default function ShowreelButton({ youtubeId }: ShowreelButtonProps) {
  if (!youtubeId) return null;
  return (
    <button className="btn-reel" type="button" data-reel="" data-cur="Play">
      <span className="ring">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 1.5v13l11-6.5z" />
        </svg>
      </span>
      Watch Showreel
    </button>
  );
}
