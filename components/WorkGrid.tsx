"use client";

import { useRef, useState } from "react";
import FilmCard from "@/components/FilmCard";
import { openFilm } from "@/lib/player";
import { tick } from "@/lib/sound";
import { FILM_CATEGORIES, type Film, type FilmCategory } from "@/lib/types";

const LIMIT = 12;

type Filter = "all" | FilmCategory;

interface WorkGridProps {
  /** Display order from getFilms(): the first featured film comes first. */
  films: Film[];
}

export default function WorkGrid({ films }: WorkGridProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [showAll, setShowAll] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const chips = [
    { value: "all" as const, chip: "All", count: films.length },
    ...FILM_CATEGORIES.map((c) => ({
      value: c.value,
      chip: c.chip,
      count: films.filter((film) => film.category === c.value).length,
    })).filter((c) => c.count > 0),
  ];

  const matching = films.filter((film) => filter === "all" || film.category === filter);
  const shownCount = showAll ? matching.length : Math.min(matching.length, LIMIT);
  // Every card stays in the HTML (as in the reference); filtered-out ones get .hide.
  const shown = new Set(matching.slice(0, shownCount).map((film) => film._id));
  const queue = matching.map((film) => film.slug);

  const gridClass = ["work-grid", filter !== "all" && "f", shownCount === 1 && "one"]
    .filter(Boolean)
    .join(" ");

  function choose(value: Filter) {
    setFilter(value);
    setShowAll(false);
    tick();
  }

  function revealAll() {
    setShowAll(true);
    tick();
    // The button disappears; move focus to the first newly shown film.
    const firstNew = matching[LIMIT];
    requestAnimationFrame(() => {
      if (firstNew) gridRef.current?.querySelector<HTMLElement>(`.card[data-id="${firstNew._id}"]`)?.focus();
    });
  }

  return (
    <section className="sec" id="work">
      <div className="wrap">
        <div className="sh">
          <div>
            <p className="k mono">Scene 02 · Selected work</p>
            <h2>
              Films that
              <br />
              make people feel
            </h2>
          </div>
          {films.length > 0 && (
            <div className="chips" role="group" aria-label="Filter projects" id="chips">
              {chips.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  data-f={c.value}
                  className={c.value === filter ? "on" : undefined}
                  aria-pressed={c.value === filter}
                  onClick={() => choose(c.value)}
                >
                  {c.chip}
                  <span className="n">{c.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {films.length === 0 ? (
          <p className="mono" style={{ color: "var(--mute)" }}>
            New films are on the way.
          </p>
        ) : (
          <>
            <p className="sr-only" aria-live="polite">
              Showing {shownCount} of {matching.length} {matching.length === 1 ? "film" : "films"}
              {filter !== "all" ? ` in ${chips.find((c) => c.value === filter)?.chip}` : ""}.
            </p>
            <div className={gridClass} id="grid" ref={gridRef}>
              {films.map((film, i) => (
                <FilmCard
                  key={film._id}
                  film={film}
                  index={i}
                  hidden={!shown.has(film._id)}
                  onOpen={() => {
                    openFilm(film.slug, queue);
                    tick();
                  }}
                />
              ))}
            </div>
            <div className="workmore">
              <button
                className="btn2"
                id="more"
                type="button"
                hidden={showAll || matching.length <= LIMIT}
                onClick={revealAll}
              >
                Show all {matching.length} films
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
