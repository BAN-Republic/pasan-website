"use client";

import { useEffect, useRef } from "react";
import { timecode } from "@/lib/timecode";

// One clock for every running timecode, started when the page loads.
const start = typeof performance === "undefined" ? 0 : performance.now();

interface TimecodeProps {
  id?: string;
}

/** Running REC timecode. Written straight to the DOM each frame, no re-renders. */
export default function Timecode({ id }: TimecodeProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    const loop = () => {
      if (ref.current) ref.current.textContent = timecode(performance.now() - start);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <span id={id} ref={ref}>
      00:00:00:00
    </span>
  );
}
