import About from "@/components/About";
import Clients from "@/components/Clients";
import Contact from "@/components/Contact";
import FilmStrip from "@/components/FilmStrip";
import GradeLab from "@/components/GradeLab";
import Hero from "@/components/Hero";
import Journey from "@/components/Journey";
import Marquee from "@/components/Marquee";
import WorkGrid from "@/components/WorkGrid";

// Sections in SPEC §5 order. TODO: fetch content from Sanity and pass it down.
export default function Home() {
  return (
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
  );
}
