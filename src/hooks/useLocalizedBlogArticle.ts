"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/providers/LanguageProvider";
import type { BlogArticle } from "@/types";

const sessionCache = new Map<string, BlogArticleTranslation>();

interface BlogArticleTranslation {
  title: string;
  excerpt: string;
  content: string;
}

export function useLocalizedBlogArticle(article: BlogArticle): BlogArticle {
  const { locale } = useI18n();
  const [translation, setTranslation] = useState<BlogArticleTranslation | null>(
    null,
  );

  const cacheKey = useMemo(
    () => `${locale}:${article.slug}`,
    [locale, article.slug],
  );

  useEffect(() => {
    if (locale === "en") {
      setTranslation(null);
      return;
    }

    const cached = sessionCache.get(cacheKey);
    if (cached) {
      setTranslation(cached);
      return;
    }

    let cancelled = false;
    void fetch(
      `/api/i18n/blog?locale=${encodeURIComponent(locale)}&slug=${encodeURIComponent(article.slug)}`,
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { fields?: BlogArticleTranslation } | null) => {
        if (cancelled || !data?.fields) return;
        sessionCache.set(cacheKey, data.fields);
        setTranslation(data.fields);
      })
      .catch(() => {
        /* fall back to English */
      });

    return () => {
      cancelled = true;
    };
  }, [locale, article.slug, cacheKey]);

  if (!translation) return article;

  return {
    ...article,
    title: translation.title,
    excerpt: translation.excerpt,
    content: translation.content,
  };
}
