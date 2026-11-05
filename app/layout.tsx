import type { Metadata } from "next";
import {
  Bebas_Neue,
  Inter,
  JetBrains_Mono,
  Mrs_Saint_Delafield,
  Noto_Sans_Sinhala,
} from "next/font/google";
import "./globals.css";

// Each font exposes a --font-* variable; globals.css composes them into the
// --display / --body / --mono / --script tokens from the design reference.
const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const mrsSaintDelafield = Mrs_Saint_Delafield({
  variable: "--font-mrs-saint-delafield",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const notoSansSinhala = Noto_Sans_Sinhala({
  variable: "--font-noto-sans-sinhala",
  weight: ["400", "600", "700"],
  subsets: ["sinhala"],
  display: "swap",
  preload: false,
});

// Fallback only: the public site's metadata comes from siteSettings in
// app/(site)/layout.tsx, and the Studio sets its own (noindex) in app/admin.
export const metadata: Metadata = {
  title: "Pasan Rasantha Chandrasekera",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={[
        bebasNeue.variable,
        inter.variable,
        jetBrainsMono.variable,
        mrsSaintDelafield.variable,
        notoSansSinhala.variable,
      ].join(" ")}
    >
      {/* Site chrome (grain, vignette, nav, intro) lives in app/(site)/layout.tsx.
          suppressHydrationWarning: components/IntroScript.tsx sets data-intro on <html>
          and a class on <body> before React hydrates. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
