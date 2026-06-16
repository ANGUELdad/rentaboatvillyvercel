"use client";

import { Anchor, ArrowRight, ClipboardList, Ship, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { VesselCard } from "@/components/fleet/VesselCard";
import { ScrollRevealItem } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/LanguageProvider";
import type { PublicBoat } from "@/types";

interface FleetCatalogProps {
  boats: PublicBoat[];
  showPricing?: boolean;
  showIntro?: boolean;
}

type FleetBandCopy = {
  title: string;
  eyebrow: string;
  blurb: string;
  size: string;
  combos: string;
};

type FleetCatalogCopy = {
  introEyebrow: string;
  introTitle: string;
  introText: string;
  ribbonAria: string;
  ribbonBoats: string;
  ribbonBands: string;
  ribbonFuel: string;
  ribbonRequest: string;
  namesAria: string;
  bands: Record<string, FleetBandCopy>;
};

type FleetBand = {
  id: string;
  title: string;
  eyebrow: string;
  blurb: string;
  size: string;
  combos: string;
  names: string[];
  boats: PublicBoat[];
  icon: typeof Ship;
};

const BAND_DEFS = [
  { id: "flagship", pax: 9, icon: Ship },
  { id: "premium-group", pax: 8, icon: Users },
  { id: "family-group", pax: 7, icon: Sparkles },
] as const;

const FALLBACK_CATALOG: FleetCatalogCopy = {
  introEyebrow: "Capacity first",
  introTitle: "Eight boats, grouped into three clean capacity bands.",
  introText:
    "Start with headcount, then pick the boat that fits your group. No pricing on this page, no payment step — just the lineup and a request flow.",
  ribbonAria: "Fleet highlights",
  ribbonBoats: "{count} boats",
  ribbonBands: "3 capacity bands",
  ribbonFuel: "Fuel excluded",
  ribbonRequest: "Request-only flow",
  namesAria: "{band} boat names",
  bands: {
    flagship: {
      title: "The 9-seater flagship",
      eyebrow: "Premium lead boat",
      blurb:
        "The biggest space, the calmest feel, and the cleanest fit for larger family days.",
      size: "Up to 9 passengers",
      combos: "5 adults + 4 kids, 6 adults + 3 kids, 7 adults + 2 kids",
    },
    "premium-group": {
      title: "The 8-seater premium group",
      eyebrow: "Balanced comfort",
      blurb: "More room than a compact boat, with a tidy footprint for relaxed day trips.",
      size: "Up to 8 passengers",
      combos: "6 adults + 2 kids, 5 adults + 3 kids, 4 adults + 4 kids",
    },
    "family-group": {
      title: "The 7-seater family group",
      eyebrow: "Easy everyday fit",
      blurb:
        "The most flexible option for smaller crews who want a simple, smooth boat day.",
      size: "Up to 7 passengers",
      combos: "5 adults + 2 kids, 4 adults + 3 kids",
    },
  },
};

function resolveCatalogCopy(fleet: { catalog?: FleetCatalogCopy }): FleetCatalogCopy {
  const raw = fleet.catalog;
  if (!raw) return FALLBACK_CATALOG;
  const bands = { ...FALLBACK_CATALOG.bands };
  if (raw.bands) {
    for (const id of Object.keys(FALLBACK_CATALOG.bands)) {
      const band = raw.bands[id];
      if (band) {
        bands[id] = { ...bands[id], ...band };
      }
    }
  }
  return {
    introEyebrow: raw.introEyebrow ?? FALLBACK_CATALOG.introEyebrow,
    introTitle: raw.introTitle ?? FALLBACK_CATALOG.introTitle,
    introText: raw.introText ?? FALLBACK_CATALOG.introText,
    ribbonAria: raw.ribbonAria ?? FALLBACK_CATALOG.ribbonAria,
    ribbonBoats: raw.ribbonBoats ?? FALLBACK_CATALOG.ribbonBoats,
    ribbonBands: raw.ribbonBands ?? FALLBACK_CATALOG.ribbonBands,
    ribbonFuel: raw.ribbonFuel ?? FALLBACK_CATALOG.ribbonFuel,
    ribbonRequest: raw.ribbonRequest ?? FALLBACK_CATALOG.ribbonRequest,
    namesAria: raw.namesAria ?? FALLBACK_CATALOG.namesAria,
    bands,
  };
}

function groupFleet(boats: PublicBoat[], catalog: FleetCatalogCopy): FleetBand[] {
  const byPax = new Map<number, PublicBoat[]>();
  for (const boat of boats) {
    const current = byPax.get(boat.pax) ?? [];
    current.push(boat);
    byPax.set(boat.pax, current);
  }

  return BAND_DEFS.map((def) => {
    const copy = catalog.bands[def.id] ?? FALLBACK_CATALOG.bands[def.id];
    const group = byPax.get(def.pax) ?? [];
    return {
      id: def.id,
      title: copy.title,
      eyebrow: copy.eyebrow,
      blurb: copy.blurb,
      size: copy.size,
      combos: copy.combos,
      names: group.map((boat) => boat.name),
      boats: group,
      icon: def.icon,
    };
  }).filter((band) => band.boats.length > 0);
}

function formatCopy(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function FleetCatalog({
  boats,
  showPricing = false,
  showIntro = true,
}: FleetCatalogProps) {
  const { t } = useI18n();
  const pb = t.packageBuilder ?? {};
  const catalog = useMemo(() => resolveCatalogCopy(t.fleet), [t.fleet]);
  const bands = useMemo(() => groupFleet(boats, catalog), [boats, catalog]);

  if (boats.length === 0) {
    return (
      <p className="fleet-catalog__empty text-center text-sm text-ds-text-muted">
        {t.fleet.empty ?? "Fleet coming soon."}
      </p>
    );
  }

  const ribbonItems = [
    { icon: Ship, label: formatCopy(catalog.ribbonBoats, { count: boats.length }) },
    { icon: Users, label: catalog.ribbonBands },
    { icon: Anchor, label: catalog.ribbonFuel },
    { icon: Sparkles, label: catalog.ribbonRequest },
  ];

  return (
    <div className="fleet-catalog">
      {showIntro ? (
      <section className="fleet-catalog__intro glass-panel">
        <div className="fleet-catalog__intro-copy">
          <p className="fleet-catalog__intro-eyebrow ui-eyebrow">{catalog.introEyebrow}</p>
          <h2 className="fleet-catalog__intro-title">{catalog.introTitle}</h2>
          <p className="fleet-catalog__intro-text">{catalog.introText}</p>
        </div>

        <div
          className="fleet-catalog__intro-ribbon"
          role="list"
          aria-label={catalog.ribbonAria}
        >
          {ribbonItems.map(({ icon: Icon, label }) => (
            <span key={label} role="listitem" className="fleet-catalog__ribbon-chip">
              <Icon className="size-4" strokeWidth={2.2} />
              <span>{label}</span>
            </span>
          ))}
        </div>
      </section>
      ) : null}

      <div className="fleet-catalog__bands">
        {bands.map((band) => {
          const BandIcon = band.icon;
          return (
            <section
              key={band.id}
              id={band.id}
              className="fleet-catalog__band glass-panel scroll-mt-20"
            >
              <div className="fleet-catalog__band-head">
                <div className="min-w-0">
                  <p className="fleet-catalog__band-eyebrow ui-eyebrow">{band.eyebrow}</p>
                  <h3 className="fleet-catalog__band-title">
                    <BandIcon className="size-5 text-ds-brand" strokeWidth={2.2} />
                    <span>{band.title}</span>
                  </h3>
                  <p className="fleet-catalog__band-blurb">{band.blurb}</p>
                </div>

                <div className="fleet-catalog__band-meta">
                  <span className="fleet-catalog__band-size">{band.size}</span>
                  <span className="fleet-catalog__band-combos">{band.combos}</span>
                </div>
              </div>

              <div
                className="fleet-catalog__band-names"
                aria-label={formatCopy(catalog.namesAria, { band: band.title })}
              >
                {band.names.map((name) => (
                  <span key={name} className="fleet-catalog__name-pill">
                    {name}
                  </span>
                ))}
              </div>

              <div className="fleet-catalog__grid fleet-catalog__grid--band">
                {band.boats.map((boat, i) => (
                  <ScrollRevealItem key={boat.id} index={i}>
                    <VesselCard
                      boat={boat}
                      featured={boat.featured}
                      showPricing={showPricing}
                      className={cn(
                        band.boats.length === 1 && "fleet-catalog__card--featured",
                      )}
                    />
                  </ScrollRevealItem>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <ScrollRevealItem index={boats.length + 1}>
        <Link href="/package" className="fleet-catalog__package tap-target group">
          <span className="fleet-catalog__package-icon" aria-hidden>
            <ClipboardList className="size-4 text-ds-brand" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-ds-text">
              {pb.teaserTitle ?? "Build your request"}
            </span>
            <span className="mt-0.5 block text-xs text-ds-text-secondary">
              {pb.teaserDesc ?? "Tell us your group size, date, and preferred boat."}
            </span>
          </span>
          <span className="fleet-catalog__package-cta">
            {pb.teaserCta ?? "Start"}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      </ScrollRevealItem>
    </div>
  );
}
