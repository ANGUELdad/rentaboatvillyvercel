"use client";

import { HomeFleetDeck } from "@/components/home/HomeFleetDeck";
import type { PublicBoat } from "@/types";

interface VesselPickerSectionProps {
  boats: PublicBoat[];
  className?: string;
}

export function VesselPickerSection({
  boats,
  className = "",
}: VesselPickerSectionProps) {
  return <HomeFleetDeck boats={boats} className={className} />;
}
