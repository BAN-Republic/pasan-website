"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { SOCIAL_LABELS, socialLinks } from "@/components/SocialIcon";
import {
  PROJECT_TYPES,
  fieldErrors,
  pitchSchema,
  type ContactResponse,
  type Pitch,
  type PitchErrors,
  type PitchField,
} from "@/lib/contact";
import { sanityImageProps } from "@/lib/image";
import { clap, tick } from "@/lib/sound";
import { toast } from "@/lib/toast";
import type { SiteSettings } from "@/lib/types";

interface ContactProps {
  settings: SiteSettings | null;
}

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "sent"; pitch: Pitch; date: string }
  | { state: "error"; message: string; mailto: string | null };

const FIELDS: { id: string; name: PitchField }[] = [
  { id: "fname", name: "name" },
  { id: "femail", name: "email" },
  { id: "ftype", name: "type" },
  { id: "fmsg", name: "message" },
];

function today() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)}`;
}

export default function Contact({ settings }: ContactProps) {
  const bg = settings?.contactImage ? sanityImageProps(settings.contactImage, 1400) : null;
  const socials = socialLinks(settings?.socials ?? null);
  const email = settings?.email ?? null;
  const firstName = settings?.name?.split(" ")[0];

  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [errors, setErrors] = useState<PitchErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const slatedRef = useRef<HTMLHeadingElement>(null);

  async function copyEmail() {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      toast("Email copied");
    } catch {
      toast("Select the address and copy it manually");
    }
  }

  // Prefilled email to fall back on when sending fails.
  function mailtoFor(draft: Record<string, string>): string | null {
    if (!email) return null;
    const subject = `${draft.type || "Project"} pitch${draft.name ? ` from ${draft.name}` : ""}`;
    const body = `${draft.message ?? ""}\n\n${draft.name ?? ""}`.trim();
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function focusFirstError(found: PitchErrors) {
    const first = FIELDS.find((f) => found[f.name]);
    if (first) document.getElementById(first.id)?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.state === "sending") return;
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;

    const parsed = pitchSchema.safeParse(data);
    if (!parsed.success) {
      const found = fieldErrors(parsed.error);
      setErrors(found);
      setStatus({ state: "idle" });
      focusFirstError(found);
      return;
    }
    setErrors({});
    setStatus({ state: "sending" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => null)) as ContactResponse | null;
      if (res.ok && body?.ok) {
        clap();
        setStatus({ state: "sent", pitch: parsed.data, date: today() });
        requestAnimationFrame(() => slatedRef.current?.focus());
        return;
      }
      if (body && !body.ok && body.fields) {
        setErrors(body.fields);
        focusFirstError(body.fields);
      }
      setStatus({
        state: "error",
        message: body && !body.ok ? body.error : "Your pitch couldn't be sent right now.",
        mailto: mailtoFor(data),
      });
    } catch {
      setStatus({
        state: "error",
        message: "Your pitch couldn't be sent. Check your connection and try again.",
        mailto: mailtoFor(data),
      });
    }
  }

  function newTake() {
    tick();
    formRef.current?.reset();
    setStatus({ state: "idle" });
    requestAnimationFrame(() => document.getElementById("fname")?.focus());
  }

  const sent = status.state === "sent" ? status : null;
  const fieldProps = (name: PitchField, id: string) => ({
    id,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-err` : undefined,
    onChange: () => errors[name] && setErrors((e) => ({ ...e, [name]: undefined })),
  });
  const fieldError = (name: PitchField, id: string) =>
    errors[name] ? (
      <p className="ferr" id={`${id}-err`}>
        {errors[name]}
      </p>
    ) : null;

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
            {email && (
              <div className="row">
                <span className="mono">Email</span>
                <div className="email">
                  <a href={`mailto:${email}`} id="mail">
                    {email}
                  </a>
                  <button type="button" id="copyMail" onClick={copyEmail} aria-label={`Copy ${email}`}>
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

        <form id="pitch" ref={formRef} noValidate onSubmit={onSubmit} aria-labelledby="pitchTitle">
          {/* Screen readers hear the outcome here; the visible states are below. */}
          <p className="sr-only" aria-live="polite">
            {status.state === "sending"
              ? "Sending your pitch…"
              : sent
                ? "Slated. Your pitch has been sent."
                : status.state === "error"
                  ? status.message
                  : ""}
          </p>

          <div id="formFields" style={{ display: "grid", gap: 16 }} hidden={Boolean(sent)}>
            <div>
              <p className="mono gold">Call sheet</p>
              <h3 id="pitchTitle">Pitch your story</h3>
            </div>
            <div className="field">
              <label htmlFor="fname">
                Your name
                <input {...fieldProps("name", "fname")} autoComplete="name" placeholder="Name and company" />
              </label>
              {fieldError("name", "fname")}
            </div>
            <div className="field">
              <label htmlFor="femail">
                Email
                <input {...fieldProps("email", "femail")} type="email" autoComplete="email" placeholder="you@studio.com" />
              </label>
              {fieldError("email", "femail")}
            </div>
            <div className="field">
              <label htmlFor="ftype">
                Project
                <select {...fieldProps("type", "ftype")} defaultValue={PROJECT_TYPES[0]}>
                  {PROJECT_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              {fieldError("type", "ftype")}
            </div>
            <div className="field">
              <label htmlFor="fmsg">
                The story
                <textarea
                  {...fieldProps("message", "fmsg")}
                  placeholder="What should people feel when the screen goes dark?"
                />
              </label>
              {fieldError("message", "fmsg")}
            </div>
            {/* Honeypot: off-screen, skipped by keyboard and screen readers, left empty by people. */}
            <div className="hp" aria-hidden="true">
              <label htmlFor="fcompany">
                Company
                <input id="fcompany" name="company" type="text" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            {status.state === "error" && (
              <p className="err" id="err" role="alert">
                {status.message}{" "}
                {email && status.mailto ? (
                  <>
                    {/try again/i.test(status.message) ? "Or email" : "Please try again, or email"}{" "}
                    <a href={status.mailto}>{email}</a> directly.
                  </>
                ) : /try again/i.test(status.message) ? null : (
                  "Please try again in a moment."
                )}
              </p>
            )}
            <button
              className="submit"
              type="submit"
              data-cur="Action"
              disabled={status.state === "sending"}
              aria-disabled={status.state === "sending"}
            >
              {status.state === "sending" ? "Slating…" : "Slate it ⟶"}
            </button>
          </div>

          {sent && (
            <div className="wrapcard" id="wrapcard">
              <div>
                <p className="mono gold">Slated</p>
                <h3 ref={slatedRef} tabIndex={-1}>
                  Scene set. Pitch sent.
                </h3>
              </div>
              <div className="slate" id="slate">
                {[
                  ["Production", sent.pitch.name],
                  ["Scene", sent.pitch.type],
                  ["Take", "01"],
                  ["Date", sent.date],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <b>{value}</b>
                  </div>
                ))}
              </div>
              <p style={{ color: "#cfcac2", fontSize: 14 }}>
                Thanks, {sent.pitch.name}. Your pitch is on its way{firstName ? ` to ${firstName}` : ""}, and the reply
                will come to <b style={{ fontWeight: 500 }}>{sent.pitch.email}</b>.
              </p>
              <div className="btnrow">
                <button type="button" className="btn2 ghost" id="newTake" onClick={newTake}>
                  New take
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
