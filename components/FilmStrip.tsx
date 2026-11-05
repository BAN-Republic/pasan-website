"use client";

import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import { sanityImageProps } from "@/lib/image";
import { tick } from "@/lib/sound";
import type { BtsFrame } from "@/lib/types";

interface FilmStripProps {
  frames: BtsFrame[];
}

/**
 * BTS journal: drag with the mouse (touch uses native swipe scrolling), prev/next
 * buttons, and arrow keys once the strip has focus (it is a focusable scroll region).
 */
export default function FilmStrip({ frames }: FilmStripProps) {
  const strip = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; scrollLeft: number } | null>(null);

  if (frames.length === 0) return null;

  // One frame plus the 10px gap, as in the reference.
  const step = () => (strip.current?.querySelector<HTMLElement>(".frame")?.offsetWidth ?? 0) + 10;
  const scroll = (direction: 1 | -1) => {
    strip.current?.scrollBy({ left: direction * step(), behavior: "smooth" });
    tick();
  };

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const el = event.currentTarget;
    drag.current = { x: event.clientX, scrollLeft: el.scrollLeft };
    el.classList.add("drag");
    el.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    event.currentTarget.scrollLeft = drag.current.scrollLeft - (event.clientX - drag.current.x);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    drag.current = null;
    event.currentTarget.classList.remove("drag");
  }

  return (
    <section className="sec" id="journal" style={{ paddingBottom: 0 }}>
      <div className="wrap">
        <div className="sh">
          <div>
            <p className="k mono">Scene 06 · BTS journal</p>
            <h2>Off the call sheet</h2>
          </div>
          <div className="film-ctl">
            <button type="button" id="fprev" aria-label="Previous frames" aria-controls="reelx" onClick={() => scroll(-1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button type="button" id="fnext" aria-label="Next frames" aria-controls="reelx" onClick={() => scroll(1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="film">
        <div
          className="reelx"
          id="reelx"
          ref={strip}
          data-cur="Drag"
          tabIndex={0}
          role="region"
          aria-label="Behind-the-scenes frames. Use the arrow keys to scroll."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {frames.map((frame, i) => {
            const img = sanityImageProps(frame.image, 900, frame.caption ?? "");
            const number = `F${String(i + 1).padStart(3, "0")}`;
            return (
              <figure className="frame" key={frame._id}>
                <div className="im2">
                  <Image
                    {...img}
                    alt={img.alt}
                    draggable={false}
                    sizes="(max-width: 812px) 260px, (max-width: 1375px) 32vw, 440px"
                  />
                </div>
                <figcaption>
                  <span>{frame.caption}</span>
                  <span className="mono">{frame.label ? `${frame.label} · ${number}` : number}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
