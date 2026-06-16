"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/providers/LanguageProvider";

export function BlogArticleNav({ title }: { title?: string }) {
  const { t } = useI18n();

  return (
    <nav className="blog-article-nav" aria-label="Article navigation">
      <Link href="/blog" className="blog-article-nav__back tap-target">
        <ChevronLeft className="size-4 shrink-0" aria-hidden />
        {t.blog.back}
      </Link>
      {title && (
        <p className="blog-article-nav__crumb">
          <span className="text-ds-text-muted">{t.blog.title}</span>
          <span aria-hidden> / </span>
          <span className="truncate text-ds-text">{title}</span>
        </p>
      )}
    </nav>
  );
}
