import About from "@/components/About";
import Clients from "@/components/Clients";
import ContactSection from "@/components/ContactSection";
import FilmStrip from "@/components/FilmStrip";
import GradeLab from "@/components/GradeLab";
import Hero from "@/components/Hero";
import Journey from "@/components/Journey";
import JsonLd from "@/components/JsonLd";
import Marquee from "@/components/Marquee";
import VideoModal from "@/components/VideoModal";
import WorkGrid from "@/components/WorkGrid";
import { getBtsFrames, getFilms, getJourney, getSettings } from "@/lib/queries";

export default async function Home() {
  const [settings, films, journey, frames] = await Promise.all([
    getSettings(),
    getFilms(),
    getJourney(),
    getBtsFrames(),
  ]);

  // Sections in SPEC §5 order. Each one copes with missing data. The modal sits
  // outside <main> so the page behind it can be made inert while it is open.
  return (
    <>
      <main>
        <Hero settings={settings} />
        <Marquee words={settings?.marqueeWords ?? []} />
        <WorkGrid films={films} />
        <GradeLab image={settings?.gradeLabImage ?? null} />
        <About settings={settings} />
        <Journey steps={journey} intro={settings?.journeyIntro ?? null} quote={settings?.quote ?? null} />
        <FilmStrip frames={frames} />
        <Clients clients={settings?.clients ?? []} />
        <ContactSection settings={settings} />
      </main>
      <VideoModal films={films} showreelId={settings?.showreelYoutubeId ?? null} />
      <JsonLd settings={settings} films={films} />
    </>
  );
}
