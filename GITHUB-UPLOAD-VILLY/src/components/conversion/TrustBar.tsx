"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Shield, MapPin, Clock, BadgeCheck } from "lucide-react";
import { appleSpringSoft, staggerStep } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/LanguageProvider";

const ICONS = [BadgeCheck, MapPin, Clock, Shield] as const;

interface TrustBarProps {
  className?: string;
  compact?: boolean;
  animated?: boolean;
  baseDelay?: number;
  /** Light text + chip styling for hero video backgrounds */
  onVideo?: boolean;
}

export function TrustBar({
  className = "",
  compact = false,
  animated = false,
  baseDelay = 0,
  onVideo = false,
}: TrustBarProps) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const c = t.conversion?.trust ?? {};
  const items = [c.licensed, c.marina, c.response, c.noFees].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <ul
      className={cn(
        "w-full max-w-full min-w-0",
        onVideo
          ? "hero-trust-bar hero-trust-bar--grid"
          : cn("trust-bar-grid", compact && "gap-x-3 gap-y-2"),
        className,
      )}
      aria-label={c.ariaLabel ?? "Trust indicators"}
    >
      {items.map((label, i) => {
        const Icon = ICONS[i] ?? Shield;
        const itemClass = cn(
          "flex min-w-0 items-center gap-1.5",
          compact ? "text-[11px]" : "text-xs",
          onVideo ? "hero-trust-bar__item" : "text-ds-text-secondary",
        );

        if (animated && !reduceMotion) {
          return (
            <motion.li
              key={label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...appleSpringSoft, delay: baseDelay + i * staggerStep }}
              className={itemClass}
            >
              <Icon
                className={`shrink-0 text-ds-brand ${compact ? "size-3.5" : "size-4"}`}
                aria-hidden
              />
              <span className="min-w-0 text-balance leading-snug">{label}</span>
            </motion.li>
          );
        }

        return (
          <li key={label} className={itemClass}>
            <Icon
              className={`shrink-0 text-ds-brand ${compact ? "size-3.5" : "size-4"}`}
              aria-hidden
            />
            <span className="min-w-0 text-balance leading-snug">{label}</span>
          </li>
        );
      })}
    </ul>
  );
}
