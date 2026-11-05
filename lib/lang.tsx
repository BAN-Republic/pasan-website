import type { ReactNode } from "react";

// A run of Sinhala letters, including the spaces and zero-width joiners between words.
const SINHALA_RUN = /([඀-෿](?:[඀-෿‌‍\s]*[඀-෿])?)/;

/**
 * Wraps the Sinhala parts of a mixed title (e.g. "සැම හද බැඳි Suzuki") in <span lang="si">,
 * so screen readers switch voice and the browser picks the Sinhala font. Plain text otherwise.
 */
export function MixedText({ text }: { text: string }): ReactNode {
  const parts = text.split(SINHALA_RUN);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span lang="si" key={i}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}
