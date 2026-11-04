"use client";

import Image from "next/image";
import type { FormEvent } from "react";
import { SOCIAL_LABELS, socialLinks } from "@/components/SocialIcon";
import { sanityImageProps } from "@/lib/image";
import type { SiteSettings } from "@/lib/types";

// Copy from the design reference.
const PROJECT_TYPES = [
  "TV commercial",
  "Brand film",
  "Documentary",
  "Music video",
  "Colour grade only",
];

interface ContactProps {
  settings: SiteSettings | null;
}

// TODO(Step 8): copy-email button, submit to /api/contact, "Slated" confirmation, errors.
export default function Contact({ settings }: ContactProps) {
  const bg = settings?.contactImage ? sanityImageProps(settings.contactImage, 1400) : null;
  const socials = socialLinks(settings?.socials ?? null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <section className="sec contact" id="contact">
      {bg && (
        <div className="bg">
          <Image {...bg} alt="" sizes="(max-width: 760px) 100vw, 48vw" />
        </div>
      )}
      <div className="wrap cgrid">
        <div>
          <p className="k mono gold" style={{ marginBottom: 16 }}>
            Scene 07 · Contact
          </p>
          <h2>
            Let&apos;s create
            <br />
            something
            <br />
            <span>extraordinary</span>
          </h2>
          <div className="cinfo">
            {settings?.email && (
              <div className="row">
                <span className="mono">Email</span>
                <div className="email">
                  <a href={`mailto:${settings.email}`} id="mail">
                    {settings.email}
                  </a>
                  <button type="button" id="copyMail">
                    Copy
                  </button>
                </div>
              </div>
            )}
            {settings?.location && (
              <div className="row">
                <span className="mono">Based in</span>
                <span>{settings.location}</span>
              </div>
            )}
            {socials.length > 0 && (
              <div className="row">
                <span className="mono">Follow</span>
                <span style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
                  {socials.map(({ key, url }) => (
                    <a key={key} className="ytlink" href={url} target="_blank" rel="noopener">
                      {SOCIAL_LABELS[key]} ↗
                    </a>
                  ))}
                </span>
              </div>
            )}
            {settings?.availability && (
              <div className="row">
                <span className="mono">Availability</span>
                <span>{settings.availability}</span>
              </div>
            )}
          </div>
        </div>
        <form id="pitch" noValidate onSubmit={onSubmit}>
          <div id="formFields" style={{ display: "grid", gap: 16 }}>
            <div>
              <p className="mono gold">Call sheet</p>
              <h3>Pitch your story</h3>
            </div>
            <label htmlFor="fname">
              Your name
              <input id="fname" name="name" autoComplete="name" placeholder="Name and company" />
            </label>
            <label htmlFor="femail">
              Email
              <input id="femail" name="email" type="email" autoComplete="email" placeholder="you@studio.com" />
            </label>
            <label htmlFor="ftype">
              Project
              <select id="ftype" name="type">
                {PROJECT_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label htmlFor="fmsg">
              The story
              <textarea id="fmsg" name="message" placeholder="What should people feel when the screen goes dark?" />
            </label>
            <p className="err" id="err" role="alert"></p>
            <button className="submit" type="submit" data-cur="Action">
              Slate it ⟶
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
