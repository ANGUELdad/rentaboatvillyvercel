"use client";

import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { BlogArticleNav } from "@/components/blog/BlogArticleNav";
import { BlogCategoryBadge } from "@/components/blog/BlogCategoryBadge";
import { BlogRelated } from "@/components/blog/BlogRelated";
import { SafeImage } from "@/components/SafeImage";
import { useLocalizedBlogArticle } from "@/hooks/useLocalizedBlogArticle";
import { estimateReadMinutes } from "@/lib/blog-utils";
import { sanitizeBlogHtml } from "@/lib/security/sanitize";
import { useI18n } from "@/providers/LanguageProvider";
import type { BlogArticle } from "@/types";

export function BlogArticleView({
  article,
  date,
  related = [],
}: {
  article: BlogArticle;
  date: string;
  related?: BlogArticle[];
}) {
  const localized = useLocalizedBlogArticle(article);
  const { t } = useI18n();
  const blog = t.blog;
  const minutes = estimateReadMinutes(localized.content);
  const readLabel =
    (blog.readTime ?? "{minutes} min read").replace("{minutes}", String(minutes));

  return (
    <article className="blog-article blog-article--full">
      <div className="blog-article__shell blog-article__shell--wide">
        <BlogArticleNav title={localized.title} />

        <header className="blog-article__hero blog-article__hero--full">
          <div className="blog-article__hero-media blog-article__hero-media--full">
            <SafeImage
              src={article.coverImage}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover"
              priority
            />
            <div className="blog-article__hero-shade" aria-hidden />
          </div>
          <div className="blog-article__hero-copy blog-article__hero-copy--full">
            <div className="blog-article__hero-labels">
              <BlogCategoryBadge categoryId={article.category} variant="light" />
              <span className="blog-article__source">
                {blog.newsKicker ?? "Thassos Boat News"} · Rent A Boat Villy
              </span>
            </div>
            <p className="blog-article__meta">
              <time dateTime={article.createdAt}>{date}</time>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5 shrink-0" aria-hidden />
                {readLabel}
              </span>
            </p>
            <h1 className="blog-article__title blog-article__title--full">
              {localized.title}
            </h1>
            <p className="blog-article__dek blog-article__dek--full">{localized.excerpt}</p>
          </div>
        </header>

        <div
          className="blog-prose blog-prose--full"
          dangerouslySetInnerHTML={{
            __html: sanitizeBlogHtml(localized.content),
          }}
        />

        <BlogRelated articles={related} />

        <footer className="blog-article__footer blog-article__footer--full">
          <p className="blog-article__footer-text">
            {blog.articleCta ??
              "Ready to explore Thassos by boat? Pick your boat and hours — request pricing at New Port of Limenaria."}
          </p>
          <div className="blog-article__footer-actions">
            <Link href="/package" className="btn-app-primary ui-btn-label blog-article__cta">
              {t.packageBuilder?.requestCta ?? t.package?.cta ?? "Request pricing"}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="/fleet" className="blog-article__cta-secondary tap-target">
              {t.nav.fleet}
            </Link>
          </div>
        </footer>
      </div>
    </article>
  );
}
