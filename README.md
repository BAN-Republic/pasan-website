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

## Contact form: three modes

The "Pitch your story" form picks its mode on the server **for each request**
(`lib/contact-mode.ts`, called from `components/ContactSection.tsx` after `connection()`).
The rest of the home page is prerendered at build time, so the contact section is a dynamic
hole that streams in the same response. Only the mode name reaches the browser; the keys never do.

| Env vars set | Site settings email | What visitors get |
|---|---|---|
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` | any | **Direct send.** The form posts to `/api/contact`, which emails the pitch through Resend (reply-to = the visitor). |
| any of the three missing | set | **Email-app fallback.** The form opens the visitor's email app with the subject `Pitch: <type> — <name>` and every field in the body, then shows the Slated card with a *Copy pitch* button. |
| any of the three missing | empty | **Socials only.** The form is hidden and the social links are shown in its place. |

To switch to direct sending once the domain is verified in Resend: add the three
variables in Vercel → Project → Settings → Environment Variables (and in `.env.local`
for local work), then redeploy (or restart `npm run dev`). No code change is needed.
Vercel only gives a deployment the env vars that existed when it was created, so a new
deployment is still needed after changing them.

**Checking the mode (temporary).** The `<section id="contact">` element carries
`data-contact-mode` (`direct` / `mailto` / `socials`) and `data-contact-source="request"`.
When the mode isn't `direct`, `data-contact-missing` lists the *names* of the Resend vars the
server can't see (never their values). Remove these three attributes once production is verified.

## Publishing refresh (Sanity webhook)

Pages are cached. When Pasan publishes in the Studio, a Sanity webhook calls
`/api/revalidate`, which checks the signature and expires the cache, so the next visit
shows the change. Set it up once in sanity.io/manage → the project → API → Webhooks →
Create webhook:

| Field | Value |
|---|---|
| Name | Revalidate website |
| URL | `https://YOUR-DOMAIN/api/revalidate` |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | leave empty (all document types, per SPEC §7) |
| Projection | `{_type, _id}` |
| Status | Enabled |
| HTTP method | POST |
| API version | `v2025-02-19` |
| Drafts | off · Versions | off |
| Secret | the same value as `SANITY_REVALIDATE_SECRET` |

Test it (uses the secret from `.env.local`):

```bash
npm run test:webhook                          # against http://localhost:3000
npm run test:webhook -- https://YOUR-DOMAIN   # against the live site
```

It sends a correctly signed request (expects 200) and two bad ones (expect 401).
