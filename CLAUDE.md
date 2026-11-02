# Pasan Rasantha Chandrasekera — Director Portfolio

Portfolio site for a Sri Lankan commercial film director. Cinematic, dark, one gold accent.
Pasan must be able to add new films himself through an admin page, without touching code.

## Read these first
- `docs/SPEC.md` — full build spec: stack, data model, sections, behaviour. Source of truth.
- `docs/reference/design-reference.html` — the approved design as one static HTML file. Match its look, copy, animations and interactions. Port its CSS and JS; do not redesign.
- `docs/content/*.json` — real content (films, journey, profile) to seed into Sanity.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS v4 for layout and spacing; bespoke effects (grain, letterbox, clapperboard, HUD, keyframes) live in `app/globals.css`
- Sanity v3 as the CMS, Studio embedded at `/admin` via `next-sanity`
- Deployed on Vercel. Videos are hosted on YouTube; never store video files in the repo.
- Contact form: Route Handler `app/api/contact/route.ts` sending with Resend

## Rules
- Server components by default. Add `"use client"` only for: Intro, VideoModal, GradeLab, FilmStrip, Cursor, SoundToggle, WorkGrid filters, Contact form.
- All content comes from Sanity through typed GROQ queries in `lib/queries.ts`. No hard-coded films, bio, journey or clients in components.
- Types live in `lib/types.ts`. No `any`.
- YouTube: show the thumbnail first, mount the iframe only on click (`youtube-nocookie.com`, `rel=0`). Never render more than one iframe at a time.
- Thumbnails: Sanity image if set, otherwise `https://i.ytimg.com/vi/{id}/maxresdefault.jpg` with fallback to `hqdefault.jpg`.
- Images through `next/image`. Fonts through `next/font/google` (Bebas Neue, Inter, JetBrains Mono, Mrs Saint Delafield, Noto Sans Sinhala).
- Respect `prefers-reduced-motion`: skip the intro and disable animations.
- Accessibility: keyboard focus visible, modals trap focus and close on Escape, all images have alt text.
- Mobile first. No horizontal scroll at 360px width.
- Secrets only in `.env.local` (never committed). Keep `.env.example` up to date.
- Never invent facts about Pasan (clients, awards, numbers). Only use what is in `docs/content` or Sanity.

## Commands
- `npm run dev` — local site at http://localhost:3000, Studio at http://localhost:3000/admin
- `npm run lint` and `npm run typecheck` must pass before you say a task is done
- `npm run seed` — import `docs/content/*.json` into Sanity (script in `scripts/seed.ts`)

## Definition of done for any task
Builds without errors, lint and typecheck pass, works at 390px and 1440px, and nothing in the design reference was lost without saying so.
