"use client";

import { useMemo } from "react";
import { FleetCatalog } from "@/components/fleet/FleetCatalog";
import { FleetGsapScroll } from "@/components/fleet/FleetGsapScroll";
import { ContentRow } from "@/components/ui/ContentRow";
import { boatsToContentRowItems } from "@/lib/content-row/mappers";
import { useI18n } from "@/providers/LanguageProvider";
import type { PublicBoat } from "@/types";

type FleetVariant = "page" | "home-overlay" | "home-mobile";

interface FleetGridProps {
  boats: PublicBoat[];
  variant?: FleetVariant;
  /** @deprecated use variant="home-overlay" */
  overlay?: boolean;
}

export function FleetGrid({
  boats,
  variant,
  overlay = false,
}: FleetGridProps) {
  const { t } = useI18n();
  const specLabels = useMemo(() => {
    const specs = t.yachtUi?.specs;
    return {
      pax: specs?.pax ?? "{count} pax",
      hp: specs?.hp ?? "{count} HP",
    };
  }, [t.yachtUi?.specs]);
  const resolved: FleetVariant =
    variant ?? (overlay ? "home-overlay" : "page");

  const allItems = boatsToContentRowItems(boats, specLabels);

  if (resolved === "home-mobile") {
    return (
      <ContentRow
        title={t.yachtUi?.nearYou?.title ?? "Near you"}
        href="/fleet"
        linkLabel={t.yachtUi?.nearYou?.seeAll ?? t.fleetGrid.allVessels}
        data={allItems}
        compact
      />
    );
  }

  if (resolved === "home-overlay") {
    return (
      <FleetGsapScroll>
        <ContentRow
          title={t.fleet.title}
          subtitle={t.fleet.subtitle}
          href="/fleet"
          linkLabel={t.fleetGrid.fullFleet}
          data={allItems}
          size="large"
          gsapReveal
          embedded
        />
      </FleetGsapScroll>
    );
  }

  return <FleetCatalog boats={boats} />;
}
