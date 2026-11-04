import { cacheLife } from "next/cache";

interface FooterProps {
  name: string | null;
}

export default async function Footer({ name }: FooterProps) {
  // Cached so the copyright year can be computed under cacheComponents.
  "use cache";
  cacheLife("days");
  const year = new Date().getFullYear();
  const first = name?.split(" ")[0];
  return (
    <footer>
      <div className="wrap">
        {first && <span className="sig">{first}</span>}
        <span className="mono">
          Great films make people feel something · © {year} {name}
        </span>
        <a href="#home" className="arrow">
          Back to top{" "}
          <svg viewBox="0 0 28 12" style={{ transform: "rotate(-90deg)", width: 12 }} aria-hidden="true">
            <path d="M0 6h26M21 1l5 5-5 5" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
