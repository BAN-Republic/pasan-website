// Copy from the design reference.
const WORDS = [
  "Commercial Direction",
  "Cinematography",
  "Editing",
  "Colour Grading",
  "TV Commercials",
  "Brand Films",
  "Documentary",
  "Music Videos",
  "Colombo",
];

export default function Marquee() {
  // Doubled so the -50% keyframe loops seamlessly.
  return (
    <div className="strip-m" aria-hidden="true">
      <div className="mq" id="mq">
        {[...WORDS, ...WORDS].map((word, i) => (
          <span key={i}>{word}</span>
        ))}
      </div>
    </div>
  );
}
