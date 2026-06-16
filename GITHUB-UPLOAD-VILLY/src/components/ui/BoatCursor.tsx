"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

const CURSOR_KEY = "tbc-boat-cursor-disabled";
const BODY_CLASS = "boat-cursor-active";
const LERP = 0.6;
const SETTLE_EPSILON = 0.25;

const CLICKABLE =
  'a, button, [role="button"], input, select, textarea, label[for], summary, [tabindex]:not([tabindex="-1"])';

export function isBoatCursorDisabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    /* Off by default — only enable when user explicitly opts in (CURSOR_KEY === "0") */
    return localStorage.getItem(CURSOR_KEY) !== "0";
  } catch {
    return true;
  }
}

export function setBoatCursorDisabled(disabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (disabled) localStorage.removeItem(CURSOR_KEY);
    else localStorage.setItem(CURSOR_KEY, "0");
    window.dispatchEvent(new CustomEvent("tbc-boat-cursor-change"));
  } catch {
    /* ignore */
  }
}

function isFinePointer() {
  return window.matchMedia("(pointer: fine)").matches;
}

type AppliedState = {
  ox: number;
  oy: number;
  tilt: number;
  scale: number;
  visible: boolean;
  clickable: boolean;
};

export function BoatCursor() {
  const reduced = usePrefersReducedMotion();
  const [enabled, setEnabled] = useState(false);

  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const wakeRef = useRef<HTMLSpanElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });
  const tilt = useRef(0);
  const last = useRef({ x: 0, y: 0 });
  const overClickable = useRef(false);
  const visible = useRef(false);
  const rafId = useRef(0);
  const loopActive = useRef(false);
  const pendingMove = useRef<MouseEvent | null>(null);
  const applied = useRef<AppliedState>({
    ox: NaN,
    oy: NaN,
    tilt: NaN,
    scale: NaN,
    visible: false,
    clickable: false,
  });

  useEffect(() => {
    const evaluate = () => {
      const active = isFinePointer() && !isBoatCursorDisabled() && !reduced;
      setEnabled(active);
      document.body.classList.toggle(BODY_CLASS, active);
    };

    evaluate();
    window.addEventListener("tbc-boat-cursor-change", evaluate);

    const pointerMq = window.matchMedia("(pointer: fine)");
    pointerMq.addEventListener("change", evaluate);

    return () => {
      window.removeEventListener("tbc-boat-cursor-change", evaluate);
      pointerMq.removeEventListener("change", evaluate);
      document.body.classList.remove(BODY_CLASS);
    };
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return;

    const applyDom = () => {
      const outer = outerRef.current;
      const inner = innerRef.current;
      const wake = wakeRef.current;
      const a = applied.current;

      if (outer) {
        if (a.ox !== current.current.x || a.oy !== current.current.y) {
          outer.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
          a.ox = current.current.x;
          a.oy = current.current.y;
        }
        if (a.visible !== visible.current) {
          outer.style.opacity = visible.current ? "1" : "0";
          outer.style.visibility = visible.current ? "visible" : "hidden";
          a.visible = visible.current;
        }
      }

      if (inner) {
        const scale = overClickable.current ? 1.18 : 1;
        if (a.tilt !== tilt.current || a.scale !== scale) {
          inner.style.transform = `translate(-50%, -58%) rotate(${tilt.current}deg) scale(${scale})`;
          a.tilt = tilt.current;
          a.scale = scale;
        }
      }

      if (wake && a.clickable !== overClickable.current) {
        wake.style.opacity = overClickable.current ? "1" : "0";
        a.clickable = overClickable.current;
      }
    };

    const processMove = (e: MouseEvent) => {
      const dx = e.clientX - last.current.x;
      last.current = { x: e.clientX, y: e.clientY };

      target.current = { x: e.clientX, y: e.clientY };
      tilt.current = Math.max(-18, Math.min(18, dx * 0.35));
      visible.current = true;

      const el = e.target as Element | null;
      overClickable.current = Boolean(el?.closest(CLICKABLE));
    };

    const tick = () => {
      if (!loopActive.current) return;

      if (pendingMove.current) {
        processMove(pendingMove.current);
        pendingMove.current = null;
      }

      let animating = false;

      if (document.visibilityState !== "hidden") {
        const dx = target.current.x - current.current.x;
        const dy = target.current.y - current.current.y;

        if (Math.abs(dx) > SETTLE_EPSILON || Math.abs(dy) > SETTLE_EPSILON) {
          current.current.x += dx * LERP;
          current.current.y += dy * LERP;
          animating = true;
        } else if (dx !== 0 || dy !== 0) {
          current.current.x = target.current.x;
          current.current.y = target.current.y;
        }

        applyDom();
      }

      if (animating || pendingMove.current) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        loopActive.current = false;
      }
    };

    const startLoop = () => {
      if (loopActive.current) return;
      loopActive.current = true;
      rafId.current = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      pendingMove.current = e;
      startLoop();
    };

    const onLeave = () => {
      visible.current = false;
      startLoop();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      loopActive.current = false;
      cancelAnimationFrame(rafId.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={outerRef}
      aria-hidden
      className={cn(
        "boat-cursor pointer-events-none fixed top-0 left-0 z-[300]",
      )}
      style={{ opacity: 0, visibility: "hidden" }}
    >
      <div ref={innerRef} className="boat-cursor-inner">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]"
        >
          <path
            d="M10 2v15"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M7 22a4 4 0 0 1-4-4 1 1 0 0 1 1-1h16a1 1 0 0 1 1 1 4 4 0 0 1-4 4z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.159 2.46a1 1 0 0 1 1.521-.193l9.977 8.98A1 1 0 0 1 20 13H4a1 1 0 0 1-.824-1.567z"
            fill="currentColor"
            fillOpacity="0.85"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
        <span
          ref={wakeRef}
          className="boat-cursor-wake absolute top-[88%] left-1/2 h-1 w-3 -translate-x-1/2 rounded-full bg-ds-brand/40 opacity-0 blur-[2px]"
        />
      </div>
    </div>
  );
}
