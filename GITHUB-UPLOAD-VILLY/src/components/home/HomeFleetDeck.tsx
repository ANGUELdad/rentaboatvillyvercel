"use client";

import {
  ArrowRight,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { SafeImage } from "@/components/SafeImage";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { ScrollReveal, ScrollRevealItem } from "@/components/ui/ScrollReveal";
import { appleSpringSoft } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/LanguageProvider";
import type { PublicBoat } from "@/types";

interface HomeFleetDeckProps {
  boats: PublicBoat[];
  className?: string;
}

function sortFleet(boats: PublicBoat[]) {
  return [...boats].sort((a, b) => {
    if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
    return b.pax - a.pax;
  });
}

function groupByCapacity(boats: PublicBoat[]) {
  const tiers: { pax: number; boats: PublicBoat[] }[] = [];
  for (const boat of boats) {
    const existing = tiers.find((t) => t.pax === boat.pax);
    if (existing) existing.boats.push(boat);
    else tiers.push({ pax: boat.pax, boats: [boat] });
  }
  return tiers.sort((a, b) => b.pax - a.pax);
}

function FleetSpecChips({
  boat,
  labels,
  variant = "overlay",
}: {
  boat: PublicBoat;
  labels: { noLicense: string; guestsCount: string };
  variant?: "overlay" | "inline";
}) {
  const noLicense = boat.amenities?.some((a) => a.id === "no-license");

  return (
    <div
      className={cn(
        "fleet-deck-2026__chips",
        variant === "overlay" && "fleet-deck-2026__chips--overlay",
        variant === "inline" && "fleet-deck-2026__chips--inline",
      )}
    >
      <span className="fleet-deck-2026__chip">
        <Users className="size-3.5 shrink-0 opacity-80" aria-hidden />
        {labels.guestsCount.replace("{count}", String(boat.pax))}
      </span>
      {noLicense ? (
        <span className="fleet-deck-2026__chip fleet-deck-2026__chip--brand">
          <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
          {labels.noLicense}
        </span>
      ) : null}
    </div>
  );
}

function FleetDeckCard({
  boat,
  labels,
  variant = "grid",
  showPopularBadge = false,
}: {
  boat: PublicBoat;
  labels: {
    noLicense: string;
    mostPopular: string;
    viewVessel: string;
    bookCta: string;
    guestsCount: string;
  };
  variant?: "grid" | "hero";
  showPopularBadge?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const isHero = variant === "hero";
  const sourceFields = useMemo(
    () => ({
      name: boat.name,
      tagline: boat.tagline ?? "",
      description: boat.longDescription ?? boat.description ?? "",
    }),
    [boat.name, boat.tagline, boat.longDescription, boat.description],
  );
  const localized = useTranslatedContent(sourceFields, "card_desc");

  return (
    <motion.article
      className={cn(
        "fleet-deck-2026__card fleet-garage-card fleet-card-flex",
        isHero && "fleet-deck-2026__card--hero",
      )}
      whileHover={reduceMotion ? undefined : { y: isHero ? -4 : -5 }}
      transition={appleSpringSoft}
    >
      <Link
        href={`/fleet/${boat.id}`}
        className={cn(
          "fleet-deck-2026__media fleet-garage-card__media tap-target group",
          isHero && "fleet-deck-2026__media--hero",
        )}
      >
        <SafeImage
          src={boat.image}
          alt={localized.name}
          fill
          sizes={
            isHero
              ? "(max-width: 1023px) 100vw, 52vw"
              : "(max-width: 767px) 74vw, (max-width: 1279px) 33vw, 22vw"
          }
          className="fleet-garage-card__image object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <div className="fleet-deck-2026__media-scrim" aria-hidden />
        {showPopularBadge ? (
          <span className="fleet-deck-2026__badge">{labels.mostPopular}</span>
        ) : null}
        <FleetSpecChips boat={boat} labels={labels} variant="overlay" />
      </Link>

      <div className="fleet-deck-2026__panel">
        <div className="fleet-deck-2026__panel-top">
          <div className="min-w-0">
            {localized.tagline ? (
              <p className="fleet-deck-2026__tag card-text text-pretty">
                {localized.tagline}
              </p>
            ) : null}
            <h3 className="fleet-deck-2026__name card-text">
              <Link href={`/fleet/${boat.id}`} className="tap-target">
                {localized.name}
              </Link>
            </h3>
            {isHero && localized.description ? (
              <p className="fleet-deck-2026__blurb text-pretty">
                {localized.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="fleet-deck-2026__actions">
          <Link
            href={`/fleet/${boat.id}`}
            className="btn-glass ui-btn-label tap-target fleet-deck-2026__btn"
          >
            {labels.viewVessel}
          </Link>
          <Link
          href={`/package?boat=${boat.id}`}
          className="btn-app-primary ui-btn-label tap-target fleet-deck-2026__btn hero-cta-shimmer"
        >
            {labels.bookCta}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export function HomeFleetDeck({
  boats,
  className = "",
}: HomeFleetDeckProps) {
  const { t } = useI18n();
  const c = t.conversion?.fleet ?? {};
  const fleet = useMemo(() => sortFleet(boats), [boats]);

  const labels = useMemo(
    () => ({
      noLicense: c.noLicense ?? "No licence ≤30HP",
      mostPopular: c.mostPopular ?? "Popular",
      viewVessel: t.fleet.viewVessel ?? "Details",
      bookCta: t.packageBuilder?.requestCta ?? t.package?.cta ?? "Request pricing",
      guestsCount:
        c.seatsCount ?? c.guestsCount ?? "{count} guests",
    }),
    [c, t.fleet.viewVessel, t.hero.cta],
  );

  const featured = fleet.find((b) => b.featured) ?? fleet[0];
  const rest = featured ? fleet.filter((b) => b.id !== featured.id) : fleet;
  const tiers = useMemo(() => groupByCapacity(rest), [rest]);

  const tierLabel = (pax: number) =>
    labels.guestsCount.replace("{count}", String(pax));

  if (fleet.length === 0) return null;

  return (
    <section
      id="home-fleet"
      className={cn("fleet-deck-2026 panel-fit", className)}
    >
      <ScrollReveal as="header" className="fleet-deck-2026__head">
        <div className="min-w-0 flex-1">
          <p className="ui-eyebrow mb-2">{t.fleet.eyebrow}</p>
          <h2 className="fleet-deck-2026__title text-balance">{t.fleet.title}</h2>
          <p className="fleet-deck-2026__subtitle text-pretty">
            {t.fleet.subtitle}
          </p>
        </div>
        <Link href="/fleet" className="fleet-deck-2026__all tap-target">
          {t.fleetGrid.viewFullFleet}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </ScrollReveal>

      {featured ? (
        <ScrollReveal delay={0.06} className="fleet-deck-2026__hero-wrap">
          <FleetDeckCard
            boat={featured}
            labels={labels}
            variant="hero"
            showPopularBadge
          />
        </ScrollReveal>
      ) : null}

      <div className="fleet-deck-2026__catalog">
        {tiers.map((tier, tierIndex) => (
          <div key={tier.pax} className="fleet-deck-2026__tier">
            <ScrollReveal delay={0.04 + tierIndex * 0.03}>
              <p className="fleet-deck-2026__tier-label">{tierLabel(tier.pax)}</p>
            </ScrollReveal>
            <div className="fleet-deck-2026__grid">
              {tier.boats.map((boat, index) => (
                <ScrollRevealItem key={boat.id} index={index} as="div">
                  <FleetDeckCard boat={boat} labels={labels} />
                </ScrollRevealItem>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="fleet-deck-2026__from text-center text-sm text-ds-text-muted lg:text-left">
        {t.fleet.stat2 ?? "Request pricing — call +30 698 131 8393"}
      </p>
    </section>
  );
}
