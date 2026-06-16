"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Anchor,
  ArrowRight,
  Clock,
  Compass,
  MapPin,
  Navigation,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import {
  getLocalizedCategoryLabel,
  getLocalizedLocation,
} from "@/lib/localize-location";
import { spotDistanceFromMarina } from "@/lib/map-geo";
import {
  appleSpringSoft,
  appleSpringSnappy,
  scrollRevealFromRightReduced,
  staggerStep,
} from "@/lib/motion";
import { localizedHref } from "@/lib/i18n/routing";
import { trimToEvenGrid } from "@/lib/even-grid";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/LanguageProvider";
import type { Location } from "@/types";

type GuideCategory = Location["category"] | "all";

const CATEGORY_STYLES: Record<
  Location["category"],
  { badge: string; accent: string }
> = {
  beach: {
    badge: "guide-page__badge--beach",
    accent: "text-ds-action",
  },
  lagoon: {
    badge: "guide-page__badge--lagoon",
    accent: "text-ds-focus",
  },
  culture: {
    badge: "guide-page__badge--culture",
    accent: "text-ds-brand",
  },
  harbor: {
    badge: "guide-page__badge--harbor",
    accent: "text-ds-text-secondary",
  },
};

type GuidePageCopy = {
  filterAll?: string;
  timelineTitle?: string;
  scrollHint?: string;
  spotCount?: string;
  statMarina?: string;
  statReach?: string;
  filterAriaLabel?: string;
  ctaNavAria?: string;
  ctaMap?: string;
  ctaBook?: string;
};

