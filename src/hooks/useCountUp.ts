"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { appleEase, countUpDuration } from "@/lib/motion";

export interface UseCountUpOptions {
  value: number;
  /** Animation length in seconds */
  duration?: number;
  decimals?: number;
  /** Wait for scroll-into-view before counting (default true) */
  startOnView?: boolean;
  enabled?: boolean;
}

export function useCountUp({
  value,
  duration = countUpDuration,
  decimals = 0,
  startOnView = true,
  enabled = true,
}: UseCountUpOptions) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const prevValue = useRef(value);
  const [display, setDisplay] = useState(() =>
    reducedMotion || !startOnView ? value : 0,
  );

  useEffect(() => {
    if (!enabled) {
      setDisplay(value);
      return;
    }
    if (reducedMotion) {
      setDisplay(value);
      prevValue.current = value;
      return;
    }
    if (startOnView && !inView) return;

    const from = prevValue.current;
    const ctrl = animate(from, value, {
      duration,
      ease: [...appleEase],
      onUpdate: (v) => setDisplay(v),
    });
    prevValue.current = value;
    return () => ctrl.stop();
  }, [value, inView, reducedMotion, startOnView, enabled, duration]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : String(Math.round(display));

  /** Avoid showing 0 before scroll-into-view triggers the count-up. */
  const visibleFormatted =
    startOnView && !inView && !reducedMotion && display === 0 && value !== 0
      ? decimals > 0
        ? value.toFixed(decimals)
        : String(Math.round(value))
      : formatted;

  return { ref, display, formatted: visibleFormatted, inView, reducedMotion };
}
