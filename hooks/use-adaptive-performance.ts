"use client";

import { useEffect, useState } from "react";

export type PerformanceTier = "high" | "medium" | "low";

export function useAdaptivePerformance() {
  const [tier, setTier] = useState<PerformanceTier>("high");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial hardware capability heuristic
    const isMobile =
      /Android|iPhone|iPad|iPod|Windows Phone|webOS/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);

    const cores = navigator.hardwareConcurrency || 4;
    // @ts-ignore
    const deviceMemory = navigator.deviceMemory || 4;

    let initialTier: PerformanceTier = "high";
    if (isMobile && (cores <= 4 || deviceMemory <= 4)) {
      initialTier = "low";
    } else if (isMobile || cores <= 6 || deviceMemory <= 6) {
      initialTier = "medium";
    }

    setTier(initialTier);
    if (initialTier === "low") {
      document.documentElement.classList.add("perf-low");
    }

    // Real-time FPS / Frame-Drop Watcher
    let frameCount = 0;
    let lastTime = performance.now();
    let lowFpsStreak = 0;
    let rafId = 0;

    const checkFps = (time: number) => {
      frameCount++;
      const delta = time - lastTime;

      if (delta >= 1000) {
        const fps = (frameCount * 1000) / delta;
        frameCount = 0;
        lastTime = time;

        // If FPS drops below 36 on active page, automatically downscale performance tier
        if (fps < 36) {
          lowFpsStreak++;
          if (lowFpsStreak >= 2) {
            setTier("low");
            document.documentElement.classList.add("perf-low");
          }
        } else if (fps >= 55 && !isMobile) {
          lowFpsStreak = 0;
        }
      }

      rafId = requestAnimationFrame(checkFps);
    };

    rafId = requestAnimationFrame(checkFps);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return { tier, isLowTier: tier === "low" };
}
