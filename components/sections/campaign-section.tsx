"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowIcon } from "@/components/common/icons";

export function CampaignSection() {
  const visualRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);

  useEffect(() => {
    const visual = visualRef.current;
    if (!visual) return;

    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let rafId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = visual.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetMouseX = Math.max(-1, Math.min(1, x));
      targetMouseY = Math.max(-1, Math.min(1, y));
    };

    const handleMouseLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
    };

    visual.addEventListener("mousemove", handleMouseMove);
    visual.addEventListener("mouseleave", handleMouseLeave);

    const handleScroll = () => {
      const rect = visual.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.bottom >= -200 && rect.top <= windowHeight + 200) {
        const total = windowHeight + rect.height;
        const current = windowHeight - rect.top;
        const progress = Math.max(0, Math.min(1, current / total));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    let start = performance.now();
    const loop = (now: number) => {
      currentMouseX += (targetMouseX - currentMouseX) * 0.09;
      currentMouseY += (targetMouseY - currentMouseY) * 0.09;
      setMouseOffset({ x: currentMouseX, y: currentMouseY });
      setTime((now - start) / 1000);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      visual.removeEventListener("mousemove", handleMouseMove);
      visual.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 2.5D Parallax Transforms for Background & Sun
  const bgTransform = `translate(${mouseOffset.x * -20}px, ${mouseOffset.y * -12}px) scale(${1.05 + scrollProgress * 0.05})`;
  const sunTransform = `translate(${mouseOffset.x * -10}px, ${mouseOffset.y * -6}px) scale(${1 + scrollProgress * 0.03})`;

  // Controlled, subtle Highway Travel (prevents overshooting the road)
  const travelEase = scrollProgress * scrollProgress * (3 - 2 * scrollProgress);
  const carScrollX = travelEase * 140;
  const carScrollY = travelEase * -80;
  const carScale = Math.max(0.78, 1 - travelEase * 0.18);
  const carCurveRotation = travelEase * -1.8; // subtle rotation into the curve

  const carParallaxX = mouseOffset.x * 42;
  const carParallaxY = mouseOffset.y * 22;
  const carParallaxTilt = mouseOffset.x * 2.0;

  // Subtle ambient road suspension bounce
  const roadBounce = Math.sin(time * 4) * 2.5;

  const totalCarX = carScrollX + carParallaxX;
  const totalCarY = carScrollY + carParallaxY + roadBounce;
  const totalCarRot = carCurveRotation + carParallaxTilt;

  const carTransform = `translate3d(${totalCarX}px, ${totalCarY}px, 0) scale(${carScale}) rotate(${totalCarRot}deg)`;

  return (
    <section className="campaign-section" id="why-tl" ref={visualRef}>
      {/* 16:9 Uncropped Visual Stage */}
      <div className="campaign-visual-stage" aria-label="TL Mabuhay highway journey">
        {/* Layer 0: Mountain Landscape & Sunset Horizon */}
        <div className="layer-plate layer-bg" style={{ transform: bgTransform }}>
          <img
            src="/assets/campaign/tl-mabuhay-background.png"
            alt="TL Mabuhay highway towards mountain sunset"
            className="layer-img"
          />
        </div>

        {/* Layer 1: Radiant Sunset Sun & Aura */}
        <div className="layer-plate layer-sun" style={{ transform: sunTransform }}>
          <div className="sun-glow-core" />
          <div className="sun-ring-pulse" />
        </div>

        {/* Layer 2: Vehicle with Ground Shadow & Tail Light Flare */}
        <div className="layer-plate layer-car-wrap">
          <div className="car-dynamic-node" style={{ transform: carTransform }}>
            <div className="car-ground-shadow" />
            <img
              src="/assets/campaign/tl-mabuhay-car-side-logo.png"
              alt="TL Mabuhay vehicle traveling safely on the highway"
              className="layer-car-img"
            />
            <div className="tail-light-flare" />
          </div>
        </div>

        {/* HUD Badge: Bottom Right */}
        <div className="campaign-hud-tag">
          <span className="hud-pulse-dot" />
          <span>READY TO DRIVE</span>
        </div>

        {/* Left-side Atmospheric Vignette for Typography Readability */}
        <div className="campaign-vignette" />
      </div>

      {/* Typography Overlay Positioned on Left */}
      <div className="campaign-copy-container">
        <div className="campaign-copy" data-reveal>
          <p data-reveal-item>Why TL Mabuhay</p>
          <h2 data-reveal-item>Advocacy behind every lesson.</h2>
          <p data-reveal-item>
            We prepare drivers to do more than operate a vehicle. We teach awareness, discipline, and respect for every person sharing the road.
          </p>
          <blockquote data-reveal-item>“Driving Excellence With Discipline”</blockquote>
          <a data-reveal-item href="https://tlmabuhay.com/about">
            Learn about TL Mabuhay <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  );
}
