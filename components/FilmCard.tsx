"use client";

import Image from "next/image";
import { useState } from "react";
import { filmThumbnailProps, youTubeThumbnailProps } from "@/lib/image";
import { categoryLabel, type Film } from "@/lib/types";

interface FilmCardProps {
  film: Film;
  /** Position in the full display order; gives the clip number. */
  index: number;
  hidden: boolean;
  onOpen: () => void;
}

export default function FilmCard({ film, index, hidden, onOpen }: FilmCardProps) {
  // getFilms already picks a YouTube thumbnail that exists; this is a backstop
  // in case it disappears later (YouTube answers 404 + a grey placeholder).
  const [fallback, setFallback] = useState(false);
  const thumb = fallback ? youTubeThumbnailProps(film.youtubeId, "hqdefault") : filmThumbnailProps(film);
  const label = categoryLabel(film.category);

  return (
    <button
      className={hidden ? "card hide" : "card"}
      type="button"
      data-id={film._id}
      data-cat={film.category}
      data-cur="Play"
      aria-label={`Play ${film.title}`}
      onClick={onOpen}
    >
      <Image
        {...thumb}
        alt={thumb.alt}
        sizes="(max-width: 760px) 100vw, 66vw"
        onError={() => {
          if (!film.thumbnail) setFallback(true);
        }}
      />
      <span className="brk"></span>
      <span className="fr mono">
        <span>A001_C{String(index + 1).padStart(3, "0")}</span>
        <span>{label}</span>
      </span>
      <span className="play" aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path d="M3 1.5v13l11-6.5z" />
        </svg>
      </span>
      <span className="meta">
        <span className="ct">{film.title}</span>
        <span className="mono">
          {label} · {film.client}
        </span>
      </span>
    </button>
  );
}
