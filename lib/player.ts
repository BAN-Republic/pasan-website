// What the single <VideoModal> is showing, kept in sync with the URL hash:
//   #film-<slug>  a film, with prev/next inside `queue` (the active filter)
//   #reel         the showreel
// Opening pushes a history entry, so the back button closes the modal; a hash
// in a shared link or from back/forward opens it without pushing.

export type PlayerState =
  | { kind: "film"; slug: string; queue: string[] }
  | { kind: "reel" }
  | null;

let state: PlayerState = null;
/** True while the open modal owns the current history entry. */
let pushed = false;
let opener: HTMLElement | null = null;
let afterClose: (() => void) | null = null;
const listeners = new Set<() => void>();

export function subscribePlayer(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPlayer(): PlayerState {
  return state;
}

export function filmHash(slug: string) {
  return `#film-${slug}`;
}

function hashFor(next: PlayerState): string {
  if (next?.kind === "film") return filmHash(next.slug);
  if (next?.kind === "reel") return "#reel";
  return "";
}

function set(next: PlayerState, history: "push" | "replace" | "none") {
  state = next;
  const url = hashFor(next) || `${location.pathname}${location.search}`;
  if (history === "push") {
    window.history.pushState(null, "", url);
    pushed = true;
  } else if (history === "replace") {
    window.history.replaceState(window.history.state, "", url);
  }
  listeners.forEach((listener) => listener());
}

function open(next: NonNullable<PlayerState>) {
  if (!state) opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  set(next, state ? "replace" : "push");
}

export function openFilm(slug: string, queue: string[]) {
  open({ kind: "film", slug, queue });
}

export function openReel() {
  open({ kind: "reel" });
}

/** Move within the active filter, wrapping at the ends. */
export function stepFilm(delta: number) {
  if (state?.kind !== "film") return;
  const { queue, slug } = state;
  const i = queue.indexOf(slug);
  set({ kind: "film", queue, slug: queue[(i + delta + queue.length) % queue.length] }, "replace");
}

/** Close; `then` runs once the modal is gone (e.g. to scroll somewhere). */
export function closePlayer(then?: () => void) {
  if (!state) return;
  afterClose = then ?? null;
  if (pushed) {
    // Leave the history as it was before opening; popstate finishes the close.
    pushed = false;
    window.history.back();
  } else {
    finishClose("replace");
  }
}

function finishClose(history: "replace" | "none") {
  const focusTarget = opener;
  const then = afterClose;
  opener = null;
  afterClose = null;
  pushed = false;
  set(null, history);
  // After React has removed the modal and the page is no longer inert.
  setTimeout(() => {
    focusTarget?.focus({ preventScroll: true });
    then?.();
  }, 0);
}

/** Open or close to match location.hash (initial load, back/forward, hash links). */
export function syncFromHash(slugs: string[], hasReel: boolean) {
  const hash = location.hash;
  if (hash.startsWith("#film-")) {
    const slug = decodeURIComponent(hash.slice("#film-".length));
    if (slugs.includes(slug)) {
      if (state?.kind === "film" && state.slug === slug) return;
      const queue = state?.kind === "film" && state.queue.includes(slug) ? state.queue : slugs;
      set({ kind: "film", slug, queue }, "none");
      return;
    }
  } else if (hash === "#reel" && hasReel) {
    if (state?.kind !== "reel") set({ kind: "reel" }, "none");
    return;
  }
  if (state) finishClose("none");
}
