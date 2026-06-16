import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { Location } from "@/types";
import type { Locale } from "@/lib/i18n/types";

export interface LocationTranslation {
  name: string;
  tagline: string;
  description: string;
}

type LocationTranslationMap = Record<string, LocationTranslation>;

const cache = new Map<Locale, LocationTranslationMap>();

function loadLocaleTranslations(locale: Locale): LocationTranslationMap | null {
  if (locale === "en") return null;

  const cached = cache.get(locale);
  if (cached) return cached;

  const path = join(
    process.cwd(),
    "data",
    "locations",
    "translations",
    `${locale}.json`,
  );
  if (!existsSync(path)) return null;

  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as LocationTranslationMap;
    cache.set(locale, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function localizeLocation(
  location: Location,
  locale: Locale,
): Location {
  if (locale === "en") return location;

  const map = loadLocaleTranslations(locale);
  const translation = map?.[location.id];
  if (!translation) return location;

  return {
    ...location,
    name: translation.name,
    tagline: translation.tagline,
    description: translation.description,
  };
}

export function getLocalizedLocations(
  locations: Location[],
  locale: Locale,
): Location[] {
  return locations.map((location) => localizeLocation(location, locale));
}
