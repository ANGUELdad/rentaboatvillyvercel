"use client";

import { Anchor, ArrowRight, Fuel, Ship, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import { ParallaxLayer } from "@/components/ui/ParallaxLayer";
import { appleSpringSoft, homeScrollViewport } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/LanguageProvider";
import type { PublicBoat } from "@/types";

export const FLEET_HERO_CUTOUT = "/images/fleet/villy-hero-cutout.png";

const PAX_THEME: Record<number, string> = {
  9: "fleet-showcase__picker-card--flagship",
  8: "fleet-showcase__picker-card--premium",
  7: "fleet-showcase__picker-card--family",
};

const FALLBACK = {
  brand: "Rent A Boat Villy",
  tagline: "Ready for the Aegean.",
  heroTitle: "Our fleet",
  headline: "Eight boats · three sizes",
  subtitle: "Pick your crew size, compare every boat, then send a booking request.",
  homeHeadline: "Find the right boat for your crew",
  homeSubtitle: "Self-drive rentals from New Port of Limenaria — no licence up to 30HP.",
  pickerLead: "Choose your boat",
  specs: {
    seats: "Up to {count} seats",
    license: "No licence ≤30HP",
    fuel: "Fuel excluded",
    briefing: "Safety briefing included",
  },
  pickerAria: "Choose a boat",
  exploreFleet: "Explore full fleet",
  bookSelected: "Request pricing",
  viewDetails: "View details",
  seatsShort: "{count} seats",
  requestOnly: "Hourly rental · request for pricing",
};

type FleetShowcaseProps = {
  boats: PublicBoat[];
  variant?: "home" | "page";
  className?: string;
};

function formatCopy(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function defaultBoatId(boats: PublicBoat[]): string {
  const featured = boats.find((b) => b.featured);
  if (featured) return featured.id;
  const largest = [...boats].sort((a, b) => b.pax - a.pax)[0];
  return largest?.id ?? boats[0]?.id ?? "";
}

export function FleetShowcase({
  boats,
  variant = "page",
  className = "",
}: FleetShowcaseProps) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const homeCopy = (t.home?.fleetTeaser ?? {}) as Partial<{
    title: string;
    subtitle: string;
    cta: string;
  }>;
  const fleetCopy = t.fleet ?? {};
  const copy = {
    eyebrow: fleetCopy.eyebrow ?? FALLBACK.heroTitle,
    brand: FALLBACK.brand,
    tagline: FALLBACK.tagline,
    headline:
      variant === "home"
        ? (homeCopy.title ?? FALLBACK.homeHeadline)
        : FALLBACK.headline,
    subtitle:
      variant === "home"
        ? (homeCopy.subtitle ?? FALLBACK.homeSubtitle)
        : (fleetCopy.subtitle ?? FALLBACK.subtitle),
    pickerLead: FALLBACK.pickerLead,
    exploreFleet: homeCopy.cta ?? FALLBACK.exploreFleet,
    bookSelected: t.packageBuilder?.requestCta ?? t.package?.cta ?? FALLBACK.bookSelected,
  };

  const maxPax = useMemo(() => Math.max(...boats.map((b) => b.pax), 0), [boats]);
  const [selectedId, setSelectedId] = useState(() => defaultBoatId(boats));

  useEffect(() => {
    setSelectedId(defaultBoatId(boats));
  }, [boats]);

  const selected = useMemo(
    () => boats.find((b) => b.id === selectedId) ?? boats[0],
    [boats, selectedId],
  );

  if (!boats.length || !selected) return null;

  const specs = [
    { icon: Users, label: formatCopy(FALLBACK.specs.seats, { count: maxPax }) },
    { icon: Ship, label: FALLBACK.specs.license },
    { icon: Fuel, label: fleetCopy.catalog?.ribbonFuel ?? FALLBACK.specs.fuel },
    { icon: Anchor, label: FALLBACK.specs.briefing },
  ];

  const Root = reduceMotion ? "section" : motion.section;
  const rootProps =
    variant === "home" && !reduceMotion
      ? {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: homeScrollViewport,
          transition: appleSpringSoft,
        }
      : {};

  return (
    <Root
      id={variant === "home" ? "home-fleet" : "fleet-showcase"}
      className={cn("fleet-showcase", `fleet-showcase--${variant}`, className)}
      aria-labelledby="fleet-showcase-title"
      {...rootProps}
    >
      <div className="fleet-showcase__frame">
        <header className="fleet-showcase__hero-zone">
          <div className="fleet-showcase__hero-inner">
            <div className="fleet-showcase__hero-meta">
              <div className="fleet-showcase__specs" role="list" aria-label={copy.eyebrow}>
                {specs.map(({ icon: Icon, label }) => (
                  <span key={label} role="listitem" className="fleet-showcase__spec">
                    <Icon className="size-3.5 shrink-0" strokeWidth={2.2} aria-hidden />
                    <span>{label}</span>
                  </span>
                ))}
              </div>

              <div className="fleet-showcase__brand-block">
                <p className="fleet-showcase__eyebrow">{copy.eyebrow}</p>
                {variant === "home" ? (
                  <p className="fleet-showcase__brand">{copy.brand}</p>
                ) : null}
                <h1 id="fleet-showcase-title" className="fleet-showcase__headline">
                  {copy.headline}
                </h1>
                {variant === "home" ? (
                  <p className="fleet-showcase__tagline">{copy.tagline}</p>
                ) : null}
              </div>

              <p className="fleet-showcase__intro">{copy.subtitle}</p>
            </div>

            {/* The boat now drifts against the scroll. ParallaxLayer and its
                useScrollParallax hook were already written but wired to
                nothing — the hook disables itself under prefers-reduced-motion
                and halves the intensity on touch, so this costs nothing on the
                devices that should not have it. */}
            <ParallaxLayer
              className="fleet-showcase__vessel-wrap"
              intensity={0.12}
              style={{ willChange: "transform" }}
            >
              <span aria-hidden className="contents">
                <Image
                  src={FLEET_HERO_CUTOUT}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 92vw, 42vw"
                  priority={variant === "page"}
                  className="fleet-showcase__vessel-cutout"
                />
              </span>
            </ParallaxLayer>
          </div>
        </header>

        <div className="fleet-showcase__panel">
          <div className="fleet-showcase__panel-inner">
            <div className="fleet-showcase__panel-head">
              <div className="fleet-showcase__panel-copy">
                <p className="fleet-showcase__panel-eyebrow">
                  <Sparkles className="size-3.5" aria-hidden />
                  {copy.pickerLead}
                </p>
                <p className="fleet-showcase__panel-title">
                  {(() => {
                    const seats = formatCopy(FALLBACK.seatsShort, {
                      count: selected.pax,
                    });
                    /* Every boat stores its seat count at the head of its
                       tagline ("9 seats · Family"), so prepending it here
                       printed it twice. Drop the repeat, keep the rest. */
                    const tagline = selected.tagline ?? "";
                    const rest = tagline.startsWith(seats)
                      ? tagline.slice(seats.length).replace(/^\s*·\s*/, "")
                      : tagline;
                    return rest ? `${seats} · ${rest}` : seats;
                  })()}
                </p>
              </div>
              {variant === "page" ? (
                <Link
                  href={`/fleet/${selected.id}`}
                  className="fleet-showcase__details-link tap-target"
                >
                  {FALLBACK.viewDetails}
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              ) : null}
            </div>

            <div
              className="fleet-showcase__picker"
              role="listbox"
              aria-label={FALLBACK.pickerAria}
            >
              {boats.map((boat) => {
                const active = boat.id === selected.id;
                return (
                  <button
                    key={boat.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    aria-label={boat.name}
                    onClick={() => setSelectedId(boat.id)}
                    className={cn(
                      "fleet-showcase__picker-card tap-target",
                      PAX_THEME[boat.pax] ?? "fleet-showcase__picker-card--family",
                      active && "fleet-showcase__picker-card--active",
                    )}
                  >
                    <span className="fleet-showcase__picker-media">
                      <SafeImage
                        src={boat.image}
                        alt=""
                        fill
                        sizes="(max-width: 639px) 140px, 200px"
                        className="object-cover"
                      />
                    </span>
                    <span className="fleet-showcase__picker-body">
                      <span className="fleet-showcase__picker-name">{boat.name}</span>
                      <span className="fleet-showcase__picker-meta">
                        {formatCopy(FALLBACK.seatsShort, { count: boat.pax })}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="fleet-showcase__actions">
              <p className="fleet-showcase__actions-note">{FALLBACK.requestOnly}</p>
              <div className="fleet-showcase__actions-row">
                {variant === "home" ? (
                  <Link href="/fleet" className="fleet-showcase__cta-secondary tap-target">
                    {copy.exploreFleet}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                ) : null}
                <Link
                href={`/package?boat=${selected.id}`}
                className="fleet-showcase__cta-primary btn-app-primary ui-btn-label tap-target"
              >
                {copy.bookSelected}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Root>
  );
}
