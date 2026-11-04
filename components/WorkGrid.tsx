"use client";

import FilmCard from "@/components/FilmCard";
import { FILM_CATEGORIES, type Film } from "@/lib/types";

const LIMIT = 12;

interface WorkGridProps {
  films: Film[];
}

// TODO(Step 6): chip filtering, "Show all", VideoModal with prev/next in the current filter.
export default function WorkGrid({ films }: WorkGridProps) {
  // The first featured film takes the large first slot; the rest keep Studio order.
  const featured = films.findIndex((film) => film.featured);
  const ordered =
    featured > 0 ? [films[featured], ...films.filter((_, i) => i !== featured)] : films;

  const chips = [
    { value: "all", chip: "All", count: films.length },
    ...FILM_CATEGORIES.map((c) => ({
      value: c.value,
      chip: c.chip,
      count: films.filter((film) => film.category === c.value).length,
    })).filter((c) => c.count > 0),
  ];

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
                <button key={c.value} type="button" data-f={c.value} className={c.value === "all" ? "on" : undefined}>
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
            <div className="work-grid" id="grid">
              {ordered.slice(0, LIMIT).map((film, i) => (
                <FilmCard key={film._id} film={film} index={i} />
              ))}
            </div>
            {ordered.length > LIMIT && (
              <div className="workmore">
                <button className="btn2" id="more" type="button">
                  Show all {ordered.length} films
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
