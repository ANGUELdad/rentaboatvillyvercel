import { getEnglishDictionary } from "@/lib/i18n/dictionary";

/**
 * Keyword-first titles & descriptions tuned for Thassos boat rental search intent.
 * Source of truth lives in data/locales/en.json → seo.pages; this re-exports English.
 */
const { pages } = getEnglishDictionary().seo;

export const PAGE_SEO = pages;

export function boatPageSeo(boat: {
  name: string;
  description: string;
  pax: number;
  hp?: number;
}) {
  const { boat: templates } = getEnglishDictionary().seo;
  const title = templates.title.replace("{name}", boat.name);
  const description = templates.description
    .replace("{name}", boat.name)
    .replace("{pax}", String(boat.pax))
    .replace("{desc}", boat.description);
  return {
    title,
    description: description.slice(0, 160),
    keywords: templates.keywords
      .replace("{name}", boat.name)
      .replace("{pax}", String(boat.pax)),
  };
}
