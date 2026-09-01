"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { ArrowIcon } from "@/components/common/icons";
import { ShowcaseCanvas } from "@/components/sections/hero/showcase-canvas";

export function FinalCtaSection() {
  const [sceneStatus, setSceneStatus] = useState<"loading" | "ready" | "fallback">("loading");

  const handleSceneReady = useCallback((ready: boolean) => {
    setSceneStatus(ready ? "ready" : "fallback");
  }, []);

  return (
    <section
      className={`final-arrival is-scene-${sceneStatus}`}
      id="arrival"
      aria-labelledby="arrival-title"
    >
      <Image
        className="scene-fallback-backdrop"
        src="/assets/fleet/tl-mabuhay-arrival-blue-hour-backdrop.webp"
        alt=""
        width={1664}
        height={936}
        sizes="100vw"
        aria-hidden="true"
      />
      <Image
        className="scene-fallback-vehicle scene-fallback-vehicle--final"
        src="/assets/campaign/tl-mabuhay-car.webp"
        alt=""
        width={1700}
        height={925}
        sizes="(max-width: 860px) 110vw, 61vw"
        aria-hidden="true"
      />
      <div className="final-arrival-showcase">
        <ShowcaseCanvas onReady={handleSceneReady} />
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
    </section>
  );
}
