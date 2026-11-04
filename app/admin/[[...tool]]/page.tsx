import { NextStudio } from "next-sanity/studio";
import config from "@/sanity/sanity.config";
import { projectId } from "@/sanity/env";

// Sets robots: noindex and referrer: same-origin, plus the Studio viewport.
// No `export const dynamic`: route segment config is not allowed with cacheComponents.
export { metadata, viewport } from "next-sanity/studio";

export default function AdminPage() {
  // The Studio cannot even prerender without a project id.
  if (!projectId) {
    return (
      <p style={{ padding: 24, fontFamily: "var(--mono)" }}>
        Sanity is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local.
      </p>
    );
  }
  return <NextStudio config={config} />;
}
