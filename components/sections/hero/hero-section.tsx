"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { ArrowIcon } from "@/components/common/icons";
import { FinalArrivalCanvas } from "@/components/sections/final-arrival-canvas";

export function HeroSection({
  onSceneReady,
}: {
  onSceneReady: (ready: boolean) => void;
}) {
  const [sceneStatus, setSceneStatus] = useState<"loading" | "ready" | "fallback">("loading");

  const handleSceneReady = useCallback(
    (ready: boolean) => {
      setSceneStatus(ready ? "ready" : "fallback");
      // The intro may leave after either the live scene or its visual fallback is ready.
      onSceneReady(true);
    },
    [onSceneReady]
  );

  return (
    <section className={`hero-section is-scene-${sceneStatus}`} id="hero">
      <div className="hero-visual">
        <Image
          className="scene-fallback-backdrop"
          src="/assets/fleet/tl-mabuhay-arrival-blue-hour-backdrop.webp"
          alt=""
          width={1664}
          height={936}
          priority
          sizes="100vw"
          aria-hidden="true"
        />
        <Image
          className="scene-fallback-vehicle scene-fallback-vehicle--hero"
          src="/assets/campaign/tl-mabuhay-car.webp"
          alt=""
          width={1700}
          height={925}
          priority
          sizes="(max-width: 860px) 112vw, 61vw"
          aria-hidden="true"
        />
        <FinalArrivalCanvas onReady={handleSceneReady} />
        <div className="arrival-atmosphere" aria-hidden="true">
          <div className="arrival-ring-wrapper">
            <div className="arrival-ring-core" />
            <div className="arrival-ring-pulse" />
            <div className="arrival-ring-glow" />
          </div>
        </div>
      </div>

      <div className="hero-content">
        <div className="hero-copy">
          <p className="eyebrow" data-hero-line>
            <i /> TL Mabuhay Driving Lesson Academy
          </p>
          <h1 id="hero-title" data-hero-line>
            Your Defensive<br />
            <span>Driving Advocate.</span>
          </h1>
          <p className="hero-lead" data-hero-line>
            Learn with discipline. Practice with purpose. Train in accredited dual-control vehicles engineered for student driver safety.
          </p>
          <div className="hero-actions" data-hero-line>
            <a className="button button--gold" href="https://tlmabuhay.com/enroll">
              Start enrollment <ArrowIcon />
            </a>
            <a className="button button--quiet" href="#courses">
              Explore courses
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
