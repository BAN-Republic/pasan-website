# Claude Code prompts — paste one at a time

Before you start:
1. Create an empty folder, e.g. `pasan-portfolio`, and open it in VS Code.
2. Copy `CLAUDE.md` and the `docs/` folder from this kit into it.
3. Open the Claude Code panel (or run `claude` in the VS Code terminal).
4. Paste the prompts below **in order**. Wait for each to finish, check it in the browser, then move on.
5. Commit after every step: `git add -A && git commit -m "step N"`.

You will need free accounts at: **sanity.io**, **vercel.com**, **resend.com**, and **github.com**.

---

## Step 1 — Scaffold the project
```
Read CLAUDE.md and docs/SPEC.md fully before doing anything.

Scaffold the project in the current folder (it already contains CLAUDE.md and docs/ — keep them):
- Next.js 15 App Router, TypeScript strict, Tailwind CSS v4, ESLint, src dir NO, import alias @/*
- Install: next-sanity, @sanity/image-url, @sanity/vision, sanity, styled-components, @sanity/orderable-document-list, zod, resend
- Add scripts: "typecheck": "tsc --noEmit", "seed": "tsx scripts/seed.ts" (install tsx as dev dependency)
- Create .env.example from SPEC section 9 and a .gitignore that excludes .env*.local
- Set up next/font in app/layout.tsx for Bebas Neue, Inter, JetBrains Mono, Mrs Saint Delafield, Noto Sans Sinhala, exposed as CSS variables matching the --display, --body, --mono, --script tokens in the design reference
- Create the folder structure from SPEC section 3 with empty placeholder components
Run lint and typecheck, then show me the tree.
```

## Step 2 — Sanity schemas and embedded Studio
First create a project at https://www.sanity.io/manage (dataset `production`), then put the project ID in `.env.local`.
```
Implement the Sanity setup from docs/SPEC.md section 4:
- sanity/schemas: film, journeyStep, btsFrame, siteSettings, exported from index.ts
- film: derive youtubeId from youtubeUrl (youtu.be, watch?v=, shorts, embed) with a validation rule that rejects non-YouTube links; list preview shows the YouTube thumbnail, title and client
- Orderable lists for film, journeyStep and btsFrame; siteSettings as a singleton (no create/delete)
- sanity/structure.ts with sections: Site settings, Films, Journey, BTS journal
- Embed the Studio at /admin using app/admin/[[...tool]]/page.tsx (NextStudio), with metadata noindex
- lib/sanity.client.ts, lib/types.ts (TypeScript types for every schema) and lib/queries.ts (GROQ: all published films ordered, journey ordered, bts ordered, settings)
Tell me what to add in sanity.io/manage for CORS so /admin works on localhost:3000 and on Vercel.
```

## Step 3 — Seed real content
Create an API token with Editor rights in sanity.io/manage → API → Tokens, put it in `SANITY_API_WRITE_TOKEN`.
```
Write scripts/seed.ts that reads docs/content/films.json, journey.json and settings.json and creates or replaces the documents in Sanity (use deterministic _id values so running it twice does not duplicate). Ignore the "todo" field but print a list of todos at the end. Do not upload images yet. Run it and confirm the counts (27 films, 10 journey steps, 1 settings).
```

## Step 4 — Global styles and layout shell
```
Open docs/reference/design-reference.html. Port its CSS into app/globals.css: tokens (:root variables), grain, vignette, keyframes, letterbox, HUD, clapperboard, cards, modal, timeline, cursor, responsive rules and reduced-motion rule. Use Tailwind for new layout only; keep the bespoke CSS as classes so the components can reuse the same class names.
Then build app/layout.tsx (grain + vignette overlays, fonts, metadata from settings) and app/page.tsx that fetches settings, films, journey and bts in parallel with tag 'content' and renders the section components in the order in SPEC section 5. Use placeholder content inside components for now.
```

## Step 5 — Hero, nav, marquee, intro
```
Build Nav, Hero, Marquee, ScrollTimecode, SoundToggle (lib/sound.ts, Web Audio synthesised exactly like the reference) and Intro as described in SPEC section 5 items 1–4, matching the reference behaviour and animation timings. Roles, socials and hero image come from settings. Intro plays once per session (sessionStorage), is skipped with reduced motion, and never blocks the page for screen readers. Show me it running at 1440px and 390px.
```

## Step 6 — Selected work + video modal + showreel
```
Build WorkGrid, FilmCard and VideoModal (SPEC section 5 items 5–7):
- Chips with counts per category, first featured film is the large card, show 12 then "Show all N films"
- Thumbnail = Sanity image if present else YouTube maxresdefault with hqdefault fallback (lib/youtube.ts). Add i.ytimg.com and cdn.sanity.io to next.config images.remotePatterns
- VideoModal mounts the youtube-nocookie iframe only while open, prev/next within the active filter, arrow keys, Escape, focus trap, body scroll lock, "Watch on YouTube" link
- ShowreelButton opens the same modal with settings.showreelYoutubeUrl (used in Nav and Hero)
```

## Step 7 — Grade lab, About, Journey, BTS, Clients
```
Build GradeLab, About, Journey, FilmStrip and Clients from SPEC section 5 items 8–12, all content from Sanity (gradeLabImage, portrait, bio, awards, stats, journey steps, bts frames, clients). Keep the grade lab looks, wheels and readout copy exactly as in the reference. Stats count up once when scrolled into view. If an image is missing in Sanity, render a neutral dark placeholder, never a broken image.
```

## Step 8 — Contact form + email
Create a Resend account and API key; verify the sending domain later when you have it (use onboarding@resend.dev for testing).
```
Build Contact and app/api/contact/route.ts per SPEC section 6: zod validation, honeypot, simple in-memory rate limit (5 per IP per 10 minutes), send with Resend to CONTACT_TO_EMAIL with reply-to set to the sender. Keep the clapperboard "Slated" success state from the reference, and a clear error state. Email, location, availability and socials come from settings.
```

## Step 9 — Publish refresh, SEO, polish
```
1. Add app/api/revalidate/route.ts per SPEC section 7 using parseBody from next-sanity/webhook and revalidateTag('content'). Tell me the exact webhook settings to enter in sanity.io/manage.
2. Add SEO per SPEC section 8: metadata, Open Graph, sitemap.ts, robots.ts (disallow /admin), JSON-LD Person and VideoObject.
3. Add the custom Cursor (fine pointer only).
4. Run a full check: lint, typecheck, production build, and fix anything. List any differences from the design reference.
```

## Step 10 — Deploy to Vercel
```
Prepare for Vercel deployment: make sure the build passes, list every environment variable I must add in the Vercel dashboard, and write a short README.md with local setup, seeding, and deploy steps. Also write docs/ADMIN-GUIDE.md: a one-page, non-technical guide for Pasan explaining how to log in at /admin, add a new film by pasting a YouTube link, reorder films, hide a film, change the showreel, and update his bio and journey.
```
Then: push to GitHub → import the repo in Vercel → add env vars → deploy → add the Vercel URL to Sanity CORS → create the Sanity webhook pointing at `https://YOUR-DOMAIN/api/revalidate` → invite Pasan to the Sanity project as Editor.

---

## Useful follow-up prompts
- `Pasan sent new photos in /public/import — upload them to Sanity and attach them to siteSettings (hero, portrait, gradeLab, contact) and create btsFrames for the rest.`
- `Run Lighthouse on the production build at mobile size and fix anything below 90.`
- `Add a hover preview to film cards using an optional "previewClip" file field (short muted MP4) in the film schema.`
