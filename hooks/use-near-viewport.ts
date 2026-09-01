"use client";

import { useEffect, useRef, useState } from "react";

interface NearViewportOptions {
  initial?: boolean;
  rootMargin?: string;
}

/**
 * Mounts expensive scenes only while they are close to the viewport.
 * Leaving the margin tears the scene down so mobile browsers can release its
 * WebGL context and GPU allocations instead of merely pausing animation.
 */
export function useNearViewport<T extends Element>({
  initial = false,
  rootMargin = "160px 0px",
}: NearViewportOptions = {}) {
  const ref = useRef<T>(null);
  const [isNearViewport, setIsNearViewport] = useState(initial);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      const frame = window.requestAnimationFrame(() => setIsNearViewport(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, isNearViewport };
}
