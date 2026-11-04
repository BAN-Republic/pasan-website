"use client";

import Image from "next/image";
import { sanityImageProps } from "@/lib/image";
import type { SanityImage } from "@/lib/types";

interface GradeLabProps {
  image: SanityImage | null;
}

// TODO(Step 7): slider, the five looks with colour wheels and readout (copy from the reference).
export default function GradeLab({ image }: GradeLabProps) {
  const img = image ? sanityImageProps(image, 1800) : null;
  return (
    <section className="sec" id="grade" style={{ background: "var(--char)", borderBlock: "1px solid var(--line)" }}>
      <div className="wrap">
        <div className="sh">
          <div>
            <p className="k mono">Scene 03 · The grade</p>
            <h2>
              Drag to grade
              <br />
              the frame
            </h2>
          </div>
          <p className="lede">
            Every frame leaves camera flat, in log. This is where the look is made. Drag across the
            shot to compare the raw capture with the finished grade, then try a different look.
          </p>
        </div>
        <div className="lab-wrap">
          <div className="lab" id="lab">
            {img && (
              <>
                <Image {...img} alt="" className="base" sizes="(max-width: 1080px) 100vw, 75vw" />
                <div className="graded">
                  <Image {...img} alt="" sizes="(max-width: 1080px) 100vw, 75vw" />
                  <div className="tint" id="tint"></div>
                </div>
              </>
            )}
            <span className="tag l mono">Log C · Ungraded</span>
            <span className="tag r mono" id="gtag">
              Graded · Amber Night
            </span>
            <div className="handle">
              <b>⇆</b>
            </div>
          </div>
          <div className="panel">
            <div>
              <p className="mono gold">Look</p>
              <h3 id="lookName">Amber Night</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
