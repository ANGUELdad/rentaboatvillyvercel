"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Z } from "@/lib/z-index";

const MIN_VISIBLE_MS = 520;
const MAX_VISIBLE_MS = 2600;

function isInternalNavLink(el: Element, pathname: string): boolean {
  if (!(el instanceof HTMLAnchorElement)) return false;
  const href = el.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  if (el.target === "_blank" || el.hasAttribute("download")) return false;

  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return false;
    const samePath =
      url.pathname === pathname &&
      url.search === window.location.search &&
      !url.hash;
    return !samePath;
  } catch {
    return href.startsWith("/") && href !== pathname;
  }
}

export function PageTransition() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const isFirst = useRef(true);
  const showStarted = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (maxTimer.current) {
      clearTimeout(maxTimer.current);
      maxTimer.current = null;
    }
  }, []);

  const beginTransition = useCallback(() => {
    clearTimers();
    showStarted.current = Date.now();
    setVisible(true);

    maxTimer.current = setTimeout(() => {
      setVisible(false);
    }, MAX_VISIBLE_MS);
  }, [clearTimers]);

  const finishTransition = useCallback(() => {
    const elapsed = Date.now() - showStarted.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

    clearTimers();
    hideTimer.current = setTimeout(() => {
      setVisible(false);
    }, wait);

    maxTimer.current = setTimeout(() => {
      setVisible(false);
    }, wait + 400);
  }, [clearTimers]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.("a");
      if (!link || !isInternalNavLink(link, pathname)) return;
      beginTransition();
    };

    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [pathname, beginTransition]);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    beginTransition();
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        finishTransition();
      });
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [pathname, beginTransition, finishTransition]);

  useEffect(() => {
    const root = document.documentElement;
    if (visible) {
      root.dataset.pageTransition = "true";
    } else {
      delete root.dataset.pageTransition;
    }
    return () => {
      delete root.dataset.pageTransition;
    };
  }, [visible]);

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <>
      <AnimatePresence>
        {visible && !reduceMotion ? (
          <motion.div
            key="site-page-transition"
            className="site-page-transition"
            style={{ zIndex: Z.pageTransition }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          >
            <div className="site-page-transition__veil" />
            <motion.div
              className="site-page-transition__logo-wrap"
              initial={{ opacity: 0, scale: 0.78, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -6 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="site-page-transition__ring" aria-hidden />
              <span
                className="site-page-transition__ring site-page-transition__ring--delay"
                aria-hidden
              />
              <Logo linked={false} className="site-logo--transition" />
            </motion.div>
            <div className="site-page-transition__bar" aria-hidden>
              <span className="site-page-transition__bar-fill" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {visible && reduceMotion ? (
        <div
          className="ui-2026-transition-bar"
          style={{ zIndex: Z.pageTransition }}
          aria-hidden
        />
      ) : null}
    </>
  );
}
