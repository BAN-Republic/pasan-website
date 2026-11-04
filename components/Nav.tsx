import NavFrame, { Burger } from "@/components/NavFrame";
import SoundToggle from "@/components/SoundToggle";
import Timecode from "@/components/Timecode";

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
        <a href="#home" className="brand" aria-label={name ? `${name}, home` : "Home"}>
          <b>{first.toUpperCase()}</b>
          {rest.length > 0 && <span>{rest.join(" ")}</span>}
        </a>
        <nav className="links" id="links" aria-label="Main">
          {links.map((link, i) =>
            link.reel ? (
              // TODO(Step 6): open the showreel modal instead of YouTube.
              <a key={link.href} href={link.href} data-reel="" target="_blank" rel="noopener">
                {link.label}
              </a>
            ) : (
              <a key={link.href} href={link.href} className={i === 0 ? "on" : undefined}>
                {link.label}
              </a>
            ),
          )}
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
