import Cursor from "@/components/Cursor";
import Footer from "@/components/Footer";
import Intro from "@/components/Intro";
import Nav from "@/components/Nav";
import ScrollTimecode from "@/components/ScrollTimecode";

// Public-site chrome. Lives in the (site) group so none of it renders over /admin.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Intro />
      <Nav />
      {children}
      <Footer />
      <ScrollTimecode />
      <Cursor />
      {/* .grain / .vig styles are ported from the design reference in Step 4. */}
      <div className="grain" aria-hidden="true" />
      <div className="vig" aria-hidden="true" />
    </>
  );
}
