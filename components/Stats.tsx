"use client";

import { useEffect, useRef } from "react";
import type { Stat } from "@/lib/types";

interface StatsProps {
  stats: Stat[];
}

/**
 * Counts up once when half visible (1.6s ease-out, as in the reference). The
 * server renders the final numbers, so they're correct without JavaScript and
 * with reduced motion; screen readers get the final value from .sr-only.
 */
export default function Stats({ stats }: StatsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const frames: number[] = [];
    const io = new IntersectionObserver(
      (entries, observer) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        el.querySelectorAll<HTMLElement>("b[data-n]").forEach((b, i) => {
          const n = Number(b.dataset.n);
          const suffix = b.dataset.s ?? "";
          const start = performance.now();
          const animate = (t: number) => {
            const k = Math.min(1, (t - start) / 1600);
            b.textContent = `${Math.round(n * (1 - Math.pow(1 - k, 3)))}${suffix}`;
            if (k < 1) frames[i] = requestAnimationFrame(animate);
          };
          frames[i] = requestAnimationFrame(animate);
        });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      frames.forEach(cancelAnimationFrame);
    };
  }, []);

  return (
    <div className="stats" id="stats" ref={ref}>
      {stats.map((stat, i) => (
        <div className="stat" key={i}>
          <b data-n={stat.value} data-s={stat.suffix ?? ""} aria-hidden="true">
            {`${stat.value}${stat.suffix ?? ""}`}
          </b>
          <span className="sr-only">{`${stat.value}${stat.suffix ?? ""}`} </span>
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
