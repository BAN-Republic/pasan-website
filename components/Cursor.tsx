"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { getPlayer, subscribePlayer } from "@/lib/player";

const OFF = -100;

/**
 * The reference's viewfinder cursor: a ring that eases after the pointer and grows
 * into a labelled disc over anything with data-cur="Play" / "Drag" / "Action" / …
 *
 * - Fine pointers only, and off under prefers-reduced-motion. It re-checks if either changes.
 * - Off while a YouTube player is open. The player is a cross-origin iframe: once the pointer
 *   is over it the page receives no events at all (not even :hover), so the ring would freeze
 *   on top of the video. The native cursor is used in the player view instead.
 * - Also hidden over any other iframe, as far as the page can tell.
 * - Mounted only by the (site) layout, and it removes `has-cur` from <body> on unmount, so
 *   it never reaches the Studio at /admin.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const playerOpen = useSyncExternalStore(subscribePlayer, () => getPlayer() !== null, () => false);

  useEffect(() => {
    const el = ref.current;
    const label = labelRef.current;
    if (!el || !label) return;

    const fine = matchMedia("(pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let mx = OFF, my = OFF, cx = OFF, cy = OFF;
    let raf = 0;
    let active = false;

    const hide = () => {
      mx = my = OFF;
      el.classList.remove("big");
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return hide();
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest("iframe")) return hide();
      mx = e.clientX;
      my = e.clientY;
      const hit = target?.closest<HTMLElement>("[data-cur]");
      el.classList.toggle("big", Boolean(hit));
      if (hit?.dataset.cur) label.textContent = hit.dataset.cur.toUpperCase();
    };

    // Moving out of the window (or, in some browsers, into an iframe) fires pointerout
    // with no relatedTarget or with the iframe as relatedTarget.
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget || e.relatedTarget instanceof HTMLIFrameElement) hide();
    };

    const frame = () => {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      // Snap when hiding so the ring doesn't glide across the page to the corner.
      if (mx === OFF) cx = cy = OFF;
      el.style.transform = `translate(${cx}px,${cy}px)`;
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (active) return;
      active = true;
      document.body.classList.add("has-cur");
      addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerout", onOut, { passive: true });
      document.documentElement.addEventListener("pointerleave", hide);
      addEventListener("blur", hide);
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      if (!active) return;
      active = false;
      cancelAnimationFrame(raf);
      document.body.classList.remove("has-cur");
      removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      document.documentElement.removeEventListener("pointerleave", hide);
      removeEventListener("blur", hide);
      hide();
    };

    const sync = () => (fine.matches && !reduced.matches && !playerOpen ? start() : stop());
    sync();
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      stop();
    };
  }, [playerOpen]);

  return (
    <div className="cur" id="cur" ref={ref} aria-hidden="true">
      <div className="o" />
      <div className="l" ref={labelRef}>
        VIEW
      </div>
    </div>
  );
}
