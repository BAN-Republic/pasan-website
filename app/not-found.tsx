import type { Metadata } from "next";
import Link from "next/link";

// Next adds <meta name="robots" content="noindex"> to 404 responses itself.
export const metadata: Metadata = {
  title: "Scene not found",
};

// Any URL that isn't a page lands here. It sits outside the (site) group, so it brings its own
// .site wrapper (the global styles are scoped to it) and keeps to the reference's look:
// grain, letterbox bars, a slate line and one gold call to action.
export default function NotFound() {
  return (
    <div className="site">
      <div className="grain" aria-hidden="true" />
      <div className="vig" aria-hidden="true" />
      <main className="nf">
        <div className="nf-bar" aria-hidden="true" />
        <div className="wrap nf-body">
          <p className="mono gold">Error 404 · Scene missing</p>
          <h1>
            This scene
            <br />
            <span>didn&apos;t make the cut</span>
          </h1>
          <p className="nf-copy">The page you&apos;re looking for isn&apos;t in the edit. It may have moved, or the link is wrong.</p>
          <p className="mono nf-tc" aria-hidden="true">
            TC 00:00:00:00 · Take 404 · Roll —
          </p>
          <Link href="/" className="submit nf-home">
            Back to the reel ⟶
          </Link>
        </div>
        <div className="nf-bar" aria-hidden="true" />
      </main>
    </div>
  );
}
