// Web Audio sound design, synthesised (no files). Ported from the design
// reference's `S` object; timings, frequencies and gains are unchanged.
// Off by default. The visitor's choice is remembered in localStorage.

import { toast } from "@/lib/toast";

const STORAGE_KEY = "sound";

type Whir = {
  s: AudioBufferSourceNode;
  l: OscillatorNode;
  h: OscillatorNode;
  g: GainNode;
  hg: GainNode;
};

let on = false;
let loaded = false;
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let whir: Whir | null = null;
const listeners = new Set<() => void>();

function init(): boolean {
  if (ctx) return true;
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return false;
    ctx = new Ctor();
    const n = ctx.sampleRate * 2;
    noise = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return true;
  } catch {
    return false;
  }
}

/** Ready to play: on, and a context exists (created lazily on a user gesture). */
function ready(): AudioContext | null {
  if (!on) return null;
  if (!ctx && !init()) return null;
  if (ctx!.state === "suspended") void ctx!.resume();
  return ctx;
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    on = localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    on = false;
  }
}

// ---------- store (for useSyncExternalStore) ----------

export function isSoundOn(): boolean {
  load();
  return on;
}

export function subscribeSound(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Turn sound on/off. Call from a user gesture so the AudioContext may start. */
export function setSound(next: boolean, { remember = true } = {}) {
  load();
  if (next && !init()) {
    toast("Sound is not available in this browser");
    next = false;
  }
  on = next;
  if (on && ctx?.state === "suspended") void ctx.resume();
  if (!on) whirOff();
  if (remember) {
    try {
      localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
    } catch {
      // storage unavailable (private mode): the choice lasts for this page only
    }
  }
  listeners.forEach((listener) => listener());
}

// ---------- sounds ----------

export function beep(f = 1000, dur = 0.1, v = 0.15) {
  const c = ready();
  if (!c) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.frequency.value = f;
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function burst(c: AudioContext, dur: number, v: number, hp: number, t0 = 0) {
  const t = c.currentTime + t0;
  const s = c.createBufferSource();
  const f = c.createBiquadFilter();
  const g = c.createGain();
  s.buffer = noise;
  f.type = "highpass";
  f.frequency.value = hp;
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(c.destination);
  s.start(t, Math.random());
  s.stop(t + dur + 0.05);
}

/** Clapperboard snap: two noise bursts and a falling thump. */
export function clap() {
  const c = ready();
  if (!c) return;
  const t = c.currentTime;
  burst(c, 0.16, 0.9, 900);
  burst(c, 0.06, 0.5, 2500, 0.012);
  const o = c.createOscillator();
  const g = c.createGain();
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
  g.gain.setValueAtTime(0.7, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + 0.25);
}

/** UI click. */
export function tick() {
  const c = ready();
  if (!c) return;
  burst(c, 0.025, 0.18, 3500);
}

/** Camera motor: band-passed noise with flutter, plus a low hum. */
export function whirOn() {
  const c = ready();
  if (!c || whir) return;
  const s = c.createBufferSource();
  const bp = c.createBiquadFilter();
  const g = c.createGain();
  const l = c.createOscillator();
  const lg = c.createGain();
  const h = c.createOscillator();
  const hg = c.createGain();
  s.buffer = noise;
  s.loop = true;
  bp.type = "bandpass";
  bp.frequency.value = 1100;
  bp.Q.value = 0.7;
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(0.05, c.currentTime + 0.4);
  l.frequency.value = 24;
  lg.gain.value = 0.03;
  l.connect(lg).connect(g.gain);
  h.type = "triangle";
  h.frequency.value = 72;
  hg.gain.value = 0.025;
  s.connect(bp).connect(g).connect(c.destination);
  h.connect(hg).connect(c.destination);
  s.start();
  l.start();
  h.start();
  whir = { s, l, h, g, hg };
}

export function whirOff() {
  if (!whir || !ctx) return;
  const w = whir;
  const t = ctx.currentTime;
  w.g.gain.cancelScheduledValues(t);
  w.g.gain.setTargetAtTime(0, t, 0.08);
  w.hg.gain.setTargetAtTime(0, t, 0.08);
  setTimeout(() => {
    try {
      w.s.stop();
      w.l.stop();
      w.h.stop();
    } catch {
      // already stopped
    }
  }, 400);
  whir = null;
}
