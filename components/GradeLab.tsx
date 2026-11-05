"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { sanityImageProps } from "@/lib/image";
import { tick } from "@/lib/sound";
import type { SanityImage } from "@/lib/types";

// The five looks from the design reference (kept in code, not Sanity). Names, LUTs,
// wheels, lift/gamma/gain and white balance are exactly as in the reference. The CSS
// filters and tint strength were lifted for Pasan's darker photo (the reference was
// tuned for a brighter placeholder): measured on his face, Amber Night, Teal & Orange,
// Bleach Bypass and Noir crushed 17–30% of it to near-black. Golden Hour is unchanged.
// Filters run left to right: in the high-contrast looks brightness comes before
// contrast, so shadows are lifted before contrast would push them to black.
const LOOKS = [
  { n: "Amber Night", lut: "PR_AMBER_NIGHT.cube", f: "contrast(1.06) saturate(1.15) sepia(.22) brightness(1.14)", tint: "linear-gradient(160deg,#0e3a44,#2a2a2a 45%,#e0a24a)", o: 0.45, w: [[-6, 8], [4, -3], [10, -8]], k: "3200K", ln: "-0.04 / 0.98 / 1.06" },
  { n: "Teal & Orange", lut: "PR_TEAL_ORANGE.cube", f: "contrast(1.12) saturate(1.35) brightness(1.12)", tint: "linear-gradient(120deg,#004f5a,#ff8a3d)", o: 0.55, w: [[-12, 10], [0, 0], [14, -10]], k: "4300K", ln: "-0.06 / 1.00 / 1.10" },
  { n: "Bleach Bypass", lut: "PR_BLEACH.cube", f: "saturate(.38) brightness(1.2) contrast(1.26)", tint: "linear-gradient(180deg,#56656b,#c9c2b4)", o: 0.3, w: [[-4, -2], [0, 0], [2, 2]], k: "5600K", ln: "-0.09 / 0.92 / 1.14" },
  { n: "Noir", lut: "PR_NOIR.cube", f: "grayscale(1) brightness(1.22) contrast(1.28)", tint: "linear-gradient(180deg,#000,#fff)", o: 0.15, w: [[0, 0], [0, 0], [0, 0]], k: "Mono", ln: "-0.12 / 0.90 / 1.18" },
  { n: "Golden Hour", lut: "PR_GOLDEN.cube", f: "contrast(1.1) saturate(1.3) sepia(.35) brightness(1.02) hue-rotate(-8deg)", tint: "linear-gradient(200deg,#ffcb6b,#7a3b12)", o: 0.5, w: [[2, 10], [8, -6], [14, -12]], k: "2800K", ln: "+0.02 / 1.04 / 1.02" },
] as const;

const WHEELS = ["Lift", "Gamma", "Gain"];
const clamp = (v: number) => Math.min(100, Math.max(0, v));
const LAB_ASPECT = 2.39; // .lab{aspect-ratio:2.39/1}

/**
 * Where the before/after line starts, in % of the frame width: through the
 * image's hotspot (his face), so both halves of the face show the comparison.
 * Accounts for object-fit: cover cropping the sides of images wider than 2.39:1.
 * Without a hotspot, 50% as in the reference.
 */
function defaultSplit(image: SanityImage | null): number {
  const hotspot = image?.hotspot;
  if (!image || !hotspot) return 50;
  const crop = image.crop ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const { width, height } = image.asset.metadata.dimensions;
  const cropWidth = 1 - crop.left - crop.right;
  const x = (hotspot.x - crop.left) / cropWidth; // within the cropped image
  const aspect = (width * cropWidth) / (height * (1 - crop.top - crop.bottom));
  const visible = aspect > LAB_ASPECT ? LAB_ASPECT / aspect : 1; // share of the width in frame
  const offset = (1 - visible) * x; // object-position x = hotspot x
  return Math.round(clamp(((x - offset) / visible) * 100));
}

interface GradeLabProps {
  image: SanityImage | null;
}

