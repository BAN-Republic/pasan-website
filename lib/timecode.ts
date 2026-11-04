/** SMPTE-style HH:MM:SS:FF timecode, as in the design reference (24 fps). */
export function timecode(ms: number, fps = 24): string {
  const f = Math.floor((ms / 1000) * fps);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(f / (fps * 3600)))}:${p(Math.floor(f / (fps * 60)) % 60)}:${p(Math.floor(f / fps) % 60)}:${p(f % fps)}`;
}
