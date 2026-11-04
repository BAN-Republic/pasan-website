"use client";

import { useSyncExternalStore } from "react";
import { isSoundOn, setSound, subscribeSound, tick } from "@/lib/sound";

export default function SoundToggle() {
  // Server snapshot is "off", so hydration always matches; the saved choice applies after.
  const on = useSyncExternalStore(subscribeSound, isSoundOn, () => false);
  return (
    <button
      className={on ? "sound mono on" : "sound mono"}
      id="soundBtn"
      type="button"
      aria-pressed={on}
      onClick={() => {
        setSound(!on);
        tick();
      }}
    >
      <span className="bars" aria-hidden="true">
        <i></i>
        <i></i>
        <i></i>
        <i></i>
      </span>
      <span id="soundLbl">{on ? "Sound on" : "Sound off"}</span>
    </button>
  );
}
