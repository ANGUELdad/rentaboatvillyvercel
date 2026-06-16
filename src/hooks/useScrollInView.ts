"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";
import { homeScrollViewport } from "@/lib/motion";

type ViewportOptions = typeof homeScrollViewport;

/** Reliable scroll reveal — useInView drives animate, avoiding stuck opacity:0. */
export function useScrollInView(viewport: ViewportOptions = homeScrollViewport) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, {
    once: viewport.once ?? true,
    amount: viewport.amount ?? 0.12,
    margin: viewport.margin ?? "0px 0px -12% 0px",
  });

  return { ref, isInView };
}
