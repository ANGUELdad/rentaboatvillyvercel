/** Visual presets for curated experience cards (index matches i18n items[]) */
export const EXPERIENCE_PRESETS = [
  {
    image: "/images/boats/poseidon-sea.jpg",
    hours: 4,
    tagKey: "sunset" as const,
  },
  {
    image: "/images/boats/kima.jpg",
    hours: 4,
    tagKey: "snorkel" as const,
  },
  {
    image: "/images/boats/nikoleta.jpg",
    hours: 8,
    tagKey: "fullday" as const,
  },
  {
    image: "/images/boats/basilios.jpg",
    hours: 6,
    tagKey: "celebration" as const,
  },
] as const;

export function experiencePackageHref(preset: (typeof EXPERIENCE_PRESETS)[number]) {
  const qs = new URLSearchParams({
    hours: String(preset.hours),
  });
  return `/booking?${qs}`;
}
