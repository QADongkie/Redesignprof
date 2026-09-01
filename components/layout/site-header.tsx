"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowIcon, MenuIcon } from "@/components/common/icons";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileHidden, setMobileHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 860px)");
    let frame = 0;

    lastScrollY.current = window.scrollY;

    const updateHeader = () => {
      frame = 0;
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (!mobileQuery.matches || menuOpen || currentScrollY < 96) {
        setMobileHidden(false);
      } else if (delta > 7) {
        setMobileHidden(true);
      } else if (delta < -7) {
        setMobileHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHeader);
    };

    const onViewportChange = () => {
      if (!mobileQuery.matches) setMobileHidden(false);
      lastScrollY.current = window.scrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    mobileQuery.addEventListener?.("change", onViewportChange);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      mobileQuery.removeEventListener?.("change", onViewportChange);
    };
  }, [menuOpen]);

  return (
    <header className={`site-header${mobileHidden ? " is-mobile-hidden" : ""}`}>
      <a className="brand" href="#top" aria-label="TL Mabuhay home">
        <Image src="/assets/tl-mabuhay-logo-exact.svg" alt="" width={52} height={52} priority />
        <span>
          <strong>TL MABUHAY</strong>
          <small>DRIVING LESSON ACADEMY</small>
        </span>
      </a>
      <nav className={menuOpen ? "site-nav is-open" : "site-nav"} aria-label="Primary navigation">
        <a href="#courses" onClick={() => setMenuOpen(false)}>Courses</a>
        <a href="#why-tl" onClick={() => setMenuOpen(false)}>Why TL</a>
        <a href="#branches" onClick={() => setMenuOpen(false)}>Branches</a>
        <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
      </nav>
      <a className="header-cta" href="https://tlmabuhay.com/enroll">
        Enroll now <ArrowIcon />
      </a>
      <button
        type="button"
        className="menu-button"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <MenuIcon />
      </button>
    </header>
  );
}
