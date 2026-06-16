"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SiteIcon } from "@/components/ui/SiteIcon";
import { playFeedback } from "@/lib/feedback";
import { appleSpringSoft, homeScrollViewport } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/LanguageProvider";

const links = [
  { href: "/fleet", icon: "fleet" as const, primary: false },
  { href: "/booking", icon: "booking" as const, primary: true },
  { href: "/map", icon: "map" as const, primary: false },
  { href: "/guide", icon: "guide" as const, primary: false },
] as const;

const labelKeys: Record<(typeof links)[number]["icon"], string> = {
  fleet: "fleet",
  map: "routes",
  guide: "guide",
  booking: "booking",
};

function QuickNavPill({
  href,
  icon,
  primary,
  label,
  duplicate = false,
}: {
  href: string;
  icon: (typeof links)[number]["icon"];
  primary: boolean;
  label: string;
  duplicate?: boolean;
}) {
  return (
    <Link
      href={href}
      data-sfx-skip
      tabIndex={duplicate ? -1 : undefined}
      aria-hidden={duplicate || undefined}
      onClick={() => playFeedback(primary ? "navigate" : "select", "light")}
      className={cn(
        "home-start-pill tap-target tap-target--pill group",
        primary && "home-start-pill--primary",
        duplicate && "home-start-pill--clone",
      )}
    >
      <SiteIcon name={icon} size={16} className="shrink-0" aria-hidden />
      <span className="min-w-0 text-balance leading-tight">{label}</span>
      {primary && (
        <ArrowRight
          className="size-3.5 shrink-0 opacity-80 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      )}
    </Link>
  );
}

export function HomeQuickNav() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const quickNav = t.home.quickNav ?? {};

  const items = links.map(({ href, icon, primary }) => ({
    href,
    icon,
    primary,
    label: t.nav[labelKeys[icon] as keyof typeof t.nav],
  }));

  const label = quickNav.label ?? "Jump to";
  const ariaLabel = quickNav.ariaLabel ?? "Quick navigation";
  const Nav = reduceMotion ? "nav" : motion.nav;
  const motionProps = !reduceMotion
    ? {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: homeScrollViewport,
        transition: appleSpringSoft,
      }
    : {};

  return (
    <>
      <Nav
        aria-label={ariaLabel}
        className="home-start-dock home-start-dock--mobile relative z-20 lg:hidden"
        {...motionProps}
      >
        <p className="home-start-dock__label">{label}</p>
        <div className="home-start-dock__viewport pb-3">
          <div className="home-start-dock__track" aria-hidden={false}>
            {items.map((item) => (
              <QuickNavPill key={`a-${item.href}`} {...item} />
            ))}
            {items.map((item) => (
              <QuickNavPill key={`b-${item.href}`} {...item} duplicate />
            ))}
          </div>
        </div>
      </Nav>

      <motion.nav
        aria-label={ariaLabel}
        className="home-start-dock home-start-dock--desktop relative z-20 hidden lg:block"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={homeScrollViewport}
        transition={appleSpringSoft}
      >
        <p className="home-start-dock__label">{label}</p>
        <div className="home-start-dock__chips">
          {items.map((item) => (
            <QuickNavPill key={item.href} {...item} />
          ))}
        </div>
      </motion.nav>
    </>
  );
}
