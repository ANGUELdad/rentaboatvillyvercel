"use client";

import { Anchor, Compass, MapPin, Navigation } from "lucide-react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { ThassosDiscoverMap } from "@/components/map/ThassosDiscoverMap";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/providers/LanguageProvider";
import type { Location } from "@/types";

const HERO_SPOT_IDS = ["tripiti-cave", "metalia-beach", "pefkari-beach"] as const;

interface MapPageClientProps {
  locations: Location[];
}

export function MapPageClient({ locations }: MapPageClientProps) {
  const { t } = useI18n();
  const map = t.map as typeof t.map & {
    heroBadge?: string;
    heroStatSpotsLabel?: string;
    heroStatTracks?: string;
    heroStatTracksLabel?: string;
    heroStatBase?: string;
    heroStatBaseLabel?: string;
  };

  const heroImages = useMemo(() => {
    const featured = HERO_SPOT_IDS.map((id) => locations.find((loc) => loc.id === id))
      .filter((loc): loc is Location => Boolean(loc))
      .map((loc) => loc.image);
    if (featured.length > 0) return featured;
    return locations.slice(0, 3).map((loc) => loc.image);
  }, [locations]);

  return (
    <PageShell
      accent="turquoise"
      eyebrow={t.map.eyebrow}
      eyebrowIcon={Compass}
      title={t.map.title}
      subtitle={t.map.subtitle}
      heroImages={heroImages}
      visualBadge={map.heroBadge ?? "Sea atlas"}
      visualBadgeIcon={MapPin}
      stats={[
        {
          value: `${locations.length} ${t.map.spotsCount ?? "spots"}`,
          label: map.heroStatSpotsLabel ?? "On the chart",
          icon: Anchor,
        },
        {
          value: map.heroStatTracks ?? "GPS tracks",
          label: map.heroStatTracksLabel ?? "Marine routes",
          icon: Navigation,
        },
        {
          value: map.heroStatBase ?? "Limenaria",
          label: map.heroStatBaseLabel ?? "Departure marina",
          icon: MapPin,
        },
      ]}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-1 sm:mt-2"
      >
        <ThassosDiscoverMap locations={locations} />
      </motion.div>

      <p className="mt-5 text-center text-xs leading-relaxed text-ds-text-secondary">
        {t.map.seoBlurb ??
          "Every pin is reachable only by boat from New Port of Limenaria — Tripiti Cave, Marble Beach, Golden Beach, Aliki & secret coves across Thassos."}
      </p>
    </PageShell>
  );
}
