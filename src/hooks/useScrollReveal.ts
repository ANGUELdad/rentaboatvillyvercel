"use client";

import { useEffect, useRef, type RefObject } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type ScrollRevealOptions = IntersectionObserverInit & {
  /** Class applied when the element enters the viewport. */
  visibleClass?: string;
};

export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: ScrollRevealOptions = {},
): RefObject<T | null> {
  const {
    visibleClass = "is-visible",
    root = null,
    rootMargin = "-48px 0px",
    threshold = 0.08,
  } = options;
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.classList.add(visibleClass);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add(visibleClass);
          observer.disconnect();
        }
      },
      { root, rootMargin, threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced, visibleClass, root, rootMargin, threshold]);

  return ref;
}
