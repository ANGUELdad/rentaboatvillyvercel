"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Clears stray overflow locks from sheets/menus so the page always scrolls on desktop */
export function ScrollUnlock() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.style.overflow = "";
    root.style.overscrollBehavior = "";
    body.style.overflow = "";
    body.style.position = "";
    body.style.top = "";
    body.style.width = "";
  }, [pathname]);

  return null;
}
