import About from "@/components/About";
import Clients from "@/components/Clients";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import FilmStrip from "@/components/FilmStrip";
import Footer from "@/components/Footer";
import GradeLab from "@/components/GradeLab";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Journey from "@/components/Journey";
import Marquee from "@/components/Marquee";
import Nav from "@/components/Nav";
import ScrollTimecode from "@/components/ScrollTimecode";
import WorkGrid from "@/components/WorkGrid";

// Sections in SPEC §5 order. TODO: fetch content from Sanity and pass it down.
export default function Home() {
  return (
    <>
      <Intro />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <WorkGrid />
        <GradeLab />
        <About />
        <Journey />
        <FilmStrip />
        <Clients />
        <Contact />
      </main>
      <Footer />
      <ScrollTimecode />
      <Cursor />
    </>
  );
}
