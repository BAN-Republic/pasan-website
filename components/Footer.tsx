import Image from "next/image";
import { cacheLife } from "next/cache";
import { logoImageProps } from "@/lib/image";
import type { SanityImage } from "@/lib/types";

interface FooterProps {
  name: string | null;
  line: string | null;
  logo: SanityImage | null;
}

export default async function Footer({ name, line, logo }: FooterProps) {
  // Cached so the copyright year can be computed under cacheComponents.
  "use cache";
  cacheLife("days");
  const year = new Date().getFullYear();
  const first = name?.split(" ")[0];
  const logoImage = logo ? logoImageProps(logo, 210, name ?? "Logo") : null;
  return (
    <footer>
      <div className="wrap">
        {logoImage ? (
          <Image {...logoImage} alt={logoImage.alt} className="footer-logo" />
        ) : (
          first && <span className="sig">{first}</span>
        )}
        <span className="mono">
          {line && `${line} · `}© {year} {name}
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
