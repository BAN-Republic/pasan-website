"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { closePlayer, getPlayer, stepFilm, subscribePlayer, syncFromHash } from "@/lib/player";
import { tick } from "@/lib/sound";
import { categoryLabel, type Film } from "@/lib/types";
import { youTubeEmbedUrl, youTubeWatchUrl } from "@/lib/youtube";

interface VideoModalProps {
  /** All published films, in display order (clip numbers follow this order). */
  films: Film[];
  showreelId: string | null;
}

function Player({ id, title }: { id: string; title: string }) {
  return (
    <iframe
      key={id}
      src={youTubeEmbedUrl(id)}
      title={title}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}

/**
 * The one modal for films and the showreel (two layouts from the reference).
 * It renders nothing while closed, so the YouTube iframe only exists while
 * open and is removed (stopping playback) on close.
 */
export default function VideoModal({ films, showreelId }: VideoModalProps) {
  const player = useSyncExternalStore(subscribePlayer, getPlayer, () => null);
  const ref = useRef<HTMLDivElement>(null);
  const slugs = useMemo(() => films.map((film) => film.slug), [films]);
  const isOpen = player !== null;
  const isFilm = player?.kind === "film";

  // Open from a shared #film-… / #reel link, and follow back/forward.
  useEffect(() => {
    const sync = () => syncFromHash(slugs, Boolean(showreelId));
    sync();
    addEventListener("popstate", sync);
    return () => removeEventListener("popstate", sync);
  }, [slugs, showreelId]);

  // While open: lock scroll, make the rest of the page inert (focus can't leave), focus Close.
  useEffect(() => {
    const modal = ref.current;
    if (!isOpen || !modal) return;
    document.body.classList.add("lock");
    const siblings = [...(modal.parentElement?.children ?? [])].filter(
      (el) => el !== modal && !el.hasAttribute("inert"),
    );
    siblings.forEach((el) => el.setAttribute("inert", ""));
    modal.querySelector<HTMLElement>("[data-close]")?.focus();
    return () => {
      document.body.classList.remove("lock");
      siblings.forEach((el) => el.removeAttribute("inert"));
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePlayer();
      } else if (isFilm && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
        event.preventDefault();
        stepFilm(event.key === "ArrowRight" ? 1 : -1);
        tick();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [isOpen, isFilm]);

  if (player?.kind === "reel" && showreelId) {
    return (
      <div className="modal" id="rmodal" role="dialog" aria-modal="true" aria-label="Director's showreel" ref={ref}>
        <div className="mtop wrap">
          <span className="mono gold">Director&apos;s showreel</span>
          <button className="mclose mono" type="button" data-close="" onClick={() => closePlayer()}>
            Close ✕
          </button>
        </div>
        <div className="reel-stage wrap">
          <div className="screen yt" id="screen">
            <Player id={showreelId} title="Director's showreel" />
          </div>
        </div>
        <div className="wrap mfoot">
          <a className="mclose mono" href={youTubeWatchUrl(showreelId)} target="_blank" rel="noopener">
            Watch on YouTube ↗
          </a>
          <a
            href="#contact"
            className="btn2"
            id="rcontact"
            onClick={(event) => {
              event.preventDefault();
              closePlayer(() => document.getElementById("contact")?.scrollIntoView());
            }}
          >
            Book a shoot
          </a>
        </div>
      </div>
    );
  }

  if (player?.kind !== "film") return null;
  const film = films.find((f) => f.slug === player.slug);
  if (!film) return null;

  const label = categoryLabel(film.category);
  const clip = `A001_C${String(films.indexOf(film) + 1).padStart(3, "0")}`;
  const position = player.queue.indexOf(film.slug);
  const specs: [string, string][] = [
    ["Client", film.client],
    ...(film.product ? [["Product", film.product] as [string, string]] : []),
    ["Category", label],
    ["Platform", "YouTube"],
  ];

  return (
    <div className="modal" id="pmodal" role="dialog" aria-modal="true" aria-labelledby="pdTitle" ref={ref}>
      <div className="mtop wrap">
        <span className="mono gold" id="pdClip">
          {clip} · {label}
        </span>
        <button className="mclose mono" type="button" data-close="" onClick={() => closePlayer()}>
          Close ✕
        </button>
      </div>
      <div className="mbody">
        <div className="wrap">
          <div className="pd-shot ytbox" id="pdShot">
            <Player id={film.youtubeId} title={`${film.title} (YouTube video)`} />
          </div>
          <div className="pd-info">
            <div>
              <p className="mono gold" id="pdCat">
                {label}
              </p>
              <h2 id="pdTitle">{film.title}</h2>
              <p id="pdLog">
                {film.client}
                {film.product && film.product !== film.client ? ` · ${film.product}` : ""}
              </p>
              {film.description && <p>{film.description}</p>}
              <p style={{ marginTop: 18 }}>
                <a className="ytlink" id="pdYT" href={youTubeWatchUrl(film.youtubeId)} target="_blank" rel="noopener">
                  Watch on YouTube ↗
                </a>
              </p>
            </div>
            <div className="specs" id="pdSpecs">
              {specs.map(([key, value]) => (
                <div key={key}>
                  <small>{key}</small>
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="wrap mfoot">
        <button
          className="mclose mono"
          type="button"
          id="pdPrev"
          onClick={() => {
            stepFilm(-1);
            tick();
          }}
        >
          ⟵ Previous
        </button>
        <span className="mono" id="pdCount" style={{ color: "var(--mute)" }}>
          {position + 1} / {player.queue.length}
        </span>
        <button
          className="mclose mono"
          type="button"
          id="pdNext"
          onClick={() => {
            stepFilm(1);
            tick();
          }}
        >
          Next project ⟶
        </button>
      </div>
    </div>
  );
}
