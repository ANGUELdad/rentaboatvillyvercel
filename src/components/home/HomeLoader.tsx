"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { BrandSplash } from "@/components/layout/BrandSplash";
import { playFeedback } from "@/lib/feedback";
import { appleSpringSoft } from "@/lib/motion";
import { Z } from "@/lib/z-index";

const MIN_VISIBLE_MS = 380;
const MAX_VISIBLE_MS = 3200;

interface HomeLoaderProps {
  /** When true, begin fade-out */
  ready?: boolean;
}

export function HomeLoader({ ready = false }: HomeLoaderProps) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready || !minElapsed) return;
    const t = window.setTimeout(() => {
      setVisible(false);
      playFeedback("success", "none");
    }, 120);
    return () => window.clearTimeout(t);
  }, [ready, minElapsed]);

  useEffect(() => {
    const failSafe = window.setTimeout(() => setVisible(false), MAX_VISIBLE_MS);
    return () => window.clearTimeout(failSafe);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="home-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduceMotion ? { duration: 0.12 } : { duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
          className="home-loader-overlay fixed inset-0 flex flex-col items-center justify-center bg-ds-elevated px-6"
          style={{ zIndex: Z.pageTransition + 2 }}
          role="status"
          aria-live="polite"
          aria-busy={visible}
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={appleSpringSoft}
            className="home-loader-overlay__inner flex max-w-sm flex-col items-center text-center"
          >
            <BrandSplash size="xl" className="mx-auto" />
            <motion.div
              aria-hidden
              className="home-loader-overlay__bar mt-8 h-0.5 w-32 overflow-hidden rounded-full bg-ds-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="home-loader-overlay__bar-fill block h-full w-1/2 rounded-full bg-ds-brand" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