function GuideSpotCard({
  location,
  index,
  total,
  mapHref,
}: {
  location: Location;
  index: number;
  total: number;
  mapHref: (spotId: string) => string;
}) {
  const { t } = useI18n();
  const g = t.guide;
  const m = t.map;
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLElement>(null);
  const spot = getLocalizedLocation(location, g);
  const categoryLabel = getLocalizedCategoryLabel(location.category, g);
  const distance = spotDistanceFromMarina(location);
  const styles = CATEGORY_STYLES[location.category];
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.55, 1, 1, 0.55]);

  const reveal = reduceMotion
    ? scrollRevealFromRightReduced
    : {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: appleSpringSoft },
      };

  return (
    <motion.article
      ref={cardRef}
      id={`guide-spot-${location.id}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.25, margin: "-8% 0px" }}
      variants={reveal}
      transition={{ delay: (index % 3) * staggerStep }}
      style={reduceMotion ? undefined : { opacity: cardOpacity }}
      className="guide-page__spot glass-elevated"
    >
      <div className="guide-page__spot-index" aria-hidden>
        <span className="guide-page__spot-num">{String(index + 1).padStart(2, "0")}</span>
        <span className="guide-page__spot-of">/ {total}</span>
      </div>

      <div className="guide-page__spot-media">
        <motion.div
          className="guide-page__spot-parallax absolute inset-0"
          style={reduceMotion ? undefined : { y: imageY }}
        >
          <SafeImage
            src={location.image}
            alt={spot.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>
        <div className="guide-page__spot-scrim" aria-hidden />
        <span className={cn("guide-page__badge", styles.badge)}>{categoryLabel}</span>
        <div className="guide-page__spot-distance">
          <Navigation className="size-3.5" aria-hidden />
          {distance.km} km · ~{distance.minutes} min
        </div>
      </div>

      <div className="guide-page__spot-body">
        <h3 className="guide-page__spot-title">{spot.name}</h3>
        <p className={cn("guide-page__spot-tagline", styles.accent)}>{spot.tagline}</p>
        <p className="guide-page__spot-desc">{spot.description}</p>
        <div className="guide-page__spot-meta">
          <span>
            <Clock className="size-3.5" aria-hidden />~{distance.minutes} min{" "}
            {m.byBoat ?? "by boat"}
          </span>
          <span>
            <MapPin className="size-3.5" aria-hidden />
            {spot.coordinates.lat.toFixed(2)}°N · {spot.coordinates.lng.toFixed(2)}°E
          </span>
        </div>
        <Link
          href={mapHref(location.id)}
          className="guide-page__spot-link tap-target"
        >
          {m.openMaps ?? "View on sea atlas"}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </motion.article>
  );
}

export function GuidePageExperience({ locations }: { locations: Location[] }) {
  const { locale, t } = useI18n();
  const g = t.guide;
  const page = g.page ?? {};
  const reduceMotion = useReducedMotion();
  const [category, setCategory] = useState<GuideCategory>("all");
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.9", "end 0.2"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const sorted = useMemo(
    () =>
      [...locations].sort(
        (a, b) => spotDistanceFromMarina(a).km - spotDistanceFromMarina(b).km,
      ),
    [locations],
  );

  const filtered = useMemo(
    () =>
      category === "all"
        ? sorted
        : sorted.filter((loc) => loc.category === category),
    [sorted, category],
  );
  const gridSpots = useMemo(() => trimToEvenGrid(filtered, 3), [filtered]);

  const categories: { id: GuideCategory; label: string }[] = [
    { id: "all", label: page.filterAll ?? "All stops" },
    { id: "beach", label: g.categoryBeach ?? "Beach" },
    { id: "lagoon", label: g.categoryLagoon ?? "Hidden cove" },
    { id: "culture", label: g.categoryCulture ?? "Historic site" },
    { id: "harbor", label: g.categoryHarbor ?? "Harbor" },
  ];

  const maxMinutes = Math.max(...sorted.map((l) => spotDistanceFromMarina(l).minutes));
  const mapSpotHref = (spotId: string) =>
    localizedHref(`/map?spot=${spotId}`, locale);

  return (
    <div className="guide-page">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={appleSpringSnappy}
        className="guide-page__stats glass-panel"
      >
        <div className="guide-page__stat">
          <Compass className="size-5 text-ds-brand" aria-hidden />
          <p className="guide-page__stat-value">
            {(page.spotCount ?? "{count} anchorages").replace(
              "{count}",
              String(sorted.length),
            )}
          </p>
        </div>
        <div className="guide-page__stat">
          <Anchor className="size-5 text-ds-brand" aria-hidden />
          <p className="guide-page__stat-value">
            {page.statMarina ?? "New Port of Limenaria"}
          </p>
        </div>
        <div className="guide-page__stat">
          <Clock className="size-5 text-ds-brand" aria-hidden />
          <p className="guide-page__stat-value">
            {(page.statReach ?? "Up to ~{minutes} min reach").replace(
              "{minutes}",
              String(maxMinutes),
            )}
          </p>
        </div>
      </motion.div>

      <div
        className="guide-page__filters"
        role="tablist"
        aria-label={page.filterAriaLabel ?? "Filter destinations"}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={category === cat.id}
            onClick={() => setCategory(cat.id)}
            className={cn(
              "guide-page__filter tap-target tap-target--pill",
              category === cat.id && "guide-page__filter--active",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="guide-page__quick-wrap">
        <div className="guide-page__quick scrollbar-none">
          {sorted.map((loc, i) => {
            const spot = getLocalizedLocation(loc, g);
            const distance = spotDistanceFromMarina(loc);
            const categoryLabel = getLocalizedCategoryLabel(loc.category, g);
            const styles = CATEGORY_STYLES[loc.category];
            return (
              <motion.a
                key={loc.id}
                href={`#guide-spot-${loc.id}`}
                initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ ...appleSpringSoft, delay: i * 0.05 }}
                whileHover={reduceMotion ? undefined : { y: -5, scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                className={cn(
                  "guide-page__quick-card tap-target",
                  `guide-page__quick-card--${loc.category}`,
                )}
              >
                <span className="guide-page__quick-media">
                  <SafeImage
                    src={loc.image}
                    alt=""
                    fill
                    sizes="140px"
                    className="guide-page__quick-image object-cover"
                  />
                  <span className="guide-page__quick-shine" aria-hidden />
                  <span className="guide-page__quick-scrim" aria-hidden />
                  <span className={cn("guide-page__quick-badge", styles.badge)}>
                    {categoryLabel}
                  </span>
                  <span className="guide-page__quick-time">
                    <Clock className="size-3" aria-hidden />
                    ~{distance.minutes}m
                  </span>
                </span>
                <span className="guide-page__quick-body">
                  <span className="guide-page__quick-label">{spot.name}</span>
                  <span className="guide-page__quick-distance">
                    <Navigation className="size-3" aria-hidden />
                    {distance.km} km
                  </span>
                </span>
              </motion.a>
            );
          })}
        </div>
      </div>

      <p className="guide-page__scroll-hint">
        <Sparkles className="size-3.5 text-ds-brand" aria-hidden />
        {page.scrollHint ?? "Scroll the coast — spots unfold as you go"}
      </p>

      <section
        ref={timelineRef}
        className="guide-page__timeline"
        aria-labelledby="guide-timeline-title"
      >
        <h2 id="guide-timeline-title" className="guide-page__section-title">
          {page.timelineTitle ?? "Coastal route from Limenaria"}
        </h2>
        <div className="guide-page__timeline-rail" aria-hidden>
          <motion.span
            className="guide-page__timeline-fill"
            style={reduceMotion ? { scaleY: 1 } : { scaleY: lineScale }}
          />
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div
            key={category}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="guide-page__spots"
          >
            {gridSpots.map((location, index) => (
              <GuideSpotCard
                key={location.id}
                location={location}
                index={index}
                total={gridSpots.length}
                mapHref={mapSpotHref}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      <motion.nav
        className="guide-page__cta"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={appleSpringSoft}
        aria-label={page.ctaNavAria ?? "Guide next steps"}
      >
        <Link
          href={localizedHref("/map", locale)}
          className="guide-page__cta-btn glass-elevated tap-target"
        >
          <MapPin className="size-5 text-ds-brand" aria-hidden />
          <span>{page.ctaMap ?? g.mapCta ?? "Open interactive sea atlas"}</span>
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link
          href={localizedHref("/booking", locale)}
          className="guide-page__cta-btn guide-page__cta-btn--primary tap-target"
        >
          <Sparkles className="size-5" aria-hidden />
          <span>{page.ctaBook ?? "Request a boat"}</span>
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </motion.nav>
    </div>
  );
}
