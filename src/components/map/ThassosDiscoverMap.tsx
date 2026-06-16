"use client";

import dynamic from "next/dynamic";
import { Anchor, ChevronLeft, Clock, Navigation, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import { playFeedback } from "@/lib/feedback";
import {
  CATEGORY_META,
  LIMENARIA_MARINA,
  spotDistanceFromMarina,
  type SpotCategory,
} from "@/lib/map-geo";
import {
  getLocalizedCategoryLabel,
  getLocalizedLocation,
} from "@/lib/localize-location";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/LanguageProvider";
import type { Location } from "@/types";

const DiscoverLeafletMap = dynamic(
  () => import("./DiscoverLeafletMap").then((m) => m.DiscoverLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="map-sea-bg flex h-full min-h-[240px] items-center justify-center rounded-xl">
        <Navigation className="size-7 animate-pulse text-ds-brand/50" />
      </div>
    ),
  },
);

const FILTERS: SpotCategory[] = ["all", "beach", "lagoon", "culture", "harbor"];

interface ThassosDiscoverMapProps {
  locations: Location[];
}

function SpotDetailCard({
  spot,
  m,
  categoryLabel,
  onBack,
  compact = false,
  hideImage = false,
}: {
  spot: Location;
  m: Record<string, string | undefined>;
  categoryLabel: string;
  onBack?: () => void;
  compact?: boolean;
  hideImage?: boolean;
}) {
  const d = spotDistanceFromMarina(spot);
  const meta = CATEGORY_META[spot.category];

  return (
    <article className={cn("sea-atlas-detail", compact && "sea-atlas-detail--compact")}>
      {onBack && (
        <button
          type="button"
          data-sfx-skip
          onClick={onBack}
          className="sea-atlas-detail__back tap-target mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ds-brand"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {m.backToList ?? "All spots"}
        </button>
      )}
      <div className="flex gap-3">
        {!hideImage && (
          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl sm:size-24">
            <SafeImage
              src={spot.image}
              alt={spot.name}
              fill
              sizes="96px"
              className="object-cover"
            />
            <span
              className="absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white uppercase"
              style={{ backgroundColor: `${meta.color}cc` }}
            >
              {categoryLabel}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          {hideImage && (
            <span
              className="mb-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white uppercase"
              style={{ backgroundColor: `${meta.color}cc` }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: meta.color }}
                aria-hidden
              />
              {categoryLabel}
            </span>
          )}
          <h3 className="ui-card-title text-base font-semibold text-ds-text sm:text-lg">
            {spot.name}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-sm text-ds-text-secondary">{spot.tagline}</p>
          <p className="mt-2 flex flex-wrap gap-3 text-xs text-ds-text-muted">
            <span className="inline-flex items-center gap-1">
              <Navigation className="size-3 text-ds-brand" aria-hidden />
              {d.km} km {m.fromMarina ?? "from marina"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3 text-ds-brand" aria-hidden />
              ~{d.minutes} min {m.byBoat ?? "by boat"}
            </span>
          </p>
        </div>
      </div>
      {!compact && (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ds-text-secondary">
          {spot.description}
        </p>
      )}
      <Link
        href={`/booking?spot=${spot.id}`}
        className="btn-app-primary ui-btn-label mt-4 flex min-h-[44px] w-full items-center justify-center rounded-xl text-xs font-semibold tracking-wide uppercase"
      >
        {m.bookSpot ?? "Book a boat here"}
      </Link>
    </article>
  );
}

function FilterChips({
  filter,
  setFilter,
  filterLabel,
}: {
  filter: SpotCategory;
  setFilter: (cat: SpotCategory) => void;
  filterLabel: (cat: SpotCategory) => string;
}) {
  return (
    <div className="sea-atlas-filters guide-page__filters scroll-row scrollbar-none">
      {FILTERS.map((cat) => {
        const active = filter === cat;
        const color = cat !== "all" ? CATEGORY_META[cat].color : undefined;
        return (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={active}
            data-sfx-skip
            onClick={() => {
              if (cat !== filter) playFeedback("select", "light");
              setFilter(cat);
            }}
            className={cn(
              "guide-page__filter tap-target tap-target--pill shrink-0",
              active && "guide-page__filter--active",
            )}
          >
            {cat !== "all" && (
              <span
                className="mr-1.5 inline-block size-2 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden
              />
            )}
            {filterLabel(cat)}
          </button>
        );
      })}
    </div>
  );
}

function SpotListRow({
  loc,
  active,
  onSelect,
}: {
  loc: Location;
  active: boolean;
  onSelect: () => void;
}) {
  const d = spotDistanceFromMarina(loc);
  const meta = CATEGORY_META[loc.category];

  return (
    <button
      type="button"
      data-sfx-skip
      onClick={() => {
        if (!active) playFeedback("select", "light");
        onSelect();
      }}
      className={cn("sea-atlas-row tap-target", active && "sea-atlas-row--active")}
    >
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
        <SafeImage src={loc.image} alt="" fill sizes="48px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium text-ds-text">{loc.name}</p>
        <p className="truncate text-xs text-ds-text-muted">
          {d.km} km · ~{d.minutes} min
        </p>
      </div>
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: meta.color }}
        aria-hidden
      />
    </button>
  );
}

