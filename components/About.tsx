import Image from "next/image";
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponentProps,
  type PortableTextComponents,
} from "next-sanity";
import Stats from "@/components/Stats";
import { sanityImageProps } from "@/lib/image";
import type { SiteSettings } from "@/lib/types";

// Award details are one line: render the block inline, keeping italics (<em>).
const inline: PortableTextComponents = {
  block: ({ children }: PortableTextComponentProps<PortableTextBlock>) => <>{children}</>,
};

interface AboutProps {
  settings: SiteSettings | null;
}

export default function About({ settings }: AboutProps) {
  const portrait = settings?.portraitImage
    ? sanityImageProps(settings.portraitImage, 1000, `Portrait of ${settings.name}`)
    : null;
  // The tagline is the heading; the reference sets it without a full stop.
  const heading = settings?.tagline?.replace(/\.\s*$/, "");
  const bio = settings?.bioParagraphs ?? [];
  const craft = settings?.craftTags ?? [];
  const awards = settings?.awards ?? [];
  const stats = settings?.stats ?? [];

  return (
    <section className="sec" id="about">
      <div className="wrap about">
        <div className="portrait">
          {portrait && (
            <Image {...portrait} alt={portrait.alt} sizes="(max-width: 760px) min(420px, 100vw), 40vw" />
          )}
          {settings?.location && <span className="cap mono">{settings.location}</span>}
        </div>
        <div className="about-copy">
          <p className="k mono gold" style={{ display: "flex", gap: 14, alignItems: "center" }}>
            Scene 04 · About me
          </p>
          {heading && <h2>{heading}</h2>}
          {bio.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          {craft.length > 0 && (
            <div className="craft">
              {craft.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}
          {awards.length > 0 && (
            <div className="awards">
              {awards.map((award, i) => (
                <div className="award" key={i}>
                  <b>{award.title}</b>
                  {award.detail && (
                    <span>
                      <PortableText value={award.detail} components={inline} />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {stats.length > 0 && <Stats stats={stats} />}
        </div>
      </div>
    </section>
  );
}
