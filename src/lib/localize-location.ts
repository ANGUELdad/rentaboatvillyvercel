import type { GuideStrings } from "@/lib/i18n/types";
import type { Location } from "@/types";

const CATEGORY_KEYS: Record<
  Location["category"],
  keyof Pick<
    GuideStrings,
    "categoryBeach" | "categoryLagoon" | "categoryCulture" | "categoryHarbor"
  >
> = {
  beach: "categoryBeach",
  lagoon: "categoryLagoon",
  culture: "categoryCulture",
  harbor: "categoryHarbor",
};

export function getLocalizedLocation(
  location: Location,
  guide: GuideStrings,
): Location {
  const spot = guide.spots?.[location.id];
  if (!spot) return location;

  return {
    ...location,
    name: spot.name ?? location.name,
    tagline: spot.tagline ?? location.tagline,
    description: spot.description ?? location.description,
  };
}

export function getLocalizedCategoryLabel(
  category: Location["category"],
  guide: GuideStrings,
): string {
  const label = guide[CATEGORY_KEYS[category]];
  return label ?? category;
}
