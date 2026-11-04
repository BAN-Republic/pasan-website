"use client";

import Image from "next/image";
import { sanityImageProps } from "@/lib/image";
import type { BtsFrame } from "@/lib/types";

interface FilmStripProps {
  frames: BtsFrame[];
}

// TODO(Step 7): drag to scroll, prev/next buttons.
export default function FilmStrip({ frames }: FilmStripProps) {
  if (frames.length === 0) return null;
  return (
    <section className="sec" id="journal" style={{ paddingBottom: 0 }}>
      <div className="wrap">
        <div className="sh">
          <div>
            <p className="k mono">Scene 06 · BTS journal</p>
            <h2>Off the call sheet</h2>
          </div>
          <div className="film-ctl">
            <button type="button" id="fprev" aria-label="Previous frames">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button type="button" id="fnext" aria-label="Next frames">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="film">
        <div className="reelx" id="reelx" data-cur="Drag">
          {frames.map((frame) => {
            const img = sanityImageProps(frame.image, 900);
            return (
              <figure className="frame" key={frame._id}>
                <div className="im2">
                  <Image {...img} alt={img.alt} sizes="(max-width: 760px) 260px, 32vw" />
                </div>
                {(frame.caption || frame.label) && (
                  <figcaption>
                    <span>{frame.caption}</span>
                    {frame.label && <span className="mono">{frame.label}</span>}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
