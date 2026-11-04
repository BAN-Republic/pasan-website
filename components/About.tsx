import Image from "next/image";
import { sanityImageProps } from "@/lib/image";
import type { SiteSettings } from "@/lib/types";

interface AboutProps {
  settings: SiteSettings | null;
}

// TODO(Step 7): count-up animation on the stats.
export default function About({ settings }: AboutProps) {
  const portrait = settings?.portraitImage
    ? sanityImageProps(settings.portraitImage, 1000, `Portrait of ${settings.name}`)
    : null;
  const bio = settings?.bioParagraphs ?? [];
  const awards = settings?.awards ?? [];
  const stats = settings?.stats ?? [];
  const craft = settings?.craftTags ?? [];

  return (
    <section className="sec" id="about">
      <div className="wrap about">
        <div className="portrait">
          {portrait && <Image {...portrait} alt={portrait.alt} sizes="(max-width: 760px) 420px, 40vw" />}
          {settings?.location && <span className="cap mono">{settings.location}</span>}
        </div>
        <div className="about-copy">
          <p className="k mono gold" style={{ display: "flex", gap: 14, alignItems: "center" }}>
            Scene 04 · About me
          </p>
          <h2>
            Turning ideas into
            <br />
            powerful visual stories
          </h2>
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
                  {award.detail && <span>{award.detail}</span>}
                </div>
              ))}
            </div>
          )}
          {stats.length > 0 && (
            <div className="stats" id="stats">
              {stats.map((stat, i) => (
                <div className="stat" key={i}>
                  <b data-n={stat.value} data-s={stat.suffix ?? ""}>
                    {stat.value}
                    {stat.suffix}
                  </b>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
