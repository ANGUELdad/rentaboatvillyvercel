"use client";

import { useMemo } from "react";
import { getLocalizedLocation } from "@/lib/localize-location";
import { useI18n } from "@/providers/LanguageProvider";
import type { Location } from "@/types";

/** Re-apply guide spot copy when the UI locale changes (client-side). */
export function useGuideLocalizedLocations(locations: Location[]): Location[] {
  const { t, locale } = useI18n();

  return useMemo(
    () => locations.map((location) => getLocalizedLocation(location, t.guide)),
    [locations, t.guide, locale],
  );
}
