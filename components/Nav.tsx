import Image from "next/image";
import NavFrame, { Burger } from "@/components/NavFrame";
import SoundToggle from "@/components/SoundToggle";
import Timecode from "@/components/Timecode";
import pMark from "@/public/brand/p-mark.png";

export interface NavLink {
  href: string;
  label: string;
  /** Opens the showreel instead of scrolling. */
  reel?: boolean;
}

interface NavProps {
  name: string | null;
  links: NavLink[];
}

// Server-rendered links; NavFrame adds scroll-spy, the solid state and the burger menu.
export default function Nav({ name, links }: NavProps) {
  const [first, ...rest] = (name ?? "").split(" ");
  return (
    <NavFrame>
      <div className="wrap">
        <a href="#home" className="brand has-mark" aria-label={name ? `${name}, home` : "Home"}>
          {/* Just the P mark: the full logo's tagline would be unreadable at nav size. */}
          <Image src={pMark} alt="" width={34} height={35} className="mark" loading="eager" />
          <b>{first.toUpperCase()}</b>
          {rest.length > 0 && <span>{rest.join(" ")}</span>}
        </a>
        <nav className="links" id="links" aria-label="Main">
          {links.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className={i === 0 ? "on" : undefined}
              data-reel={link.reel ? "" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="navr">
          <span className="rec mono" aria-hidden="true">
            <i></i>
            <Timecode id="navtc" />
          </span>
          <SoundToggle />
          <Burger />
        </div>
      </div>
    </NavFrame>
  );
}
