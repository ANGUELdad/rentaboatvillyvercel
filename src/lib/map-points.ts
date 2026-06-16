import { MARINA_LOCATION } from "@/lib/site";
import type { Location, MapPoint, RoutesData } from "@/types";

export interface LatLng {
  lat: number;
  lng: number;
}

export function buildPointLookup(
  locations: Location[],
  routesData: RoutesData
): Record<string, MapPoint> {
  const lookup: Record<string, MapPoint> = {
    [routesData.marina.id]: routesData.marina,
  };

  for (const location of locations) {
    lookup[location.id] = {
      id: location.id,
      name: location.name,
      coordinates: location.coordinates,
    };
  }

  return lookup;
}

export function resolveRoutePath(
  route: { waypointIds: string[]; marinePath?: LatLng[] },
  lookup: Record<string, MapPoint>
): LatLng[] {
  if (route.marinePath && route.marinePath.length >= 2) {
    return route.marinePath;
  }
  return route.waypointIds
    .map((id) => lookup[id])
    .filter(Boolean)
    .map((point) => point.coordinates);
}

export function googleMapsDirectionsUrl(
  route: { waypointIds: string[]; marinePath?: LatLng[] },
  lookup: Record<string, MapPoint>
): string {
  const points = resolveRoutePath(route, lookup);
  if (points.length < 2) return MARINA_LOCATION.googleMapsUrl;

  const origin = `${points[0].lat},${points[0].lng}`;
  const destination = `${points[points.length - 1].lat},${points[points.length - 1].lng}`;
  const middle = points.slice(1, -1);
  const waypoints = middle.map((p) => `${p.lat},${p.lng}`).join("|");

  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving",
  });
  if (waypoints) params.set("waypoints", waypoints);

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
