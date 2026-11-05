import type { Metadata } from "next";
import Cursor from "@/components/Cursor";
import Footer from "@/components/Footer";
import Intro from "@/components/Intro";
import IntroScript from "@/components/IntroScript";
import Nav, { type NavLink } from "@/components/Nav";
import ScrollTimecode from "@/components/ScrollTimecode";
import Toast from "@/components/Toast";
import { socialLinks } from "@/components/SocialIcon";
import { ogImageProps } from "@/lib/image";
import { siteOrigin } from "@/lib/site";
import { getBtsFrames, getJourney, getSettings } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const name = settings?.name ?? "Portfolio";
  const role = settings?.roles?.[0] ?? null;
  const title = role ? `${name} · ${role}` : name;
  const description =
    [settings?.tagline, role && settings?.location ? `${role} based in ${settings.location}.` : null]
      .filter(Boolean)
      .join(" ") || undefined;
  const ogImage = settings?.heroImage ? ogImageProps(settings.heroImage, name) : null;
  const origin = siteOrigin();
  const socials = socialLinks(settings?.socials ?? null);
  return {
    // Without NEXT_PUBLIC_SITE_URL the canonical and og:url are left out rather than guessed.
    ...(origin ? { metadataBase: new URL(origin), alternates: { canonical: "/" } } : {}),
    title: { default: title, template: `%s · ${name}` },
    description,
    applicationName: name,
    authors: [{ name, ...(socials[0] ? { url: socials[0].url } : {}) }],
    creator: name,
    openGraph: {
      type: "website",
      ...(origin ? { url: "/" } : {}),
      siteName: name,
      title,
      description,
      locale: "en_US",
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [{ url: ogImage.url, alt: ogImage.alt }] } : {}),
    },
    robots: { index: true, follow: true },
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
