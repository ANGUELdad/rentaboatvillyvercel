export type BlogCategoryId =
  | "all"
  | "guides"
  | "beaches"
  | "routes"
  | "rental"
  | "thassos";

export interface BlogCategory {
  id: BlogCategoryId;
  labelKey: string;
  descriptionKey: string;
  seoKeywords: string[];
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: "guides",
    labelKey: "categoryGuides",
    descriptionKey: "categoryGuidesDesc",
    seoKeywords: ["Thassos boat guide", "rent a boat Limenaria", "boat rental tips Greece"],
  },
  {
    id: "beaches",
    labelKey: "categoryBeaches",
    descriptionKey: "categoryBeachesDesc",
    seoKeywords: ["Thassos beaches by boat", "Marble Beach Saliara", "Golden Beach Chrisi Akti"],
  },
  {
    id: "routes",
    labelKey: "categoryRoutes",
    descriptionKey: "categoryRoutesDesc",
    seoKeywords: ["Thassos boat routes", "south coast itinerary", "marine GPS Thassos"],
  },
  {
    id: "rental",
    labelKey: "categoryRental",
    descriptionKey: "categoryRentalDesc",
    seoKeywords: ["Thassos boat rental prices", "no licence boat Greece", "hourly boat hire"],
  },
  {
    id: "thassos",
    labelKey: "categoryThassos",
    descriptionKey: "categoryThassosDesc",
    seoKeywords: ["Thassos island news", "Limenaria marina", "Rent A Boat Villy"],
  },
];

export const DEFAULT_BLOG_CATEGORY: Exclude<BlogCategoryId, "all"> = "guides";

export function isBlogCategoryId(value: string): value is Exclude<BlogCategoryId, "all"> {
  return BLOG_CATEGORIES.some((c) => c.id === value);
}

export function getBlogCategory(id: string | null | undefined) {
  if (!id || id === "all") return null;
  return BLOG_CATEGORIES.find((c) => c.id === id) ?? null;
}

export function parseBlogCategoryParam(
  value: string | undefined,
): BlogCategoryId {
  if (!value || value === "all") return "all";
  return isBlogCategoryId(value) ? value : "all";
}
