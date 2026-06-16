"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const QUERY = "(max-width: 639px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * Returns false until after mount (SSR-safe), then the real breakpoint.
 * Avoids hydration mismatch while still updating quickly on resize.
 */
export function useIsMobile() {
  const [hydrated, setHydrated] = useState(false);
  const matches = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated && matches;
}
