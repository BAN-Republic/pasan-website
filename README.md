# Starter kit — Pasan portfolio (Next.js + Tailwind + TypeScript + Sanity)

1. Make an empty project folder and open it in VS Code.
2. Copy everything from this kit into it (CLAUDE.md, PROMPTS.md, docs/).
3. Open PROMPTS.md and paste the prompts into Claude Code one step at a time.

Contents
- CLAUDE.md ............ project rules Claude Code reads automatically
- PROMPTS.md ........... 10 step-by-step prompts to paste
- docs/SPEC.md ......... full build spec
- docs/content/ ........ films.json (27), journey.json (10), settings.json — seed data
- docs/reference/ ...... design-reference.html — the approved design

## Contact form: two modes

The "Pitch your story" form picks its mode on the server at build/render time
(`lib/contact-mode.ts`). Only a true/false reaches the browser; the keys never do.

| Env vars set | Site settings email | What visitors get |
|---|---|---|
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` | any | **Direct send.** The form posts to `/api/contact`, which emails the pitch through Resend (reply-to = the visitor). |
| any of the three missing | set | **Email-app fallback.** The form opens the visitor's email app with the subject `Pitch: <type> — <name>` and every field in the body, then shows the Slated card with a *Copy pitch* button. |
| any of the three missing | empty | **Socials only.** The form is hidden and the social links are shown in its place. |

To switch to direct sending once the domain is verified in Resend: add the three
variables in Vercel → Project → Settings → Environment Variables (and in `.env.local`
for local work), then redeploy (or restart `npm run dev`). No code change is needed.
