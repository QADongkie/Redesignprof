"use client";

import { useEffect } from "react";
import { animate, createDrawable, stagger } from "animejs";

export function useBusinessMotion() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      document.documentElement.classList.add("reduced-motion");
      return;
    }

    const heroTimer = window.setTimeout(() => {
      animate(document.querySelectorAll<HTMLElement>("[data-hero-line]"), {
        opacity: [0, 1],
        y: [30, 0],
        duration: 760,
        delay: stagger(95),
        ease: "outExpo",
      });
    }, 980);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.target.classList.contains("is-revealed")) return;
          entry.target.classList.add("is-revealed");
          const element = entry.target as HTMLElement;
          const items = element.querySelectorAll<HTMLElement>("[data-reveal-item]");
          animate(items.length ? items : element, {
            opacity: [0, 1],
            y: [24, 0],
            duration: 720,
            delay: items.length ? stagger(85) : 0,
            ease: "outExpo",
          });

          const drawTargets = element.querySelectorAll<SVGGeometryElement>("[data-draw]");
          if (drawTargets.length) {
            animate(createDrawable(drawTargets), {
              draw: ["0 0", "0 1"],
              duration: 1450,
              delay: stagger(160),
              ease: "inOutQuad",
            });
          }

          const pins = element.querySelectorAll<SVGGElement>("[data-map-pin]");
          if (pins.length) {
            animate(pins, {
              opacity: [0, 1],
              scale: [0.5, 1],
              duration: 560,
              delay: stagger(70, { start: 520 }),
              ease: "outBack",
            });
          }
          observer.unobserve(element);
        });
      },
      { threshold: 0.18 }
    );

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => observer.observe(element));
    return () => {
      window.clearTimeout(heroTimer);
      observer.disconnect();
    };
  }, []);
}
