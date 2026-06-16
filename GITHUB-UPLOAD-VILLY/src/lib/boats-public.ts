import type { Boat, PublicBoat } from "@/types";

/** Strip admin-only pricing fields before serializing boats to the browser. */
export function toPublicBoat(boat: Boat): PublicBoat {
  const { pricePerHour: _price, currency: _currency, ...rest } = boat;
  return rest;
}

export function toPublicBoats(boats: Boat[]): PublicBoat[] {
  return boats.map(toPublicBoat);
}
