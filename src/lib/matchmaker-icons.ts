import {
  Anchor,
  Calendar,
  Crown,
  Heart,
  MapPin,
  PartyPopper,
  Ship,
  Sparkles,
  Sun,
  Sunset,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  heart: Heart,
  users: Users,
  "party-popper": PartyPopper,
  sparkles: Sparkles,
  waves: Waves,
  anchor: Anchor,
  ship: Ship,
  sun: Sun,
  sunset: Sunset,
  crown: Crown,
  "map-pin": MapPin,
  calendar: Calendar,
};

export function getMatchmakerIcon(name?: string): LucideIcon {
  if (!name) return Sparkles;
  return ICON_MAP[name] ?? Sparkles;
}

export const NODE_ICONS: Record<string, LucideIcon> = {
  group: Users,
  "couple-vibe": Heart,
  "couple-final": Sparkles,
  "family-vibe": Sun,
  "family-final": Calendar,
  "party-vibe": PartyPopper,
};
