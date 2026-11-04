"use client";

import { createContext, useContext, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { openReel } from "@/lib/player";

const MenuContext = createContext<{ open: boolean; toggle: () => void }>({
  open: false,
  toggle: () => {},
});

/**
 * Client shell around the server-rendered nav: solid background after 40px of
 * scroll, scroll-spy on the section links, and the burger menu state.
 */
export default function NavFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setSolid(document.documentElement.scrollTop > 40);
      // The last section whose top has passed 40% of the viewport is current.
      let current = "home";
      document.querySelectorAll<HTMLElement>("main section[id]").forEach((section) => {
        if (section.getBoundingClientRect().top < innerHeight * 0.4) current = section.id;
      });
      // Links are server-rendered, so mark the active one directly.
      ref.current?.querySelectorAll(".links a").forEach((a) => {
        a.classList.toggle("on", a.getAttribute("href") === `#${current}`);
      });
    }
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, []);

  // Choosing a link closes the mobile menu; the Showreel link opens the modal.
  function onClick(event: MouseEvent<HTMLElement>) {
    const link = (event.target as Element).closest(".links a");
    if (!link) return;
    setOpen(false);
    if (link.hasAttribute("data-reel")) {
      event.preventDefault();
      openReel();
    }
  }

  const className = ["nav", solid && "solid", open && "open"].filter(Boolean).join(" ");
  return (
    <MenuContext.Provider value={{ open, toggle: () => setOpen((o) => !o) }}>
      <header className={className} id="nav" ref={ref} onClick={onClick}>
        {children}
      </header>
    </MenuContext.Provider>
  );
}

export function Burger() {
  const { open, toggle } = useContext(MenuContext);
  return (
    <button
      className="burger"
      id="burger"
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      aria-controls="links"
      onClick={toggle}
    >
      <span></span>
    </button>
  );
}
