import { MARINA_LOCATION } from "@/lib/site";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://thassosboats.gr";

export const SITE_NAME = "Rent A Boat Villy";
export const SITE_BRAND = "Rent A Boat Villy";
export const SITE_TAGLINE = "Private boat rental & day trips from New Port of Limenaria, Thassos, Greece";

/** Primary keywords — "rent a boat Thassos" first */
export const PRIMARY_KEYWORDS = [
  "rent a boat Thassos",
  "rent a boat in Thassos",
  "rent a boat in Thassos Greece",
  "boat rental Thassos",
  "Thassos boat rental",
  "Thassos boat hire",
  "New Port of Limenaria boat rental",
  "no license boat Thassos 30HP",
  "boat rental Greece no licence",
  "private boat rental Thassos",
  "speedboat rental Thassos",
  "day cruise Thassos Greece",
  "Aegean boat rental",
  "Thassos speedboat rental",
  "Tripiti cave boat Thassos",
  "Metalia beach boat",
  "Golden Beach Thassos boat",
  "Marble Beach boat rental",
  "Aliki Thassos boat trip",
  "boat accessible beaches Thassos",
  "Thassos motorboat rental",
  "rent a boat Limenaria",
  "ενοικίαση βάρκας Θάσος",
  "ενοικίαση βάρκας Λιμενάρια",
] as const;

export const HREFLANG_LOCALES = ["en", "el"] as const;

export const GEO = {
  latitude: MARINA_LOCATION.coordinates.lat,
  longitude: MARINA_LOCATION.coordinates.lng,
  locality: "Limenaria",
  region: "Thassos",
  country: "GR",
} as const;
