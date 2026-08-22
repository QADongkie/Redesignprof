"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function LogoIntro({ sceneReady }: { sceneReady: boolean }) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startExit = window.setTimeout(() => setLeaving(true), reduced ? 320 : sceneReady ? 1150 : 2000);
    const remove = window.setTimeout(() => setVisible(false), reduced ? 650 : sceneReady ? 1800 : 2750);
    return () => {
      window.clearTimeout(startExit);
      window.clearTimeout(remove);
    };
  }, [sceneReady]);

  useEffect(() => {
    if (!visible) return;
    document.documentElement.classList.add("intro-active");
    return () => document.documentElement.classList.remove("intro-active");
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={`brand-intro${leaving ? " is-leaving" : ""}`} role="status" aria-label="TL Mabuhay is loading">
      <div className="intro-line intro-line--top" aria-hidden="true" />
      <div className="intro-lockup">
        <div className="intro-seal">
          <Image src="/assets/tl-mabuhay-logo-exact.svg" alt="" width={220} height={220} priority />
        </div>
        <span>TL MABUHAY</span>
        <strong>Your Defensive Driving Advocate</strong>
      </div>
      <div className="intro-line intro-line--bottom" aria-hidden="true" />
    </div>
  );
}
