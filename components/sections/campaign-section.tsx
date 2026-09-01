"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowIcon } from "@/components/common/icons";

export function CampaignSection() {
  const visualRef = useRef<HTMLDivElement>(null);
  const bgPlateRef = useRef<HTMLDivElement>(null);
  const sunPlateRef = useRef<HTMLDivElement>(null);
  const carNodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const visual = visualRef.current;
    if (!visual) return;

    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let currentScrollProgress = 0;
    let targetScrollProgress = 0;
    let rafId = 0;
    let isVisible = false;
    let pageVisible = !document.hidden;

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

    visual.addEventListener("mousemove", handleMouseMove, { passive: true });
    visual.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    const handleScroll = () => {
      const rect = visual.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.bottom >= -150 && rect.top <= windowHeight + 150) {
        const total = windowHeight + rect.height;
        const current = windowHeight - rect.top;
        targetScrollProgress = Math.max(0, Math.min(1, current / total));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const start = performance.now();
    const loop = (now: number) => {
      rafId = 0;
      if (!isVisible || !pageVisible) return;

      currentMouseX += (targetMouseX - currentMouseX) * 0.08;
      currentMouseY += (targetMouseY - currentMouseY) * 0.08;
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.1;
      const timeSec = (now - start) / 1000;

      // 2.5D Parallax Transforms for Background & Sun
      if (bgPlateRef.current) {
        bgPlateRef.current.style.transform = `translate3d(${currentMouseX * -18}px, ${currentMouseY * -10}px, 0) scale(${1.05 + currentScrollProgress * 0.05})`;
      }

      if (sunPlateRef.current) {
        sunPlateRef.current.style.transform = `translate3d(${currentMouseX * -10}px, ${currentMouseY * -6}px, 0) scale(${1 + currentScrollProgress * 0.03})`;
      }

      if (carNodeRef.current) {
        const travelEase = currentScrollProgress * currentScrollProgress * (3 - 2 * currentScrollProgress);
        const carScrollX = travelEase * 120;
        const carScrollY = travelEase * -65;
        const carScale = Math.max(0.92, 1 - travelEase * 0.08);
        const carCurveRotation = travelEase * -1.5;

        const carParallaxX = currentMouseX * 38;
        const carParallaxY = currentMouseY * 20;
        const carParallaxTilt = currentMouseX * 1.8;

        const roadBounce = Math.sin(timeSec * 4) * 2.2;

        const totalCarX = carScrollX + carParallaxX;
        const totalCarY = carScrollY + carParallaxY + roadBounce;
        const totalCarRot = carCurveRotation + carParallaxTilt;

        carNodeRef.current.style.transform = `translate3d(${totalCarX}px, ${totalCarY}px, 0) scale(${carScale}) rotate(${totalCarRot}deg)`;
      }

      rafId = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (!rafId && isVisible && pageVisible) {
        rafId = requestAnimationFrame(loop);
      }
    };

    const stopLoop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) startLoop();
        else stopLoop();
      },
      { threshold: 0.05 }
    );

    const handleVisibilityChange = () => {
      pageVisible = !document.hidden;
      if (pageVisible) startLoop();
      else stopLoop();
    };

    observer.observe(visual);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopLoop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      visual.removeEventListener("mousemove", handleMouseMove);
      visual.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="campaign-section" id="why-tl" ref={visualRef}>
      {/* 16:9 Uncropped Visual Stage */}
      <div className="campaign-visual-stage" aria-label="TL Mabuhay highway journey">
        {/* Layer 0: Mountain Landscape & Sunset Horizon */}
        <div className="layer-plate layer-bg" ref={bgPlateRef}>
          <Image
            src="/assets/campaign/tl-mabuhay-background.webp"
            alt="TL Mabuhay highway towards mountain sunset"
            className="layer-img"
            width={1672}
            height={941}
            sizes="100vw"
          />
        </div>

        {/* Layer 1: Radiant Sunset Sun & Aura */}
        <div className="layer-plate layer-sun" ref={sunPlateRef}>
          <div className="sun-glow-core" />
          <div className="sun-ring-pulse" />
        </div>

        {/* Layer 2: Vehicle with Ground Shadow & Tail Light Flare */}
        <div className="layer-plate layer-car-wrap">
          <div className="car-dynamic-node" ref={carNodeRef}>
            <div className="car-ground-shadow" />
            <Image
              src="/assets/campaign/tl-mabuhay-car-side-logo.webp"
              alt="TL Mabuhay vehicle traveling safely on the highway"
              className="layer-car-img"
              width={1700}
              height={925}
              sizes="(max-width: 640px) 86vw, (max-width: 1024px) 68vw, 58vw"
            />
            <div className="tail-light-flare" />
          </div>
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
