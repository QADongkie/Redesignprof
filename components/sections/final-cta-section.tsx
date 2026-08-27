"use client";

import { useCallback, useState } from "react";
import { ArrowIcon } from "@/components/common/icons";
import { ShowcaseCanvas } from "@/components/sections/hero/showcase-canvas";

export function FinalCtaSection() {
  const [sceneReady, setSceneReady] = useState(false);

  const handleReady = useCallback((ready: boolean) => setSceneReady(ready), []);

  return (
    <section
      className={`final-arrival${sceneReady ? " is-scene-ready" : ""}`}
      id="arrival"
      aria-labelledby="arrival-title"
    >
      <div className="final-arrival-showcase">
        <ShowcaseCanvas onReady={handleReady} />
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
          <small>{sceneReady ? "Vehicle showcase" : "TL Mabuhay Fleet"}</small>
          <strong>TL Mabuhay Driving Lesson Academy</strong>
        </span>
      </div>
    </section>
  );
}
