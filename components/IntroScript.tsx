import { INTRO_SEEN_KEY } from "@/lib/intro";

// Runs during HTML parsing, before first paint, so returning visitors,
// reduced-motion users and shared #film-… / #reel links never see a flash of the intro (and first-time visitors
// never see a flash of the page). Sets <html data-intro> and the body class
// that <Intro> would otherwise set. app/layout.tsx has suppressHydrationWarning
// on <html> and <body> because of this.
const SCRIPT = `(function(){var s="skip";try{if(!/^#(film-|reel$)/.test(location.hash)&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&!sessionStorage.getItem(${JSON.stringify(INTRO_SEEN_KEY)}))s="play"}catch(e){}document.documentElement.dataset.intro=s;document.body.classList.add(s==="play"?"lock":"action")})()`;

export default function IntroScript() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      {/* Without JavaScript the intro could never be dismissed. */}
      <noscript>
        <style>{"#intro{display:none}"}</style>
      </noscript>
    </>
  );
}
