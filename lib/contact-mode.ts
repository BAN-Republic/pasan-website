// Server only: reads secret env vars. Import from server components and route handlers,
// never from a "use client" file. Only the resulting boolean is passed to the browser.

/**
 * Whether the contact form sends through Resend ("direct") or opens the visitor's
 * email app instead ("mailto" fallback). Direct sending switches on by itself once
 * RESEND_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL are all set: no code change,
 * just a redeploy on Vercel (or a dev-server restart locally).
 */
export function directSendEnabled(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.CONTACT_TO_EMAIL?.trim() &&
      process.env.CONTACT_FROM_EMAIL?.trim(),
  );
}
