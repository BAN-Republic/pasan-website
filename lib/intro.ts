// Coordination between the inline intro script, <Intro> and the hero.
//
// The inline script in components/IntroScript.tsx runs before first paint and
// sets <html data-intro="play" | "skip">. <Intro> sets it to "done" when the
// sequence ends, and fires INTRO_DONE_EVENT so the hero can frame itself.

export const INTRO_SEEN_KEY = "intro-seen";
export const INTRO_DONE_EVENT = "site:intro-done";

export type IntroState = "play" | "skip" | "done";

export function introState(): IntroState {
  const v = document.documentElement.dataset.intro;
  return v === "play" || v === "done" ? v : "skip";
}

/** Runs `callback` once the intro is finished or skipped. Returns a cleanup. */
export function onIntroDone(callback: () => void): () => void {
  if (introState() !== "play") {
    callback();
    return () => {};
  }
  window.addEventListener(INTRO_DONE_EVENT, callback, { once: true });
  return () => window.removeEventListener(INTRO_DONE_EVENT, callback);
}
