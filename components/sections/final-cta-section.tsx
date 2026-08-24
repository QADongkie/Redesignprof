"use client";

import { useCallback, useState } from "react";
import { ArrowIcon } from "@/components/common/icons";
import { FinalArrivalCanvas } from "@/components/sections/final-arrival-canvas";

export function FinalCtaSection() {
  const [sceneReady, setSceneReady] = useState(false);
  const [arrived, setArrived] = useState(false);
  const handleReady = useCallback(() => setSceneReady(true), []);
  const handleArrived = useCallback(() => setArrived(true), []);

  return (
    <section
      className={`final-arrival${sceneReady ? " is-scene-ready" : ""}${arrived ? " is-arrived" : ""}`}
      id="arrival"
      aria-labelledby="arrival-title"
    >
      <FinalArrivalCanvas onReady={handleReady} onArrived={handleArrived} />
      <div className="arrival-atmosphere" aria-hidden="true">
        <div className="arrival-ring-wrapper">
          <div className="arrival-ring-core" />
          <div className="arrival-ring-pulse" />
          <div className="arrival-ring-glow" />
        </div>
      </div>

      <div className="arrival-copy" data-reveal>
        <p className="arrival-kicker" data-reveal-item>The journey ends where yours begins.</p>
        <h2 id="arrival-title" data-reveal-item>
          Your defensive <span>driving advocate.</span>
        </h2>
        <p className="arrival-lead" data-reveal-item>
          Learn with awareness. Drive with discipline. Arrive with confidence.
        </p>
        <div className="arrival-actions" data-reveal-item>
          <a className="button button--gold" href="https://tlmabuhay.com/enroll">
            Start driving safer <ArrowIcon />
          </a>
          <a className="button button--quiet" href="#branches">
            Find your branch <ArrowIcon />
          </a>
        </div>
      </div>

      <div className="arrival-destination" aria-live="polite">
        <span className="arrival-destination__line" aria-hidden="true" />
        <span>
          <small>{arrived ? "Destination reached" : "Final destination"}</small>
          <strong>TL Mabuhay Driving Lesson Academy</strong>
        </span>
      </div>
    </section>
  );
}
