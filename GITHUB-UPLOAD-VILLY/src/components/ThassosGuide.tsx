"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Navigation } from "lucide-react";
import Link from "next/link";
import {
  getLocalizedCategoryLabel,
  getLocalizedLocation,
} from "@/lib/localize-location";
import { spotDistanceFromMarina } from "@/lib/map-geo";
import { useI18n } from "@/providers/LanguageProvider";
import { SafeImage } from "./SafeImage";
import type { Location } from "@/types";

interface ThassosGuideProps {
  locations: Location[];
  hideHeader?: boolean;
}

const categoryStyles: Record<
  Location["category"],
  { text: string; border: string }
> = {
  beach: { text: "text-summer-gold", border: "border-summer-gold/30" },
  lagoon: { text: "text-summer-turquoise", border: "border-summer-turquoise/30" },
  culture: { text: "text-summer-coral", border: "border-summer-coral/30" },
  harbor: { text: "text-summer-aqua", border: "border-summer-aqua/30" },
};

export function ThassosGuide({ locations, hideHeader }: ThassosGuideProps) {
  const { t } = useI18n();
  const g = t.guide;
  const m = t.map;

  return (
    <section id="guide" className={hideHeader ? "" : "relative py-24"}>
      <div className={hideHeader ? "" : "mx-auto max-w-6xl px-6"}>
        {!hideHeader && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <p className="section-eyebrow mb-3 tracking-[0.4em] uppercase">
              {g.eyebrow}
            </p>
            <h2 className="section-title uppercase tracking-[0.1em]">
              {g.title}
            </h2>
            <p className="section-subtitle mx-auto mt-4 max-w-xl text-sm">
              {g.subtitle}
            </p>
          </motion.div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location, index) => {
            const spot = getLocalizedLocation(location, g);
            const categoryLabel = getLocalizedCategoryLabel(location.category, g);
            const distance = spotDistanceFromMarina(location);

            return (
              <motion.article
                key={location.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="glass-card group overflow-hidden rounded-2xl"
              >
                <div className="relative h-48 overflow-hidden">
                  <SafeImage
                    src={location.image}
                    alt={spot.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-ocean-950/20 to-transparent" />
                  <span
                    className={`absolute top-4 left-4 rounded-full border bg-ocean-950/70 px-3 py-1 text-[9px] font-medium tracking-[0.2em] uppercase backdrop-blur-md ${categoryStyles[location.category].text} ${categoryStyles[location.category].border}`}
                  >
                    {categoryLabel}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-medium tracking-[0.12em] text-ds-text uppercase">
                    {spot.name}
                  </h3>
                  <p className="mt-1 text-xs text-ds-text-secondary">
                    {spot.tagline}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-ds-text-muted">
                    {spot.description}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ds-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Navigation className="size-3" />
                      {distance.km} km {m.fromMarina ?? "from marina"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />~{distance.minutes} min{" "}
                      {m.byBoat ?? "by boat"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" />
                      {spot.coordinates.lat.toFixed(2)}°N ·{" "}
                      {spot.coordinates.lng.toFixed(2)}°E
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {g.mapCta && (
          <div className="mt-10 text-center">
            <Link
              href="/map"
              className="btn-glass inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium tracking-wide text-ds-text-secondary hover:text-ds-text"
            >
              {g.mapCta}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
