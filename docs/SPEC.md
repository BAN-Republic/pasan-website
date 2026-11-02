# Build spec — Pasan Rasantha Chandrasekera portfolio

## 1. Goal
A cinematic one-page portfolio for a commercial film director, with a private admin page where Pasan adds, edits and removes films, updates his showreel, bio, journey and clients. Changes go live within about a minute of clicking Publish.

## 2. Architecture
```
Browser ──> Vercel (Next.js App Router)
              ├─ app/page.tsx           server component, fetches from Sanity
              ├─ app/admin/[[...tool]]  embedded Sanity Studio (Pasan logs in here)
              ├─ app/api/contact        sends enquiry email via Resend
              └─ app/api/revalidate     Sanity webhook → revalidateTag('content')
Sanity (hosted)  stores content + images (free plan)
YouTube          hosts every video
```
No custom backend server. Fetch with `next-sanity` `sanityFetch` using `{ next: { tags: ['content'] } }`.

## 3. Folder structure
```
app/
  layout.tsx            fonts, metadata, grain + vignette overlays
  page.tsx              composes sections in order
  globals.css           ported bespoke CSS from design reference
  admin/[[...tool]]/page.tsx
  api/contact/route.ts
  api/revalidate/route.ts
  sitemap.ts  robots.ts  opengraph-image.tsx (optional)
components/
  Intro.tsx  Nav.tsx  Hero.tsx  Marquee.tsx
  WorkGrid.tsx  FilmCard.tsx  VideoModal.tsx  ShowreelButton.tsx
  GradeLab.tsx  About.tsx  Journey.tsx  FilmStrip.tsx  Clients.tsx
  Contact.tsx  Footer.tsx  Cursor.tsx  SoundToggle.tsx  ScrollTimecode.tsx
lib/
  sanity.client.ts  queries.ts  types.ts  youtube.ts  sound.ts
sanity/
  sanity.config.ts  structure.ts
  schemas/ film.ts  journeyStep.ts  btsFrame.ts  siteSettings.ts  index.ts
scripts/seed.ts
docs/ (this spec, content, reference)
```

## 4. Sanity schemas

### film (document, orderable)
| field | type | rules |
|---|---|---|
| title | string | required |
| slug | slug from title | required |
| youtubeUrl | url | required; accept youtu.be, watch?v=, shorts; store and derive `youtubeId` |
| client | string | required |
| product | string | optional |
| category | string list: `tvc`, `promo`, `music`, `doc`, `corp` | required |
| year | number | optional |
| role | array of strings: Director, Cinematographer, Editor, Colorist, Producer | optional |
| thumbnail | image with hotspot | optional; falls back to YouTube thumbnail |
| description | text, max 300 chars | optional |
| featured | boolean | the first featured film becomes the large card |
| order | number | manual sort (use `@sanity/orderable-document-list`) |
| published | boolean, default true | hide without deleting |

Category labels: tvc → "TVC", promo → "Promo film", music → "Jingle · Music video", doc → "Documentary", corp → "Corporate".

Add a YouTube preview in the Studio: show the thumbnail of `youtubeUrl` in the document list.

### journeyStep (document, orderable)
period (string, e.g. "2012 – 21"), title, organisation, description (text), status (`past` | `present` | `upcoming`), order.

### btsFrame (document, orderable)
image (required, with alt), caption, label (e.g. "Day 02"), order.

### siteSettings (singleton)
name, tagline, roles (array of strings), showreelYoutubeUrl, email, location, availability, socials (youtube, facebook, instagram, vimeo, linkedin – all optional urls), bioParagraphs (array of text), awards (array of {title, detail}), stats (array of {value:number, suffix, label}), clients (array of strings), heroImage, portraitImage, gradeLabImage, contactImage, quote.

Use a structure builder so siteSettings opens as a single document, and Films, Journey, BTS appear as lists.

## 5. Sections (in page order) — port from design reference
1. **Intro** (client): gate with "Roll camera", "Roll without sound", "Skip intro". Sequence: Roll sound → Speed → Roll camera → 3-2-1 leader → clapperboard (date = today) → snap → "Action!" → shutters open. Auto-plays silently after 9s. Skip on Escape. Skip entirely with reduced motion. Remember skip in sessionStorage so it only plays once per visit.
2. **Nav**: brand, section links, REC timecode, sound toggle, burger under 1080px. Active link follows scroll.
3. **Hero**: "I'M Pasan", "Visual Storyteller", roles from settings, Watch Showreel button, Explore work link, HUD corners, aspect-ratio buttons (2.39 / 1.85 / 16:9 / Open) animating the letterbox bars, mouse parallax + lens flare, social icons from settings.
4. **Marquee** strip.
5. **Selected work**: heading "Films that make people feel", category chips with counts, grid (first featured film large), show 12 then "Show all N films". Card = thumbnail, play icon on hover, title, category · client. Click opens VideoModal.
6. **VideoModal** (client): 16:9 YouTube iframe mounted on open and removed on close, title, client, product, category, "Watch on YouTube" link, prev/next within current filter, arrow keys, Escape, focus trap, body scroll lock.
7. **Showreel**: same modal component playing `showreelYoutubeUrl`.
8. **Grade lab**: before/after slider on `gradeLabImage`, 5 looks (Amber Night, Teal & Orange, Bleach Bypass, Noir, Golden Hour) with colour wheels and readout. Copy exactly from reference.
9. **About**: portrait, heading "Turning ideas into powerful visual stories", bio paragraphs, craft tags, awards, animated stats.
10. **Journey**: timeline from journeySteps; present items get a red REC dot; upcoming items use outline text. Closing quote.
11. **BTS journal**: draggable film strip of btsFrames with prev/next buttons.
12. **Clients**: outlined names from settings, gold on hover.
13. **Contact**: heading, email with copy button, location, socials, availability, and the "Pitch your story" form (name, email, project type, message). Submits to `/api/contact`; show the clapperboard "Slated" confirmation on success, error message on failure. Honeypot field + basic rate limit.
14. **Footer** + scroll timecode bar.
15. **Cursor** (fine pointer only) and **Sound** (Web Audio synthesised, off by default).

## 6. Contact API
POST JSON {name, email, type, message, company(honeypot)}. Validate with zod. Send via Resend to `CONTACT_TO_EMAIL`, reply-to = sender. Return 200 / 400 / 429 / 500.

## 7. Revalidation
`/api/revalidate` checks the Sanity webhook signature (`SANITY_REVALIDATE_SECRET`, `parseBody` from `next-sanity/webhook`) and calls `revalidateTag('content')`. Configure the webhook in sanity.io/manage on create/update/delete for all types.

## 8. SEO
Metadata from siteSettings, Open Graph image (hero), `sitemap.ts`, `robots.ts`, JSON-LD `Person` with jobTitle "Commercial Film Director", sameAs = socials, and `VideoObject` for the showreel.

## 9. Environment variables (`.env.example`)
```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
SANITY_API_WRITE_TOKEN=        # seed script only
SANITY_REVALIDATE_SECRET=
RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=
NEXT_PUBLIC_SITE_URL=
```

## 10. Performance targets
Lighthouse ≥ 90 on mobile for performance, accessibility, best practices, SEO. No YouTube iframe on initial load. Hero image priority-loaded, everything else lazy.

## 11. Open items (do not invent — leave TODO and placeholders)
- Real contact email
- Correct Sinhala titles for the AIA, MINISO and Lankem films
- Watawala jingle title; Little Lion client
- Real hero, portrait, grade-lab and BTS photos (reference file uses placeholders)
