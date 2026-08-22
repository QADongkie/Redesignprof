"use client";

import { ArrowIcon } from "@/components/common/icons";
import { ShowcaseCanvas } from "@/components/sections/hero/showcase-canvas";

export function HeroSection({
  onSceneReady,
}: {
  onSceneReady: (ready: boolean) => void;
}) {
  return (
    <section className="hero-section" id="hero">
      <div className="hero-visual">
        <ShowcaseCanvas onReady={onSceneReady} />
      </div>

      <div className="hero-content">
        <div className="hero-copy">
          <p className="eyebrow" data-hero-line>
            <i /> LTO-accredited driving school
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
          <div className="hero-proof" data-hero-line>
            <div>
              <strong>147</strong>
              <span>branches</span>
            </div>
            <div>
              <strong>160K+</strong>
              <span>drivers trained</span>
            </div>
            <div>
              <strong>2017</strong>
              <span>established</span>
            </div>
          </div>
        </div>
        <div className="scroll-prompt" data-hero-line>
          <i /> Scroll to explore courses
        </div>
      </div>
    </section>
  );
}
