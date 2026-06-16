"use client";

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type ParallaxOptions = {
  /** Peak movement as a fraction of element height (0.08–0.12 recommended). */
  intensity?: number;
};

export function useScrollParallax<T extends HTMLElement = HTMLDivElement>(
  options: ParallaxOptions = {},
): { ref: RefObject<T | null>; style: CSSProperties } {
  const { intensity = 0.1 } = options;
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();
  const coarse = useCoarsePointer();
  const disabled = reduced;
  const effectiveIntensity = coarse ? intensity * 0.45 : intensity;
  useEffect(() => {
    if (disabled) return;

    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let lastOffset = NaN;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const visible = rect.bottom > 0 && rect.top < vh;
      if (!visible) return;

      const progress = (vh - rect.top) / (vh + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));
      const y = (clamped - 0.5) * 2 * effectiveIntensity * rect.height;
      if (y !== lastOffset) {
        lastOffset = y;
        el.style.transform = `translate3d(0, ${y}px, 0)`;
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, [effectiveIntensity, disabled]);

  const style: CSSProperties = disabled
    ? {}
    : {
        willChange: "transform",
      };

  return { ref, style };
}