function MobileSpotCard({
  loc,
  active,
  onSelect,
}: {
  loc: Location;
  active: boolean;
  onSelect: () => void;
}) {
  const meta = CATEGORY_META[loc.category];
  const d = spotDistanceFromMarina(loc);

  return (
    <button
      type="button"
      data-sfx-skip
      onClick={() => {
        if (!active) playFeedback("select", "light");
        onSelect();
      }}
      className={cn("sea-atlas-mobile-card tap-target shrink-0", active && "sea-atlas-mobile-card--active")}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: meta.color }}
        aria-hidden
      />
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-xs font-semibold text-ds-text">{loc.name}</p>
        <p className="text-[10px] text-ds-text-muted tabular-nums">{d.km} km</p>
      </div>
    </button>
  );
}

export function ThassosDiscoverMap({ locations }: ThassosDiscoverMapProps) {
  const { t } = useI18n();
  const m = t.map;
  const localizedLocations = useMemo(
    () => locations.map((loc) => getLocalizedLocation(loc, t.guide)),
    [locations, t.guide],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<SpotCategory>("all");
  const [query, setQuery] = useState("");
  const [mobileDetail, setMobileDetail] = useState(false);

  const filtered = useMemo(() => {
    let list = localizedLocations;
    if (filter !== "all") {
      list = list.filter((l) => l.category === filter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.tagline.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [localizedLocations, filter, query]);

  useEffect(() => {
    if (selectedId && !filtered.some((l) => l.id === selectedId)) {
      setSelectedId(null);
      setMobileDetail(false);
    }
  }, [filtered, selectedId]);

  const mapLocations = filtered.length > 0 ? filtered : localizedLocations;
  const selected = selectedId
    ? localizedLocations.find((l) => l.id === selectedId) ?? null
    : null;

  const selectSpot = (id: string) => {
    if (id !== selectedId) playFeedback("select", "light");
    setSelectedId(id);
    setMobileDetail(true);
  };

  const clearSelection = () => {
    playFeedback("dismiss", "light");
    setSelectedId(null);
    setMobileDetail(false);
  };

  const filterLabel = (cat: SpotCategory) => {
    if (cat === "all") return m.allSpots ?? "All";
    return getLocalizedCategoryLabel(cat, t.guide);
  };

  return (
    <div className="sea-atlas glass-elevated glass-2026-panel ui-2026-surface panel-fit no-overflow-x overflow-hidden rounded-2xl sm:rounded-3xl">
      <div className="sea-atlas__toolbar">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ds-text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={m.searchPlaceholder ?? "Search beaches, caves, harbors…"}
            className="sea-atlas__search w-full"
          />
        </div>
        <p className="sea-atlas__count shrink-0 text-xs font-semibold tabular-nums text-ds-text-secondary">
          {filtered.length} {m.spotsCount ?? "spots"}
        </p>
      </div>

      <FilterChips filter={filter} setFilter={setFilter} filterLabel={filterLabel} />

      <div className="sea-atlas__layout">
        <div className="sea-atlas__map-col">
          <DiscoverLeafletMap
            locations={mapLocations}
            selectedId={selected?.id ?? null}
            onSelect={selectSpot}
          />
          <p className="sea-atlas__marina-pill">
            <Anchor className="size-3 shrink-0 text-ds-brand" aria-hidden />
            {(m.marinaName ?? LIMENARIA_MARINA.name)}
          </p>
        </div>

        <aside className="sea-atlas__sidebar hidden lg:flex">
          {selected ? (
            <div className="shrink-0 border-b border-ds-border/60 p-3">
              <SpotDetailCard
                spot={selected}
                m={m}
                categoryLabel={getLocalizedCategoryLabel(selected.category, t.guide)}
                onBack={clearSelection}
                compact
              />
            </div>
          ) : (
            <p className="shrink-0 border-b border-ds-border/60 px-3 py-3 text-[10px] font-semibold tracking-[0.18em] text-ds-text-muted uppercase">
              {m.discoverTitle ?? "Boat-accessible destinations"}
            </p>
          )}
          <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-3">
            {filtered.map((loc) => (
              <li key={loc.id}>
                <SpotListRow
                  loc={loc}
                  active={loc.id === selectedId}
                  onSelect={() => selectSpot(loc.id)}
                />
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="py-8 text-center text-sm text-ds-text-muted">
                {m.noResults ?? "No spots match your search."}
              </li>
            )}
          </ul>
        </aside>

        <div className="sea-atlas__dock lg:hidden">
          {mobileDetail && selected ? (
            <SpotDetailCard
              spot={selected}
              m={m}
              categoryLabel={getLocalizedCategoryLabel(selected.category, t.guide)}
              onBack={clearSelection}
              hideImage
            />
          ) : (
            <>
              <p className="mb-2 px-1 text-[10px] font-semibold tracking-[0.16em] text-ds-text-muted uppercase">
                {m.discoverTitle ?? "Tap a destination"}
              </p>
              <div className="sea-atlas__mobile-scroll scroll-row scrollbar-none">
                {filtered.map((loc) => (
                  <MobileSpotCard
                    key={loc.id}
                    loc={loc}
                    active={loc.id === selectedId}
                    onSelect={() => selectSpot(loc.id)}
                  />
                ))}
                {filtered.length === 0 && (
                  <p className="py-4 text-sm text-ds-text-muted">
                    {m.noResults ?? "No spots match your search."}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
