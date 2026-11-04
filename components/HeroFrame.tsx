"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { onIntroDone } from "@/lib/intro";
import { tick } from "@/lib/sound";

/** Frame aspect ratio; 0 is open gate, null until the intro has finished. */
type Aspect = number | null;

const AspectContext = createContext<{ aspect: Aspect; choose: (a: number) => void }>({
  aspect: null,
  choose: () => {},
});

const RATIOS = [
  { value: 2.39, label: "2.39" },
  { value: 1.85, label: "1.85" },
  { value: 1.78, label: "16:9" },
  { value: 0, label: "Open" },
];

/**
 * Client shell for the server-rendered hero: letterbox bars for the chosen
 * aspect ratio, and mouse parallax + lens flare on fine pointers.
 */
export default function HeroFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [aspect, setAspect] = useState<Aspect>(null);

  // After the intro, frame wide screens in 2.39 (as in the reference).
  useEffect(() => onIntroDone(() => setAspect(innerWidth > 900 ? 2.39 : 0)), []);

  // Letterbox bar height, recomputed on resize.
  useEffect(() => {
    const hero = ref.current;
    if (!hero || aspect === null) return;
    const apply = () => {
      const bar = aspect ? Math.max(0, (hero.clientHeight - hero.clientWidth / aspect) / 2) : 0;
      hero.style.setProperty("--bar", `${bar}px`);
    };
    apply();
    addEventListener("resize", apply);
    return () => removeEventListener("resize", apply);
  }, [aspect]);

  // Parallax and flare: mouse only, and not with reduced motion.
  useEffect(() => {
    const hero = ref.current;
    if (!hero || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const r = hero.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - 0.5;
      const y = (event.clientY - r.top) / r.height - 0.5;
      const img = hero.querySelector<HTMLElement>(".hero-media img");
      img?.style.setProperty("--px", `${-x * 22}px`);
      img?.style.setProperty("--py", `${-y * 14}px`);
      const flare = hero.querySelector<HTMLElement>(".flare");
      if (flare) {
        flare.style.left = `${event.clientX - r.left}px`;
        flare.style.top = `${event.clientY - r.top}px`;
      }
    };
    hero.addEventListener("pointermove", onMove);
    return () => hero.removeEventListener("pointermove", onMove);
  }, []);

  const choose = (a: number) => {
    setAspect(a);
    tick();
  };

  return (
    <AspectContext.Provider value={{ aspect, choose }}>
      <section className="hero" id="home" ref={ref}>
        {children}
      </section>
    </AspectContext.Provider>
  );
}

export function AspectButtons() {
  const { aspect, choose } = useContext(AspectContext);
  return (
    <div className="ar mono" role="group" aria-label="Frame aspect ratio">
      <span>Frame</span>
      {RATIOS.map((r) => (
        <button
          key={r.label}
          type="button"
          data-ar={r.value}
          className={aspect === r.value ? "on" : undefined}
          aria-pressed={aspect === r.value}
          onClick={() => choose(r.value)}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

/** Lens readout in the HUD; follows the chosen aspect ratio. */
export function HudLens() {
  const { aspect } = useContext(AspectContext);
  const lens =
    aspect === null
      ? "3200K"
      : aspect === 0
        ? "OPEN GATE"
        : aspect === 2.39
          ? "ANAMORPHIC 2×"
          : "SPHERICAL";
  return (
    <span className="br" id="hudlens">
      ISO 800 · 180° · T2.1 · {lens}
    </span>
  );
}
