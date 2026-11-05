// Server only: reads secret env vars. Import from server components and route handlers,
// never from a "use client" file. Only the resulting mode name is passed to the browser.
import type { ContactMode } from "@/lib/types";

const DIRECT_SEND_VARS = ["RESEND_API_KEY", "CONTACT_TO_EMAIL", "CONTACT_FROM_EMAIL"] as const;

// Read at call time, by name, so the value comes from the running server's environment
// (Vercel injects env vars into the function at runtime). Never cache or inline these.
function envSet(name: (typeof DIRECT_SEND_VARS)[number]): boolean {
  return Boolean(process.env[name]?.trim());
}

/** Names (never values) of the Resend env vars that are missing or empty. */
export function missingDirectSendVars(): string[] {
  return DIRECT_SEND_VARS.filter((name) => !envSet(name));
}

/**
 * Whether the contact form sends through Resend. Switches on by itself once
 * RESEND_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL are all set: no code change,
 * just a redeploy on Vercel (or a dev-server restart locally).
 */
export function directSendEnabled(): boolean {
  return missingDirectSendVars().length === 0;
}

/**
 * Direct sending needs only the env vars, not settings.email. Without them the form
 * falls back to the visitor's email app (needs settings.email), else to the socials.
 * Call it at request time (see components/ContactSection.tsx), not in a cached scope.
 */
export function contactMode(email: string | null | undefined): ContactMode {
  if (directSendEnabled()) return "direct";
  return email?.trim() ? "mailto" : "socials";
}
