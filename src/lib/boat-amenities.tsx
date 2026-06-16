import {
  Anchor,
  Bluetooth,
  Check,
  Droplets,
  Fuel,
  MapPin,
  Music,
  Shield,
  Snowflake,
  Sun,
  Table2,
  Umbrella,
  Waves,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "sun-deck": Sun,
  bimini: Umbrella,
  bluetooth: Bluetooth,
  cooler: Snowflake,
  "fuel-included": Fuel,
  "life-jackets": Shield,
  snorkel: Waves,
  anchor: Anchor,
  shower: Droplets,
  table: Table2,
  wc: Droplets,
  "no-license": Check,
  music: Music,
  marina: MapPin,
};

export function getAmenityIcon(id: string): LucideIcon {
  return ICONS[id] ?? Check;
}
