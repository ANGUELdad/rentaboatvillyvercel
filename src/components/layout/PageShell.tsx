"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SafeImage } from "@/components/SafeImage";
import { appleEase } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type PageAccent = "cyan" | "coral" | "gold" | "turquoise" | "violet" | "emerald";

const accentStyles: Record<
  PageAccent,
  { orb: string; border: string; label: string; glow: string; chip: string }
> = {
  cyan: {
    orb: "bg-ds-focus/15",
    border: "border-ds-focus/25",
    label: "text-ds-focus",
    glow: "page-shell__glow--cyan",
    chip: "page-shell__eyebrow-chip--cyan",
  },
  coral: {
    orb: "bg-summer-coral/20",
    border: "border-summer-coral/25",
    label: "text-summer-coral",
    glow: "page-shell__glow--coral",
    chip: "page-shell__eyebrow-chip--coral",
  },
  gold: {
    orb: "bg-summer-gold/15",
    border: "border-summer-gold/25",
    label: "text-summer-gold",
    glow: "page-shell__glow--gold",
    chip: "page-shell__eyebrow-chip--gold",
  },
  turquoise: {
    orb: "bg-ds-focus/15",
    border: "border-ds-focus/25",
    label: "text-ds-focus",
    glow: "page-shell__glow--cyan",
    chip: "page-shell__eyebrow-chip--cyan",
  },
  violet: {
    orb: "bg-violet-400/12",
    border: "border-violet-400/20",
    label: "text-violet-300",
    glow: "page-shell__glow--violet",
    chip: "page-shell__eyebrow-chip--violet",
  },
  emerald: {
    orb: "bg-ds-brand/15",
    border: "border-ds-brand/25",
    label: "text-ds-brand",
    glow: "page-shell__glow--emerald",
    chip: "page-shell__eyebrow-chip--emerald",
  },
};

export interface PageShellStat {
  label: string;
  value: string;
  icon?: LucideIcon;
}

interface PageShellProps {
  accent: PageAccent;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  eyebrowIcon?: LucideIcon;
  heroImages?: string[];
  visualBadge?: string;
  visualBadgeIcon?: LucideIcon;
  stats?: PageShellStat[];
}

export function PageShell({
  accent,
  eyebrow,
  title,
  subtitle,
  children,
  eyebrowIcon,
  heroImages,
  visualBadge,
  visualBadgeIcon,
  stats,
}: PageShellProps) {
  const reduceMotion = useReducedMotion();
  const pageEnter = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.22, ease: appleEase },
      };
  const style = accentStyles[accent];
  const previewImages = heroImages?.filter(Boolean).slice(0, 3) ?? [];
  const hasVisual = previewImages.length > 0;
  const EyebrowIcon = eyebrowIcon;
  const BadgeIcon = visualBadgeIcon;

  return (
    <div className="ui-2026-page ui-2026-ambient relative pb-16">
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-20 right-0 size-80 rounded-full blur-[100px] ${style.orb}`}
      />
      <div
        aria-hidden
        className={cn(
          "ui-2026-orb-drift pointer-events-none absolute -bottom-16 -left-12 size-64 rounded-full blur-[90px]",
          style.orb,
        )}
      />

      <div className="relative mx-auto w-full max-w-7xl min-w-0 box-border px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <motion.header
          {...pageEnter}
          className={cn(
            "page-shell__header glass-panel ui-2026-surface layout-safe panel-fit relative mb-10 min-w-0 overflow-hidden rounded-2xl sm:mb-14",
            style.border,
          )}
        >
          <div aria-hidden className={cn("page-shell__glow", style.glow)} />
          <div
            className={cn(
              "page-shell__hero relative z-[1]",
              hasVisual && "page-shell__hero--visual",
            )}
          >
            <div className="page-shell__copy min-w-0">
              <p
                className={cn(
                  "page-shell__eyebrow-chip ui-eyebrow section-eyebrow mb-3",
                  style.chip,
                  style.label,
                )}
              >
                {EyebrowIcon && (
                  <span className="page-shell__eyebrow-icon" aria-hidden>
                    <EyebrowIcon className="size-3.5" strokeWidth={2.25} />
                  </span>
                )}
                <span>{eyebrow}</span>
              </p>
              <h1 className="ui-section-title heading-fit text-2xl font-semibold tracking-tight text-ds-text sm:text-3xl md:text-4xl">
                {title}
              </h1>
              {subtitle && (
                <p className="page-shell__subtitle body-fit mt-3 max-w-2xl text-base leading-relaxed text-ds-text-secondary sm:mt-4">
                  {subtitle}
                </p>
              )}
              {stats && (
                <div className="page-shell__stats">
                  {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={`${s.label}-${s.value}`} className="page-shell__stat glass-subtle">
                        {Icon && (
                          <span className={cn("page-shell__stat-icon", style.label)} aria-hidden>
                            <Icon className="size-4" strokeWidth={2.25} />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className={cn("page-shell__stat-value", style.label)}>{s.value}</p>
                          <p className="page-shell__stat-label">{s.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {hasVisual && (
              <div className="page-shell__visual" aria-hidden>
                <div className="page-shell__visual-stack">
                  {previewImages.map((src, i) => (
                    <div
                      key={`${src}-${i}`}
                      className={cn(
                        "page-shell__visual-frame",
                        `page-shell__visual-frame--${i}`,
                      )}
                    >
                      <SafeImage
                        src={src}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 28vw, 160px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                {visualBadge && (
                  <div className={cn("page-shell__visual-badge", style.label)}>
                    {BadgeIcon && <BadgeIcon className="size-3.5" strokeWidth={2.25} />}
                    <span>{visualBadge}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.header>

        {reduceMotion ? (
          <div>{children}</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: appleEase, delay: 0.03 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
}
