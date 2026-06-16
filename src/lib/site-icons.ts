/**
 * Central icon map — SVG assets live in /public/icons (Lucide, ISC).
 * Use SiteIcon component for consistent sizing and color inheritance.
 */
export type SiteIconName =
  | "fleet"
  | "map"
  | "guide"
  | "experiences"
  | "reviews"
  | "booking"
  | "package"
  | "blog"
  | "faq"
  | "matchmaker"
  | "gallery"
  | "marina"
  | "fuel"
  | "safety"
  | "guests"
  | "waves"
  | "explore"
  | "sailboat"
  | "lifebuoy"
  | "clock"
  | "mail"
  | "phone"
  | "search";

export const SITE_ICON_SRC: Record<SiteIconName, string> = {
  fleet: "/icons/ship.svg",
  sailboat: "/icons/sailboat.svg",
  map: "/icons/map.svg",
  guide: "/icons/book-open.svg",
  experiences: "/icons/compass.svg",
  reviews: "/icons/star.svg",
  booking: "/icons/calendar-check.svg",
  package: "/icons/package.svg",
  blog: "/icons/file-text.svg",
  faq: "/icons/circle-help.svg",
  matchmaker: "/icons/anchor.svg",
  gallery: "/icons/image.svg",
  marina: "/icons/map-pin.svg",
  fuel: "/icons/fuel.svg",
  safety: "/icons/shield-check.svg",
  guests: "/icons/users.svg",
  waves: "/icons/waves.svg",
  explore: "/icons/sparkles.svg",
  lifebuoy: "/icons/life-buoy.svg",
  clock: "/icons/clock.svg",
  mail: "/icons/mail.svg",
  phone: "/icons/phone.svg",
  search: "/icons/search.svg",
};

const NAV_ICON: Record<string, SiteIconName> = {
  fleet: "fleet",
  map: "map",
  routes: "map",
  guide: "guide",
  experiences: "experiences",
  reviews: "reviews",
  booking: "booking",
  package: "package",
  blog: "blog",
  faq: "faq",
  matchmaker: "matchmaker",
  gallery: "gallery",
};

const EXPLORE_ICON: Record<string, SiteIconName> = {
  marina: "marina",
  fleet: "fleet",
  safety: "lifebuoy",
  fuel: "fuel",
  routes: "experiences",
  booking: "booking",
};

export function iconForKey(key: string): SiteIconName {
  return NAV_ICON[key] ?? EXPLORE_ICON[key] ?? "explore";
}