export default function GradeLab({ image }: GradeLabProps) {
  const split = defaultSplit(image);
  const [lookIndex, setLookIndex] = useState(0);
  const [x, setX] = useState(split);
  const lab = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const touched = useRef(false);
  const look = LOOKS[lookIndex];
  const img = image ? sanityImageProps(image, 1800) : null;

  // The reference's one-time "sweep" hint when the lab comes into view.
  useEffect(() => {
    const el = lab.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const io = new IntersectionObserver(
      (entries, observer) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const animate = (t: number) => {
          if (touched.current) return; // the visitor took over
          const k = Math.min(1, (t - start) / 1800);
          setX(clamp(split + Math.sin(k * Math.PI * 2) * 22 * (1 - k)));
          if (k < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [split]);

  function moveTo(clientX: number) {
    const r = lab.current!.getBoundingClientRect();
    setX(clamp(((clientX - r.left) / r.width) * 100));
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    touched.current = true;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveTo(event.clientX);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const steps: Record<string, (v: number) => number> = {
      ArrowLeft: (v) => v - 1,
      ArrowDown: (v) => v - 1,
      ArrowRight: (v) => v + 1,
      ArrowUp: (v) => v + 1,
      PageDown: (v) => v - 10,
      PageUp: (v) => v + 10,
      Home: () => 0,
      End: () => 100,
    };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    touched.current = true;
    setX((v) => clamp(Math.round(step(v))));
  }

  const value = Math.round(x);

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
          <div
            className="lab"
            id="lab"
            ref={lab}
            role="slider"
            tabIndex={0}
            aria-label="Compare ungraded and graded frame"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            aria-valuetext={`${value}% ungraded, ${100 - value}% graded with ${look.n}`}
            aria-orientation="horizontal"
            style={{ "--x": `${x}%`, cursor: "ew-resize" } as CSSProperties}
            onPointerDown={onPointerDown}
            onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
            onPointerUp={() => (dragging.current = false)}
            onPointerCancel={() => (dragging.current = false)}
            onKeyDown={onKeyDown}
          >
            {img && (
              <Image {...img} alt={img.alt} className="base" draggable={false} sizes="(max-width: 1080px) 100vw, 1100px" />
            )}
            <div className="graded">
              {img && (
                <Image
                  {...img}
                  alt=""
                  id="gimg"
                  draggable={false}
                  style={{ ...img.style, filter: look.f }}
                  sizes="(max-width: 1080px) 100vw, 1100px"
                />
              )}
              <div className="tint" id="tint" style={{ background: look.tint, opacity: look.o }}></div>
            </div>
            <span className="tag l mono">Log C · Ungraded</span>
            <span className="tag r mono" id="gtag">
              Graded · {look.n}
            </span>
            <div className="handle">
              <b aria-hidden="true">⇆</b>
            </div>
          </div>
          <div className="panel">
            <div>
              <p className="mono gold">Look</p>
              <h3 id="lookName">{look.n}</h3>
            </div>
            <div className="presets" id="presets" role="group" aria-label="Looks">
              {LOOKS.map((l, i) => (
                <button
                  key={l.n}
                  type="button"
                  data-l={i}
                  className={i === lookIndex ? "on" : undefined}
                  aria-pressed={i === lookIndex}
                  onClick={() => {
                    setLookIndex(i);
                    tick();
                  }}
                >
                  {l.n}
                  <span>{l.lut.replace(".cube", "")}</span>
                </button>
              ))}
            </div>
            <div className="wheels" aria-hidden="true">
              {WHEELS.map((name, j) => (
                <div className="wheel" key={name}>
                  <i>
                    <em id={`w${j}`} style={{ "--dx": `${look.w[j][0]}px`, "--dy": `${look.w[j][1]}px` } as CSSProperties}></em>
                  </i>
                  <small>{name}</small>
                </div>
              ))}
            </div>
            <div className="readout" id="readout">
              LUT <b>{look.lut}</b>
              <br />
              Lift / Gamma / Gain <b>{look.ln}</b>
              <br />
              White balance <b>{look.k}</b>
              <br />
              Input <b>LogC3 · AWG3</b> → Output <b>Rec.709 2.4</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
