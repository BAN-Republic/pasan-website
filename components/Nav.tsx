import SoundToggle from "@/components/SoundToggle";

export interface NavLink {
  href: string;
  label: string;
  /** Opens the showreel modal instead of scrolling. */
  reel?: boolean;
}

interface NavProps {
  name: string | null;
  links: NavLink[];
}

// TODO(Step 5): active link on scroll, solid on scroll, burger menu, live REC timecode.
export default function Nav({ name, links }: NavProps) {
  const [first, ...rest] = (name ?? "").split(" ");
  return (
    <header className="nav" id="nav">
      <div className="wrap">
        <a href="#home" className="brand" aria-label={name ? `${name}, home` : "Home"}>
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
            <span id="navtc">00:00:00:00</span>
          </span>
          <SoundToggle />
          <button className="burger" id="burger" aria-label="Open menu" aria-expanded="false">
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
