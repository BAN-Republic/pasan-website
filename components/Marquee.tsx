interface MarqueeProps {
  words: string[];
}

export default function Marquee({ words }: MarqueeProps) {
  if (words.length === 0) return null;
  // Doubled so the -50% keyframe loops seamlessly.
  return (
    <div className="strip-m" aria-hidden="true">
      <div className="mq" id="mq">
        {[...words, ...words].map((word, i) => (
          <span key={i}>{word}</span>
        ))}
      </div>
    </div>
  );
}
