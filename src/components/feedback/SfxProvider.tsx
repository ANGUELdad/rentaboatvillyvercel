"use client";

import { useEffect } from "react";
import { playFeedback } from "@/lib/feedback";
import { isSfxName, type SfxName } from "@/lib/sfx";

const TAP_SELECTOR = [
  "button",
  "a[href]",
  '[role="button"]',
  ".tap-target",
  '[class*="btn-app-"]',
  ".btn-glass",
  ".btn-chip",
  'input[type="submit"]',
].join(", ");

const DEBOUNCE_MS = 120;

function shouldSkipTarget(target: HTMLElement): boolean {
  if (target.closest("[data-sfx-skip]")) return true;

  const typing = target.closest(
    'input:not([type="submit"]):not([type="button"]):not([type="reset"]), textarea, [contenteditable="true"], select',
  );
  if (typing) return true;

  return false;
}

function matchesTapTarget(target: HTMLElement): HTMLElement | null {
  const el = target.closest(TAP_SELECTOR);
  if (!el || !(el instanceof HTMLElement)) return null;
  if (shouldSkipTarget(el)) return null;
  return el;
}

function resolveSfx(el: HTMLElement): SfxName {
  const custom = el.getAttribute("data-sfx");
  if (custom && isSfxName(custom)) return custom;

  if (
    el.matches(
      ".btn-app-primary, .home-start-pill--primary, .hero-booking-mini__cta, [data-sfx-primary]",
    )
  ) {
    return "select";
  }

  if (el.matches("a[href]")) return "navigate";

  return "tap";
}

export function SfxProvider() {
  useEffect(() => {
    let lastAt = 0;

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest) return;

      const el = matchesTapTarget(target);
      if (!el) return;

      const now = Date.now();
      if (now - lastAt < DEBOUNCE_MS) return;
      lastAt = now;

      playFeedback(resolveSfx(el), "light");
    };

    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
