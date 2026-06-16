import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getTranslatedDictionary } from "@/lib/i18n/server";
import type { Locale, LocaleStrings } from "@/lib/i18n/types";
import { translateString } from "@/lib/i18n/translator";
import { createPageMetadata, type PageMetaOptions } from "./metadata";

export type SeoPageKey = keyof LocaleStrings["seo"]["pages"];

type BuildOptions = Omit<PageMetaOptions, "title" | "description"> & {
  lang?: string | null;
  title?: string;
  description?: string;
  keywords?: string;
};

export async function buildPageMetadata(
  page: SeoPageKey,
  path: string,
  options: BuildOptions = {},
): Promise<Metadata> {
  const locale = await getRequestLocale(options.lang);
  const dict = await getTranslatedDictionary(locale);
  const pageSeo = dict.seo.pages[page];

  return createPageMetadata({
    title: options.title ?? pageSeo.title,
    description: options.description ?? pageSeo.description,
    keywords: options.keywords ?? pageSeo.keywords,
    path,
    locale,
    image: options.image,
    type: options.type,
    publishedTime: options.publishedTime,
    modifiedTime: options.modifiedTime,
    noindex: options.noindex,
  });
}

export async function buildBoatMetadata(
  boat: {
    name: string;
    description: string;
    pricePerHour: number;
    currency: string;
    pax: number;
    hp?: number;
    image: string;
    id: string;
  },
  lang?: string | null,
): Promise<Metadata> {
  const locale = await getRequestLocale(lang);
  const dict = await getTranslatedDictionary(locale);
  const templates = dict.seo.boat;

  const fields = {
    title: templates.title.replace("{name}", boat.name),
    description: templates.description
      .replace("{name}", boat.name)
      .replace("{pax}", String(boat.pax))
      .replace("{desc}", boat.description),
    keywords: templates.keywords
      .replace("{name}", boat.name)
      .replace("{pax}", String(boat.pax)),
  };

  const localized =
    locale === "en"
      ? fields
      : {
          title: await translateString(fields.title, locale, "seo_title"),
          description: await translateString(
            fields.description,
            locale,
            "seo_desc",
          ),
          keywords: await translateString(fields.keywords, locale, "seo_desc"),
        };

  return createPageMetadata({
    title: localized.title,
    description: localized.description.slice(0, 160),
    keywords: localized.keywords,
    path: `/fleet/${boat.id}`,
    locale,
    image: boat.image,
  });
}

export async function buildBlogArticleMetadata(
  article: {
    title: string;
    excerpt: string;
    slug: string;
    coverImage?: string | null;
    createdAt: string;
  },
  lang?: string | null,
): Promise<Metadata> {
  const locale = await getRequestLocale(lang);
  const dict = await getTranslatedDictionary(locale);

  const fields =
    locale === "en"
      ? { title: article.title, excerpt: article.excerpt }
      : {
          title: await translateString(article.title, locale, "blog_title"),
          excerpt: await translateString(article.excerpt, locale, "blog_excerpt"),
        };

  return createPageMetadata({
    title: `${fields.title} ${dict.seo.blogArticle.titleSuffix}`,
    description: fields.excerpt,
    path: `/blog/${article.slug}`,
    locale,
    image: article.coverImage ?? undefined,
    type: "article",
    publishedTime: article.createdAt,
  });
}

/** Resolve translated page SEO strings for JSON-LD (server components). */
export async function getLocalizedPageSeo(
  page: SeoPageKey,
  lang?: string | null,
): Promise<{ locale: Locale; title: string; description: string }> {
  const locale = await getRequestLocale(lang);
  const dict = await getTranslatedDictionary(locale);
  const pageSeo = dict.seo.pages[page];
  return {
    locale,
    title: pageSeo.title,
    description: pageSeo.description,
  };
}
