"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { INTRO_DONE_EVENT, INTRO_SEEN_KEY, introState } from "@/lib/intro";
import { beep, clap, setSound, whirOff, whirOn } from "@/lib/sound";

// Opening sequence, ported from the design reference with the same timings:
// Roll sound → Speed → Roll camera → 3-2-1 leader → slate → snap → Action! → shutters.
// Whether it plays is decided before paint by <IntroScript>; this component
// renders the same markup on the server and the client to avoid hydration mismatches.

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type RollMode = "sound" | "silent" | "auto";

export default function Intro() {
  const [removed, setRemoved] = useState(false);
  const [run, setRun] = useState(false);
  const [leaderOn, setLeaderOn] = useState(false);
  const [slateOn, setSlateOn] = useState(false);
  const [snap, setSnap] = useState(false);
  const [flash, setFlash] = useState(false);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(3);
  const [beat, setBeat] = useState(0);
  const [date, setDate] = useState("—");

  const done = useRef(false);
  const running = useRef(false);
  const autoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const callRef = useRef<HTMLDivElement>(null);

  // As in the reference: reset the class, force a reflow, re-add it so the
  // entrance animation restarts. React never renders this element's class or
  // text, so it stays one persistent live region for screen readers.
  const say = useCallback((text: string, cls = "") => {
    const el = callRef.current;
    if (!el) return;
    el.className = "call";
    el.textContent = text;
    void el.offsetWidth;
    el.className = `call in ${cls}`.trim();
  }, []);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    clearTimeout(autoTimer.current);
    whirOff();
    setOpen(true);
    document.body.classList.remove("lock");
    document.body.classList.add("action");
    document.documentElement.dataset.intro = "done";
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // storage unavailable: the intro may play again next visit
    }
    window.dispatchEvent(new Event(INTRO_DONE_EVENT));
    setTimeout(() => setRemoved(true), 1200);
  }, []);

  const roll = useCallback(
    async (mode: RollMode) => {
      clearTimeout(autoTimer.current);
      if (running.current || done.current) return;
      running.current = true;
      // A click is the visitor's choice and is remembered; the 9s auto-roll is silent
      // and leaves their saved preference alone.
      if (mode !== "auto") setSound(mode === "sound");
      const sfx = (play: () => void) => {
        if (mode !== "auto") play();
      };
      setRun(true);
      sfx(whirOn);

      say("Roll sound");
      sfx(() => beep(660, 0.07, 0.06));
      await sleep(800);
      if (done.current) return;
      say("Speed");
      await sleep(700);
      if (done.current) return;
      say("Roll camera");
      await sleep(750);
      if (done.current) return;
      say("Rolling", "rec");
      setLeaderOn(true);
      for (const n of [3, 2, 1]) {
        setCount(n);
        setBeat((b) => b + 1); // restarts the sweep
        sfx(() => beep(1000, 0.09, 0.15));
        await sleep(800);
        if (done.current) return;
      }
      setLeaderOn(false);
      setSlateOn(true);
      say("Mark it");
      await sleep(1000);
      if (done.current) return;
      sfx(whirOff);
      setSnap(true);
      sfx(clap);
      setFlash(true);
      await sleep(420);
      if (done.current) return;
      say("Action!", "action");
      await sleep(950);
      finish();
    },
    [finish, say],
  );

  useEffect(() => {
    if (introState() !== "play") {
      // Skipped before paint (seen this session, or reduced motion).
      done.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- unmount the hidden markup after hydration
      setRemoved(true);
      return;
    }
    const now = new Date();
    setDate(
      `${String(now.getDate()).padStart(2, "0")}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getFullYear()).slice(2)}`,
    );
    autoTimer.current = setTimeout(() => void roll("auto"), 9000);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !done.current) finish();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(autoTimer.current);
      window.removeEventListener("keydown", onKey);
    };
  }, [finish, roll]);

  if (removed) return null;

  const classes = [
    run && "run",
    leaderOn && "leader-on",
    slateOn && "slate-on",
    flash && "flash",
    open && "open",
  ].filter(Boolean);

  return (
    <div id="intro" className={classes.join(" ") || undefined} role="dialog" aria-label="Opening sequence">
      <div className="half t"></div>
      <div className="half b"></div>
      <div className="stage">
        <div className="gate">
          <p className="mono pre">Pasan Rasantha Chandrasekera presents</p>
          <h2>
            Visual <span>Storyteller</span>
          </h2>
          <button className="rollbtn" id="rollSound" type="button" data-cur="Roll" onClick={() => void roll("sound")}>
            <span className="dot"></span>Roll camera
          </button>
          <div className="alt mono">
            <button type="button" id="rollSilent" onClick={() => void roll("silent")}>
              Roll without sound
            </button>
            <button type="button" id="skipGate" onClick={finish}>
              Skip intro
            </button>
          </div>
          <p className="mono hint">Best with sound on</p>
        </div>
        <div className="call" id="call" aria-live="polite" ref={callRef}></div>
        <div className="leader" aria-hidden="true">
          <div className="sw" id="sw" key={beat}></div>
          <div className="r1"></div>
          <div className="r2"></div>
          <div className="x"></div>
          <div className="y"></div>
          <b id="lnum">{count}</b>
        </div>
        <div className={snap ? "clap snap" : "clap"} id="clap" aria-hidden="true">
          <div className="stick top"></div>
          <div className="bodyx">
            <div
              className="stick bottom"
              style={{
                border: 0,
                borderRadius: 0,
                height: 40,
                background: "repeating-linear-gradient(65deg,#f2f2f2 0 34px,#111 34px 68px)",
              }}
            ></div>
            <div className="row" style={{ gridTemplateColumns: "1fr" }}>
              <div>
                <small>Production</small>
                <span className="v">Pasan · Visual Storyteller</span>
              </div>
            </div>
            <div className="row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              <div>
                <small>Roll</small>
                <span className="v big">A001</span>
              </div>
              <div>
                <small>Scene</small>
                <span className="v big">01</span>
              </div>
              <div>
                <small>Take</small>
                <span className="v big">01</span>
              </div>
            </div>
            <div className="row" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
              <div>
                <small>Director</small>
                <span className="v">P. R. Chandrasekera</span>
              </div>
              <div>
                <small>Camera</small>
                <span className="v">A-Cam</span>
              </div>
            </div>
            <div className="row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              <div>
                <small>Date</small>
                <span className="v" id="sdate">
                  {date}
                </span>
              </div>
              <div>
                <small>FPS</small>
                <span className="v">23.976</span>
              </div>
              <div>
                <small>Int/Ext</small>
                <span className="v">Night</span>
              </div>
            </div>
          </div>
        </div>
        <button className="skip mono" id="skipRun" type="button" onClick={finish}>
          Skip ⟶
        </button>
      </div>
    </div>
  );
}
