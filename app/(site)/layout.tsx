import type { Metadata } from "next";
import Cursor from "@/components/Cursor";
import Footer from "@/components/Footer";
import Intro from "@/components/Intro";
import IntroScript from "@/components/IntroScript";
import Nav, { type NavLink } from "@/components/Nav";
import ScrollTimecode from "@/components/ScrollTimecode";
import Toast from "@/components/Toast";
import { sanityImageProps } from "@/lib/image";
import { getBtsFrames, getJourney, getSettings } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const name = settings?.name ?? "Portfolio";
  const description = settings?.tagline ?? undefined;
  const ogImage = settings?.heroImage ? sanityImageProps(settings.heroImage, 1200, name) : null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
    title: { default: name, template: `%s · ${name}` },
    description,
    openGraph: {
      type: "website",
      title: name,
      description,
      ...(ogImage
        ? { images: [{ url: ogImage.src, width: ogImage.width, height: ogImage.height, alt: ogImage.alt }] }
        : {}),
    },
  };
}

// Public-site chrome. Lives in the (site) group so none of it renders over /admin.
// The .site wrapper scopes the global styles in app/globals.css.
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, journey, frames] = await Promise.all([
    getSettings(),
    getJourney(),
    getBtsFrames(),
  ]);

  // Only link to sections that have something to show.
  const links: NavLink[] = [
    { href: "#home", label: "Home" },
    { href: "#work", label: "Portfolio" },
    ...(settings?.showreelYoutubeId ? [{ href: "#reel", label: "Showreel", reel: true }] : []),
    { href: "#grade", label: "Grade Lab" },
    { href: "#about", label: "About" },
    ...(journey.length ? [{ href: "#journey", label: "Journey" }] : []),
    ...(frames.length ? [{ href: "#journal", label: "BTS Journal" }] : []),
    ...(settings?.clients?.length ? [{ href: "#clients", label: "Clients" }] : []),
    { href: "#contact", label: "Contact" },
  ];

  return (
    <div className="site">
      <IntroScript />
      <Intro name={settings?.name ?? null} logo={settings?.logo ?? null} />
      <div className="grain" aria-hidden="true" />
      <div className="vig" aria-hidden="true" />
      <Cursor />
      <Nav name={settings?.name ?? null} links={links} />
      {children}
      <Footer name={settings?.name ?? null} line={settings?.footerLine ?? null} logo={settings?.logo ?? null} />
      <ScrollTimecode />
      <Toast />
    </div>
  );
}
