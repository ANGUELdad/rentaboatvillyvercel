"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import {
  LIMENARIA_MARINA,
  marinaMarkerIcon,
  spotMarkerIcon,
} from "@/lib/map-geo";
import type { Location } from "@/types";

const THASSOS_CENTER: [number, number] = [40.68, 24.63];

const TILE_SOURCES = [
  {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
  },
  {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: "abc",
  },
] as const;

function FlyToSpot({
  location,
}: {
  location: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!location) return;
    map.flyTo([location.lat, location.lng], 12, { duration: 1.2 });
  }, [map, location?.lat, location?.lng]);
  return null;
}

function ResizableMap() {
  const map = useMap();
  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 100);
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);
  return null;
}

function ClusteredSpotMarkers({
  locations,
  selectedId,
  onSelect,
}: {
  locations: Location[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 36,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 12,
      iconCreateFunction: (group) => {
        const count = group.getChildCount();
        const size = count < 5 ? 36 : count < 10 ? 42 : 48;
        return L.divIcon({
          className: "discover-cluster-marker",
          html: `<div class="discover-cluster-bubble" style="width:${size}px;height:${size}px"><span>${count}</span></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      },
    });

    clusterRef.current = cluster;
    map.addLayer(cluster);

    return () => {
      map.removeLayer(cluster);
      clusterRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;

    cluster.clearLayers();

    for (const loc of locations) {
      const iconDef = spotMarkerIcon(loc.category, loc.id === selectedId);
      const marker = L.marker([loc.coordinates.lat, loc.coordinates.lng], {
        icon: L.divIcon(iconDef),
      });
      marker.on("click", () => onSelectRef.current(loc.id));
      cluster.addLayer(marker);
    }
  }, [locations, selectedId]);

  return null;
}

function AdaptiveTileLayer({
  onAllFailed,
}: {
  onAllFailed: (failed: boolean) => void;
}) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const errorStreak = useRef(0);
  const source = TILE_SOURCES[sourceIndex] ?? TILE_SOURCES[0];

  const handleTileError = useCallback(() => {
    errorStreak.current += 1;
    if (errorStreak.current >= 4) {
      errorStreak.current = 0;
      if (sourceIndex < TILE_SOURCES.length - 1) {
        setSourceIndex((i) => i + 1);
      } else {
        onAllFailed(true);
      }
    }
  }, [onAllFailed, sourceIndex]);

  useEffect(() => {
    onAllFailed(false);
    errorStreak.current = 0;
  }, [sourceIndex, onAllFailed]);

  return (
    <TileLayer
      key={source.url}
      url={source.url}
      attribution={source.attribution}
      subdomains={source.subdomains}
      maxZoom={19}
      eventHandlers={{ tileerror: handleTileError }}
    />
  );
}

interface DiscoverLeafletMapProps {
  locations: Location[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function DiscoverLeafletMap({
  locations,
  selectedId,
  onSelect,
}: DiscoverLeafletMapProps) {
  const [mounted, setMounted] = useState(false);
  const [tilesFailed, setTilesFailed] = useState(false);

  useEffect(() => setMounted(true), []);

  const selected = locations.find((l) => l.id === selectedId);
  const marinaIconDef = marinaMarkerIcon();

  if (!mounted) {
    return (
      <div className="map-sea-bg flex h-full min-h-[280px] items-center justify-center rounded-2xl">
        <p className="text-sm text-ds-text-secondary">Loading chart…</p>
      </div>
    );
  }

  return (
    <div className="map-sea-wrap relative h-full min-h-[280px] w-full overflow-hidden rounded-2xl">
      <MapContainer
        center={THASSOS_CENTER}
        zoom={10}
        minZoom={9}
        maxZoom={14}
        scrollWheelZoom
        className="map-sea-container h-full w-full rounded-2xl"
        style={{ height: "100%", minHeight: 280 }}
      >
        <AdaptiveTileLayer onAllFailed={setTilesFailed} />
        <ResizableMap />
        <FlyToSpot
          location={selected ? selected.coordinates : null}
        />
        <ClusteredSpotMarkers
          locations={locations}
          selectedId={selectedId}
          onSelect={onSelect}
        />
        <Marker
          position={[
            LIMENARIA_MARINA.coordinates.lat,
            LIMENARIA_MARINA.coordinates.lng,
          ]}
          icon={L.divIcon(marinaIconDef)}
        >
          <Popup>
            <p className="text-sm font-medium">{LIMENARIA_MARINA.name}</p>
            <p className="text-xs text-ds-text-muted">Your departure point</p>
          </Popup>
        </Marker>
      </MapContainer>

      {tilesFailed && (
        <div
          className="map-sea-bg pointer-events-none absolute inset-0 z-[8] flex flex-col items-center justify-center gap-2 rounded-2xl px-6 text-center"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-ds-text">Chart unavailable</p>
          <p className="max-w-xs text-xs text-ds-text-secondary">
            Map tiles could not load. Check your connection and refresh the page.
          </p>
        </div>
      )}

      <div className="map-sea-vignette pointer-events-none absolute inset-0 rounded-2xl" />
    </div>
  );
}
