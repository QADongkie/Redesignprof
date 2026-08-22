"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowIcon, MenuIcon } from "@/components/common/icons";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
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
