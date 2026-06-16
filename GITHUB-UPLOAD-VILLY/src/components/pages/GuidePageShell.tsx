"use client";

import { Anchor, Compass, MapPin } from "lucide-react";
import { useMemo } from "react";
import { GuidePageExperience } from "@/components/guide/GuidePageExperience";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/providers/LanguageProvider";
import type { Location } from "@/types";

const HERO_SPOT_IDS = ["tripiti-cave", "metalia-beach", "pefkari-beach"] as const;

export function GuidePageShell({ locations }: { locations: Location[] }) {
  const { t } = useI18n();
  const guide = t.guide as typeof t.guide & {
    heroBadge?: string;
    heroStatSpotsLabel?: string;
    heroStatBase?: string;
    heroStatBaseLabel?: string;
  };
  const page = t.guide.page as {
    spotCount?: string;
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
      accent="emerald"
      eyebrow={t.guide.eyebrow}
      eyebrowIcon={MapPin}
      title={t.guide.title}
      subtitle={t.guide.subtitle}
      heroImages={heroImages}
      visualBadge={guide.heroBadge ?? "By sea"}
      visualBadgeIcon={Compass}
      stats={[
        {
          value:
            page?.spotCount?.replace("{count}", String(locations.length)) ??
            `${locations.length} stops`,
          label: guide.heroStatSpotsLabel ?? "Boat-accessible stops",
          icon: Anchor,
        },
        {
          value: guide.heroStatBase ?? "Limenaria",
          label: guide.heroStatBaseLabel ?? "Departure marina",
          icon: MapPin,
        },
      ]}
    >
      <GuidePageExperience locations={locations} />
    </PageShell>
  );
}
