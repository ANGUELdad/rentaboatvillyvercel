"use client";

import Link from "next/link";
import { useCallback, type MouseEvent } from "react";
import { VillyMarkIcon } from "@/components/brand/VillyMarkIcon";
import { cn } from "@/lib/utils";

export const LOGO_SRC = "/brand/villy-logo.png";
export const LOGO_ALT = "Rent A Boat Villy";
export const LOGO_WIDTH = 882;
export const LOGO_HEIGHT = 779;

interface LogoProps {
  className?: string;
  linked?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "header";
}

const sizeClasses = {
  xs: "site-logo site-logo--xs",
  sm: "site-logo site-logo--sm",
  md: "site-logo site-logo--md",
  lg: "site-logo site-logo--lg",
  xl: "site-logo site-logo--xl",
  header: "site-logo site-logo--header",
} as const;

function homeHref(): string {
  if (typeof window === "undefined") return "/";
  const lang = new URLSearchParams(window.location.search).get("lang");
  return lang && lang !== "en" ? `/?lang=${lang}` : "/";
}

/** Clear scroll locks / overlays so home loads at the true top. */
function clearPageLocks() {
  const root = document.documentElement;
  const body = document.body;

  delete root.dataset.mobileNavOpen;
  delete root.dataset.pageTransition;
  root.style.overflow = "";
  root.style.overscrollBehavior = "";
  body.style.overflow = "";
  body.style.position = "";
  body.style.top = "";
  body.style.width = "";
}

function scrollHomeToTop() {
  clearPageLocks();
  const target = homeHref();

  if (window.location.hash || `${window.location.pathname}${window.location.search}` !== target) {
    window.history.replaceState(window.history.state, "", target);
  }

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function Logo({
  className,
  linked = true,
  size = "md",
}: LogoProps) {
  const handleLogoClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    const target = homeHref();
    const current = `${window.location.pathname}${window.location.search}`;

    if (current === target || current === `${target}#` || window.location.hash) {
      event.preventDefault();
      scrollHomeToTop();
    }
  }, []);

  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- transparent brand PNG
    <img
      src={LOGO_SRC}
      alt={LOGO_ALT}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      className={cn(sizeClasses[size], className)}
      decoding="async"
      fetchPriority={size === "lg" || size === "xl" || size === "header" ? "high" : undefined}
    />
  );

  const rootClass = cn(
    "group inline-flex max-w-full shrink-0 items-center overflow-hidden",
    linked && "transition-transform duration-300 hover:scale-[1.02]",
  );

  if (linked) {
    return (
      <Link
        href="/"
        className={rootClass}
        onClick={handleLogoClick}
        aria-label={`${LOGO_ALT}, home`}
      >
        {image}
      </Link>
    );
  }

  return (
    <span className={rootClass} role="img" aria-label={LOGO_ALT}>
      {image}
    </span>
  );
}

/** Square boat mark — for avatars, cookie banner, compact brand contexts */
export function LogoMark({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <VillyMarkIcon
      size={size}
      className={cn("text-brand-green", className)}
    />
  );
}
