import { Resend } from "resend";
import { fieldErrors, pitchSchema, pitchSubject, pitchText, type ContactResponse, type Pitch } from "@/lib/contact";
import { directSendEnabled } from "@/lib/contact-mode";

// POST /api/contact — "Pitch your story" form (SPEC §6), direct-send mode.
// 200 sent (or honeypot) · 400 invalid · 429 rate limited · 500 not sent · 503 not configured.
// While the Resend env vars are missing the form never calls this route: it opens the
// visitor's email app instead (see lib/contact-mode.ts).

// ---------- rate limit ----------
// 5 requests per IP per 10 minutes, kept in this server instance's memory.
// On Vercel each serverless instance has its own memory and instances come and go,
// so this resets per instance: it stops casual repeat submissions, not a determined
// attacker. Use a shared store (e.g. Upstash Redis) if that ever matters.
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function rateLimit(ip: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return { ok: false, retryAfter: Math.ceil((recent[0] + WINDOW_MS - now) / 1000) };
  }
  recent.push(now);
  hits.set(ip, recent);
  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5000) {
    for (const [key, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
  }
  return { ok: true };
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function json(body: ContactResponse, status: number, headers?: HeadersInit) {
  return Response.json(body, { status, headers });
}

// ---------- email ----------
const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function emailBodies(pitch: Pitch) {
  const rows: [string, string][] = [
    ["Name", pitch.name],
    ["Email", pitch.email],
    ["Project", pitch.type],
  ];
  const text = [
    `New pitch from the website`,
    ``,
    pitchText(pitch),
    ``,
    `Reply to this email to answer ${pitch.name} directly.`,
  ].join("\n");

  const cell = "padding:8px 12px;border-bottom:1px solid #e6e2da;vertical-align:top";
  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f5f3ef;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#141312">
<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e6e2da;border-collapse:collapse">
<tr><td style="padding:20px 24px;background:#0b0b0b;color:#d4a24a;font:600 13px/1.4 Menlo,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase">Call sheet · New pitch</td></tr>
<tr><td style="padding:16px 12px 0">
<table role="presentation" width="100%" style="border-collapse:collapse;font-size:15px">
${rows.map(([k, v]) => `<tr><th align="left" style="${cell};width:96px;color:#8a8478;font-weight:500">${k}</th><td style="${cell}">${k === "Email" ? `<a href="mailto:${escape(v)}" style="color:#9a6f22">${escape(v)}</a>` : escape(v)}</td></tr>`).join("\n")}
</table></td></tr>
<tr><td style="padding:20px 24px 8px;color:#8a8478;font-size:13px;text-transform:uppercase;letter-spacing:.1em">The story</td></tr>
<tr><td style="padding:0 24px 24px;font-size:15px;line-height:1.6;white-space:pre-wrap">${escape(pitch.message)}</td></tr>
<tr><td style="padding:14px 24px;border-top:1px solid #e6e2da;color:#8a8478;font-size:12px">Reply to this email to answer ${escape(pitch.name)} directly.</td></tr>
</table></body></html>`;

  return { subject: pitchSubject(pitch), text, html };
}

export async function POST(request: Request) {
  const limited = rateLimit(clientIp(request));
  if (!limited.ok) {
    return json(
      { ok: false, error: "Too many pitches in a short time. Please wait a few minutes and try again." },
      429,
      { "Retry-After": String(limited.retryAfter) },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "The form data couldn't be read. Please try again." }, 400);
  }

  const parsed = pitchSchema.safeParse(body);
  if (!parsed.success) {
    return json({ ok: false, error: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }, 400);
  }
  const pitch = parsed.data;

  // Honeypot filled: almost certainly a bot. Answer like a success, send nothing.
  if (pitch.company) return json({ ok: true }, 200);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!directSendEnabled() || !apiKey || !to || !from) {
    return json({ ok: false, error: "Direct sending isn't switched on yet." }, 503);
  }

  const { subject, text, html } = emailBodies(pitch);
  try {
    const { error } = await new Resend(apiKey).emails.send({ from, to, replyTo: pitch.email, subject, text, html });
    if (error) {
      console.error("[contact] Resend error:", error);
      return json({ ok: false, error: "Your pitch couldn't be sent right now." }, 500);
    }
  } catch (error) {
    console.error("[contact] Send failed:", error);
    return json({ ok: false, error: "Your pitch couldn't be sent right now." }, 500);
  }
  return json({ ok: true }, 200);
}
