"use client";

import { ArrowRight, Ship, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, type CSSProperties } from "react";
import { SafeImage } from "@/components/SafeImage";
import { appleSpringSoft, homeScrollViewport, staggerStep } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/LanguageProvider";
import type { PublicBoat } from "@/types";

const PREVIEW_COUNT = 4;

const TIER_LINKS = [
  { id: "flagship", pax: 9, icon: Ship, key: "flagship" as const },
  { id: "premium-group", pax: 8, icon: Users, key: "premium" as const },
] as const;

const FALLBACK = {
  badge: "8 boats · Limenaria",
  title: "Find the right boat for your crew",
  subtitle: "Compare photos, capacity, and specs — then book your day on the water.",
  chip1: "Up to 9 seats",
  chip2: "No licence ≤30HP",
  chip3: "Safety briefing included",
  cta: "Explore full fleet",
  ctaHint: "See every boat & detail",
  ariaLabel: "Fleet preview banner",
  paxLabel: "{count} seats",
  tiersAria: "Browse by capacity",
  tiers: {
    flagship: { label: "9 seats", hint: "Largest groups" },
    premium: { label: "8 seats", hint: "Medium groups" },
  },
} as const;

interface HomeFleetTeaserProps {
  boats: PublicBoat[];
  className?: string;
}

function formatCopy(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function HomeFleetTeaser({ boats, className = "" }: HomeFleetTeaserProps) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const copy = { ...FALLBACK, ...(t.home?.fleetTeaser ?? {}) };
  const tiersCopy = { ...FALLBACK.tiers, ...copy.tiers };

  const previewBoats = useMemo(() => {
    const featured = boats.filter((b) => b.featured);
    const pool = featured.length >= 2 ? featured : boats;
    return pool.slice(0, PREVIEW_COUNT);
  }, [boats]);

  const tierLinks = useMemo(() => {
    const byPax = new Map<number, number>();
    for (const boat of boats) {
      byPax.set(boat.pax, (byPax.get(boat.pax) ?? 0) + 1);
    }
    return TIER_LINKS.filter((tier) => (byPax.get(tier.pax) ?? 0) > 0).map((tier) => ({
      ...tier,
      count: byPax.get(tier.pax) ?? 0,
      copy: tiersCopy[tier.key],
    }));
  }, [boats, tiersCopy]);

  if (boats.length === 0) return null;

  const chips = [copy.chip1, copy.chip2, copy.chip3].filter(Boolean);
  const paxLabel = copy.paxLabel ?? FALLBACK.paxLabel;
  const Root = reduceMotion ? "section" : motion.section;
  const rootProps = !reduceMotion
    ? {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: homeScrollViewport,
        transition: appleSpringSoft,
      }
    : {};

  return (
    <Root
      id="home-fleet"
      className={cn("home-fleet-banner", className)}
      aria-labelledby="home-fleet-title"
      {...rootProps}
    >
      <div className="home-fleet-banner__glow" aria-hidden />
      <div className="home-fleet-banner__shimmer" aria-hidden />

      <div className="home-fleet-banner__inner">
        <div className="home-fleet-banner__copy">
          <span className="home-fleet-banner__badge">
            <Ship className="size-3.5 shrink-0" aria-hidden />
            {copy.badge}
          </span>
          <h2 id="home-fleet-title" className="home-fleet-banner__title text-balance">
            {copy.title}
          </h2>
          <p className="home-fleet-banner__subtitle text-pretty">{copy.subtitle}</p>

          {chips.length > 0 ? (
            <ul className="home-fleet-banner__chips" aria-label={copy.ariaLabel}>
              {chips.map((chip) => (
                <li key={chip} className="home-fleet-banner__chip">
                  <Sparkles className="size-3 shrink-0 opacity-70" aria-hidden />
                  {chip}
                </li>
              ))}
            </ul>
          ) : null}

          {tierLinks.length > 0 ? (
            <div
              className="home-fleet-banner__tiers"
              role="list"
              aria-label={copy.tiersAria ?? FALLBACK.tiersAria}
            >
              {tierLinks.map((tier) => {
                const TierIcon = tier.icon;
                return (
                  <Link
                    key={tier.id}
                    href={`/fleet#${tier.id}`}
                    role="listitem"
                    className="home-fleet-banner__tier tap-target group"
                  >
                    <span className="home-fleet-banner__tier-icon" aria-hidden>
                      <TierIcon className="size-4" strokeWidth={2.2} />
                    </span>
                    <span className="home-fleet-banner__tier-copy">
                      <span className="home-fleet-banner__tier-label">{tier.copy.label}</span>
                      <span className="home-fleet-banner__tier-hint">{tier.copy.hint}</span>
                    </span>
                    <ArrowRight
                      className="home-fleet-banner__tier-arrow size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="home-fleet-banner__showcase">
          <p className="home-fleet-banner__showcase-label">{copy.ariaLabel}</p>
          <div className="home-fleet-banner__preview" role="list" aria-label={copy.ariaLabel}>
            {previewBoats.map((boat, index) => {
              const Item = reduceMotion ? "div" : motion.div;
              const itemProps = !reduceMotion
                ? {
                    initial: { opacity: 0, y: 14, scale: 0.96 },
                    whileInView: { opacity: 1, y: 0, scale: 1 },
                    viewport: homeScrollViewport,
                    transition: { ...appleSpringSoft, delay: 0.1 + index * staggerStep },
                  }
                : {};

              return (
                <Item
                  key={boat.id}
                  role="listitem"
                  className="home-fleet-banner__boat"
                  style={{ "--fleet-card-i": index } as CSSProperties}
                  {...itemProps}
                >
                  <Link
                    href={`/fleet/${boat.id}`}
                    className="home-fleet-banner__boat-link tap-target group"
                    aria-label={boat.name}
                  >
                    <div className="home-fleet-banner__boat-media">
                      <SafeImage
                        src={boat.image}
                        alt=""
                        fill
                        sizes="(max-width: 639px) 38vw, 140px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="home-fleet-banner__boat-scrim" aria-hidden />
                      <span className="home-fleet-banner__boat-meta">
                        <span className="home-fleet-banner__boat-name">{boat.name}</span>
                        <span className="home-fleet-banner__boat-pax">
                          {formatCopy(paxLabel, { count: boat.pax })}
                        </span>
                      </span>
                    </div>
                  </Link>
                </Item>
              );
            })}
          </div>

          <Link href="/fleet" className="home-fleet-banner__cta tap-target group">
            <span className="home-fleet-banner__cta-label">{copy.cta}</span>
            <ArrowRight
              className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
            <span className="home-fleet-banner__cta-hint">{copy.ctaHint}</span>
          </Link>
        </div>
      </div>
    </Root>
  );
}
