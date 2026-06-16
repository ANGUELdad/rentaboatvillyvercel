import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { BlogArticle } from "@/types";
import type { Locale } from "./types";

export interface BlogArticleTranslation {
  title: string;
  excerpt: string;
  content: string;
}

type BlogTranslationMap = Record<string, BlogArticleTranslation>;

const cache = new Map<Locale, BlogTranslationMap>();

function loadLocaleTranslations(locale: Locale): BlogTranslationMap | null {
  if (locale === "en") return null;

  const cached = cache.get(locale);
  if (cached) return cached;

  const path = join(process.cwd(), "data", "blog", "translations", `${locale}.json`);
  if (!existsSync(path)) return null;

  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as BlogTranslationMap;
    cache.set(locale, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function getBlogArticleTranslation(
  slug: string,
  locale: Locale,
): BlogArticleTranslation | null {
  const map = loadLocaleTranslations(locale);
  return map?.[slug] ?? null;
}

/** Apply locale-specific title, excerpt, and content when a static translation exists. */
export function localizeBlogArticle(
  article: BlogArticle,
  locale: Locale,
): BlogArticle {
  if (locale === "en") return article;

  const translation = getBlogArticleTranslation(article.slug, locale);
  if (!translation) return article;

  return {
    ...article,
    title: translation.title,
    excerpt: translation.excerpt,
    content: translation.content,
  };
}

export function localizeBlogArticles(
  articles: BlogArticle[],
  locale: Locale,
): BlogArticle[] {
  return articles.map((article) => localizeBlogArticle(article, locale));
}

export function countBlogTranslations(locale: Locale): number {
  const map = loadLocaleTranslations(locale);
  return map ? Object.keys(map).length : 0;
}
