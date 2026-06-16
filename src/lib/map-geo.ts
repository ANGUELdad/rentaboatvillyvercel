import type { Location } from "@/types";
import { MARINA_LOCATION } from "@/lib/site";

export const LIMENARIA_MARINA = {
  id: "marina",
  name: MARINA_LOCATION.shortName,
  coordinates: MARINA_LOCATION.coordinates,
} as const;

export type SpotCategory = Location["category"] | "all";

export const CATEGORY_META: Record<
  Location["category"],
  { label: string; color: string; emoji: string; markerSvg: string }
> = {
  beach: {
    label: "Beaches",
    color: "#22d3ee",
    emoji: "🏖",
    markerSvg:
      '<path d="M2 12q2.5 2 5 0t5 0 5 0 5 0"/><path d="M2 19q2.5 2 5 0t5 0 5 0 5 0"/><path d="M2 5q2.5 2 5 0t5 0 5 0 5 0"/>',
  },
  lagoon: {
    label: "Hidden coves",
    color: "#34d399",
    emoji: "💎",
    markerSvg:
      '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>',
  },
  culture: {
    label: "Culture",
    color: "#a78bfa",
    emoji: "🏛",
    markerSvg:
      '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/>',
  },
  harbor: {
    label: "Harbors",
    color: "#fbbf24",
    emoji: "⚓",
    markerSvg:
      '<path d="M12 6v16"/><path d="m19 13 2-1a9 9 0 0 1-18 0l2 1"/><path d="M9 11h6"/><circle cx="12" cy="4" r="2"/>',
  },
};

const MARINA_MARKER_SVG =
  '<path d="M12 6v16"/><path d="m19 13 2-1a9 9 0 0 1-18 0l2 1"/><path d="M9 11h6"/><circle cx="12" cy="4" r="2"/>';

function markerSvgHtml(paths: string, color: string, selected: boolean) {
  const iconSize = selected ? 18 : 15;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

export function spotMarkerIcon(category: Location["category"], selected: boolean) {
  const { color, markerSvg } = CATEGORY_META[category];
  const size = selected ? 44 : 36;
  const bg = selected ? color : `${color}33`;
  return {
    className: "discover-spot-marker",
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};
      border:2px solid ${color};
      box-shadow:0 0 ${selected ? 28 : 16}px ${color}${selected ? "88" : "44"};
      transition:all 0.25s ease;
    ">${markerSvgHtml(markerSvg, selected ? "#fff" : color, selected)}</div>`,
    iconSize: [size, size] as [number, number],
    iconAnchor: [size / 2, size / 2] as [number, number],
    popupAnchor: [0, -size / 2] as [number, number],
  };
}

export function marinaMarkerIcon() {
  const size = 48;
  const color = "#2a9d8f";
  return {
    className: "discover-marina-marker",
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:${size}px;height:${size}px;border-radius:50%;
      background:rgba(42,157,143,0.22);
      border:2px solid ${color};
      box-shadow:0 4px 20px rgba(42,157,143,0.35);
    ">${markerSvgHtml(MARINA_MARKER_SVG, color, true)}</div>`,
    iconSize: [size, size] as [number, number],
    iconAnchor: [size / 2, size / 2] as [number, number],
  };
}

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Rough boat time at leisure cruising speed */
export function estimateBoatMinutes(km: number): number {
  return Math.max(5, Math.round((km / 11) * 60));
}

export const MARINA_RADIUS_KM = 10;

export function spotDistanceFromMarina(loc: Location) {
  const km = distanceKm(LIMENARIA_MARINA.coordinates, loc.coordinates);
  return { km: Math.round(km * 10) / 10, minutes: estimateBoatMinutes(km) };
}

export function filterLocationsNearMarina(
  locations: Location[],
  maxKm = MARINA_RADIUS_KM,
): Location[] {
  return locations.filter((loc) => spotDistanceFromMarina(loc).km <= maxKm);
}
