import Image from "next/image";
import { filmThumbnailProps } from "@/lib/image";
import { FILM_CATEGORIES, type Film } from "@/lib/types";

export function categoryLabel(category: Film["category"]): string {
  return FILM_CATEGORIES.find((c) => c.value === category)?.title ?? category;
}

interface FilmCardProps {
  film: Film;
  index: number;
}

// TODO(Step 6): open VideoModal on click.
export default function FilmCard({ film, index }: FilmCardProps) {
  const thumb = filmThumbnailProps(film);
  const label = categoryLabel(film.category);
  return (
    <button
      className="card"
      type="button"
      data-cat={film.category}
      data-cur="Play"
      aria-label={`Play ${film.title}`}
    >
      <Image {...thumb} alt={thumb.alt} sizes="(max-width: 760px) 100vw, 66vw" />
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
