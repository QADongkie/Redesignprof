"use client";

import { useEffect } from "react";

export type PerformanceTier = "high" | "medium" | "low";

export function useAdaptivePerformance() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial hardware capability heuristic
    const isMobile =
      /Android|iPhone|iPad|iPod|Windows Phone|webOS/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);

    const cores = navigator.hardwareConcurrency || 4;
    const deviceMemory =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;

    let initialTier: PerformanceTier = "high";
    if (isMobile && (cores <= 4 || deviceMemory <= 4)) {
      initialTier = "low";
    } else if (isMobile || cores <= 6 || deviceMemory <= 6) {
      initialTier = "medium";
    }

    const root = document.documentElement;
    root.classList.toggle("perf-low", initialTier === "low");

    // Real-time FPS / Frame-Drop Watcher
    let frameCount = 0;
    let lastTime = performance.now();
    let lowFpsStreak = 0;
    let rafId = 0;
    let pageVisible = !document.hidden;

    const checkFps = (time: number) => {
      rafId = 0;
      if (!pageVisible) return;

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
            root.classList.add("perf-low");
          }
        } else if (fps >= 55 && !isMobile) {
          lowFpsStreak = 0;
        }
      }

      rafId = requestAnimationFrame(checkFps);
    };

    const startMonitor = () => {
      if (!rafId && pageVisible) {
        lastTime = performance.now();
        frameCount = 0;
        rafId = requestAnimationFrame(checkFps);
      }
    };

    const stopMonitor = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const handleVisibilityChange = () => {
      pageVisible = !document.hidden;
      if (pageVisible) startMonitor();
      else stopMonitor();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startMonitor();

    return () => {
      stopMonitor();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      root.classList.remove("perf-low");
    };
  }, []);
}
