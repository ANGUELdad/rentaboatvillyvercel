"use client";

import { useEffect, useRef, type RefObject } from "react";
import { playFeedback } from "@/lib/feedback";

type SnapScrollOptions = {
  onSnap?: (index: number) => void;
  /** Play light tap SFX when snap index changes. */
  feedback?: boolean;
};

export function useHorizontalSnapScroll(
  containerRef: RefObject<HTMLElement | null>,
  options: SnapScrollOptions = {},
) {
  const { onSnap, feedback = false } = options;
  const prevIndex = useRef(-1);
  const onSnapRef = useRef(onSnap);
  onSnapRef.current = onSnap;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let raf = 0;

    const resolveIndex = () => {
      if (el.children.length === 0) return;
      const center = el.scrollLeft + el.clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;

      Array.from(el.children).forEach((child, i) => {
        const c = child as HTMLElement;
        const childCenter = c.offsetLeft + c.offsetWidth / 2;
        const dist = Math.abs(center - childCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });

      if (closest !== prevIndex.current) {
        prevIndex.current = closest;
        onSnapRef.current?.(closest);
        if (feedback) playFeedback("scroll-snap", "none");
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(resolveIndex);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    resolveIndex();

    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [containerRef, feedback]);
}
