import Image from "next/image";
import { Fragment } from "react";
import HeroFrame, { AspectButtons, HudLens } from "@/components/HeroFrame";
import ShowreelButton from "@/components/ShowreelButton";
import SocialIcon, { SOCIAL_LABELS, socialLinks } from "@/components/SocialIcon";
import Timecode from "@/components/Timecode";
import { sanityImageProps } from "@/lib/image";
import type { SiteSettings } from "@/lib/types";

interface HeroProps {
  settings: SiteSettings | null;
}

// Server-rendered copy; HeroFrame adds the letterbox, parallax and flare.
// The entrance animation runs from CSS when <body> gets the "action" class.
export default function Hero({ settings }: HeroProps) {
  const firstName = settings?.name?.split(" ")[0];
  const roles = settings?.roles ?? [];
  const socials = socialLinks(settings?.socials ?? null);
  const hero = settings?.heroImage
    ? sanityImageProps(settings.heroImage, 2000, settings.name)
    : null;

  return (
    <HeroFrame>
      <div className="hero-media">
        {hero && <Image {...hero} alt={hero.alt} priority sizes="(max-width: 760px) 100vw, 64vw" />}
      </div>
      <div className="flare" id="flare"></div>
      <div className="lb t"></div>
      <div className="lb b"></div>
      <div className="hud mono" aria-hidden="true">
        <span className="c c1"></span>
        <span className="c c2"></span>
        <span className="c c3"></span>
        <span className="c c4"></span>
        <span className="tl">
          <i></i>REC <Timecode id="hudtc" />
        </span>
        <span className="tr">A-CAM · 4K DCI · 23.976 FPS</span>
        <HudLens />
      </div>
      <div className="hero-copy wrap">
        {firstName && (
          <p className="im">
            <span className="eyebrow">I&apos;M</span>
            <span className="sig">{firstName}</span>
          </p>
        )}
        <h1>
          <span className="l1">
            <em>Visual</em>
          </span>
          <span className="l2">
            <em>Storyteller</em>
          </span>
        </h1>
        {roles.length > 0 && (
          <p className="roles">
            {roles.map((role, i) => (
              <Fragment key={role}>
                {/* <wbr> lets the line wrap at the bullets; the reference clips on narrow screens. */}
                {i > 0 && (
                  <>
                    <wbr />
                    <i>•</i>
                    <wbr />
                  </>
                )}
                {role}
              </Fragment>
            ))}
          </p>
        )}
        <div className="cta">
          <ShowreelButton youtubeId={settings?.showreelYoutubeId ?? null} />
          <a href="#work" className="arrow">
            Explore work{" "}
            <svg viewBox="0 0 28 12" aria-hidden="true">
              <path d="M0 6h26M21 1l5 5-5 5" />
            </svg>
          </a>
        </div>
      </div>
      <AspectButtons />
      {socials.length > 0 && (
        <div className="socials" aria-label="Social links">
          {socials.map(({ key, url }) => (
            <a key={key} href={url} target="_blank" rel="noopener" aria-label={SOCIAL_LABELS[key]}>
              <SocialIcon name={key} />
            </a>
          ))}
        </div>
      )}
    </HeroFrame>
  );
}
