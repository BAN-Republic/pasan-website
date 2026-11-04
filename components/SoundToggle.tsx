"use client";

// TODO(Step 5): Web Audio sound engine (lib/sound.ts), off by default.
export default function SoundToggle() {
  return (
    <button className="sound mono" id="soundBtn" aria-pressed="false" type="button">
      <span className="bars">
        <i></i>
        <i></i>
        <i></i>
        <i></i>
      </span>
      <span id="soundLbl">Sound off</span>
    </button>
  );
}
