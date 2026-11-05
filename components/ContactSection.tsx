import { connection } from "next/server";
import { Suspense } from "react";
import Contact from "@/components/Contact";
import { contactMode, missingDirectSendVars } from "@/lib/contact-mode";
import type { SiteSettings } from "@/lib/types";

interface ContactSectionProps {
  settings: SiteSettings | null;
}

/**
 * The home page is prerendered at build time, so anything read there is frozen into the
 * static HTML until the next build. The contact mode depends on env vars, so it is
 * decided per request instead: `connection()` turns this into a dynamic hole that
 * streams in the same response, reading process.env from the running server.
 */
async function LiveContact({ settings }: ContactSectionProps) {
  await connection();
  const mode = contactMode(settings?.email);
  // TEMP (remove once production is verified): which Resend vars the server can't see.
  // Names only, never values.
  const missing = mode === "direct" ? undefined : missingDirectSendVars().join(",");
  return <Contact settings={settings} mode={mode} missingVars={missing} />;
}

export default function ContactSection({ settings }: ContactSectionProps) {
  // The fallback in the static shell is the build-time guess. It's normally identical to
  // the live result, so nothing visibly changes when the live section streams in.
  return (
    <Suspense fallback={<Contact settings={settings} mode={contactMode(settings?.email)} pending />}>
      <LiveContact settings={settings} />
    </Suspense>
  );
}
