"use client";

import { useEffect, useRef } from "react";
import { timecode } from "@/lib/timecode";

// The page reads as a 2'30" reel: scroll position maps onto this runtime.
const RUNTIME = 150000;
const label = (progress: number) => `TC ${timecode(progress * RUNTIME)} / ${timecode(RUNTIME)}`;

export default function ScrollTimecode() {
  const fill = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      fill.current?.style.setProperty("--p", String(p));
      if (text.current) text.current.textContent = label(p);
    }
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="tcbar" aria-hidden="true">
      <div className="fill" id="tcfill" ref={fill}></div>
      <span className="lbl mono" id="tclbl" ref={text}>
        {label(0)}
      </span>
    </div>
  );
}
