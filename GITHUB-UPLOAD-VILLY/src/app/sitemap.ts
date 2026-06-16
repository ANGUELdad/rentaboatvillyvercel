import type { MetadataRoute } from "next";
import { getBoats } from "@/lib/data";
import { SITE_URL } from "@/lib/seo/config";
import { hreflangAlternates } from "@/lib/seo/locale-meta";

const PRIORITY: Record<string, number> = {
  "": 1,
  "/rent-a-boat-thassos": 0.98,
  "/fleet": 0.95,
  "/booking": 0.9,
  "/reviews": 0.85,
  "/faq": 0.85,
  "/map": 0.8,
  "/guide": 0.8,
  "/experiences": 0.75,
};

const CHANGE_FREQ: Record<
  string,
  MetadataRoute.Sitemap[number]["changeFrequency"]
> = {
  "": "weekly",
  "/fleet": "weekly",
  "/booking": "weekly",
};

function sitemapEntry(path: string, lastModified: Date) {
  return {
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: CHANGE_FREQ[path] ?? ("monthly" as const),
    priority: PRIORITY[path] ?? 0.7,
    alternates: {
      languages: hreflangAlternates(path),
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const boats = getBoats();
  const now = new Date();

  // Only canonical 200 routes — /blog and /matchmaker are 301/308 redirects
  // (see next.config.ts) and must not appear in the sitemap.
  const indexableRoutes = [
    "",
    "/rent-a-boat-thassos",
    "/fleet",
    "/map",
    "/guide",
    "/experiences",
    "/reviews",
    "/booking",
    "/faq",
  ];

  return [
    ...indexableRoutes.map((path) => sitemapEntry(path, now)),
    ...boats.map((b) =>
      sitemapEntry(`/fleet/${b.id}`, now),
    ),
  ];
}
