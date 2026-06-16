import type { ContentRowItem } from "@/types/content-row";
import type { PublicBoat, Location } from "@/types";

const EXPERIENCE_IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  "https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=800&q=80",
];

export function boatsToContentRowItems(
  boats: PublicBoat[],
  specLabels?: {
    pax: string;
    hp: string;
  },
): ContentRowItem[] {
  return boats.map((boat) => boatToContentRowItem(boat, specLabels));
}

export function boatToContentRowItem(
  boat: PublicBoat,
  specLabels?: {
    pax: string;
    hp: string;
  },
): ContentRowItem {
  const paxLabel = specLabels?.pax ?? "{count} pax";
  const hpLabel = specLabels?.hp ?? "{count} HP";

  return {
    id: boat.id,
    title: boat.name,
    image: boat.image,
    href: `/fleet/${boat.id}`,
    badge: boat.tagline,
    specs: [
      paxLabel.replace("{count}", String(boat.pax)),
      boat.hp ? hpLabel.replace("{count}", String(boat.hp)) : null,
    ].filter(Boolean) as string[],
  };
}

export function locationsToContentRowItems(
  locations: Location[],
): ContentRowItem[] {
  return locations.map(locationToContentRowItem);
}

export function locationToContentRowItem(location: Location): ContentRowItem {
  const category =
    location.category.charAt(0).toUpperCase() + location.category.slice(1);

  return {
    id: location.id,
    title: location.name,
    image: location.image,
    href: "/map",
    subtitle: location.tagline,
    badge: category,
    specs: [category],
  };
}

export function experiencesToContentRowItems(
  items: { title: string; desc: string }[],
): ContentRowItem[] {
  return items.map((item, index) => ({
    id: `experience-${index}`,
    title: item.title,
    image: EXPERIENCE_IMAGES[index % EXPERIENCE_IMAGES.length],
    href: "/booking",
    subtitle: item.desc,
  }));
}
