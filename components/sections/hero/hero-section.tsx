"use client";

import { ArrowIcon } from "@/components/common/icons";
import { FinalArrivalCanvas } from "@/components/sections/final-arrival-canvas";

export function HeroSection({
  onSceneReady,
}: {
  onSceneReady: (ready: boolean) => void;
}) {
  return (
    <section className="hero-section" id="hero">
      <div className="hero-visual">
        <FinalArrivalCanvas onReady={() => onSceneReady(true)} />
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
