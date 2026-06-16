"use client";

import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { BlogCategoryBadge } from "@/components/blog/BlogCategoryBadge";
import { SafeImage } from "@/components/SafeImage";
import { useLocalizedBlogArticle } from "@/hooks/useLocalizedBlogArticle";
import { estimateReadMinutes, formatBlogDate } from "@/lib/blog-utils";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/LanguageProvider";
import type { BlogArticle } from "@/types";

function BlogMeta({
  date,
  minutes,
  className,
}: {
  date: string;
  minutes: number;
  className?: string;
}) {
  const { t, locale } = useI18n();
  const readLabel =
    (t.blog.readTime ?? "{minutes} min read").replace("{minutes}", String(minutes));

  return (
    <p className={cn("blog-card-meta", className)}>
      <time dateTime={date}>{formatBlogDate(date, locale)}</time>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3 shrink-0 opacity-70" aria-hidden />
        {readLabel}
      </span>
    </p>
  );
}

export function BlogFeaturedCard({
  article,
  variant = "default",
}: {
  article: BlogArticle;
  variant?: "default" | "lead";
}) {
  const localized = useLocalizedBlogArticle(article);
  const { t } = useI18n();
  const minutes = estimateReadMinutes(localized.content);
  const isLead = variant === "lead";

  return (
    <Link
      href={`/blog/${article.slug}`}
      className={cn(
        "blog-featured glass-elevated tap-target group",
        isLead && "blog-featured--lead",
      )}
    >
      <div className="blog-featured__media">
        <SafeImage
          src={article.coverImage}
          alt={localized.title}
          fill
          sizes={isLead ? "(max-width: 1024px) 100vw, 1100px" : "(max-width: 1024px) 100vw, 60vw"}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          priority
        />
        <div className="blog-featured__shade" aria-hidden />
      </div>
      <div className="blog-featured__body">
        <div className="blog-featured__labels">
          <span className="blog-featured__label">
            {t.blog.featured ?? "Featured"}
          </span>
          <BlogCategoryBadge categoryId={article.category} variant="light" />
        </div>
        <BlogMeta date={article.createdAt} minutes={minutes} className="blog-card-meta--light" />
        <h2 className="blog-featured__title" id={isLead ? "blog-lead-heading" : undefined}>
          {localized.title}
        </h2>
        <p className="blog-featured__excerpt">{localized.excerpt}</p>
        <span className="blog-featured__cta">
          {t.blog.readArticle ?? "Read article"}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function BlogCard({
  article,
  variant = "default",
}: {
  article: BlogArticle;
  variant?: "default" | "headline" | "section-lead";
}) {
  const localized = useLocalizedBlogArticle(article);
  const { t } = useI18n();
  const minutes = estimateReadMinutes(localized.content);

  return (
    <Link
      href={`/blog/${article.slug}`}
      className={cn(
        "blog-card glass-card tap-target group",
        variant === "headline" && "blog-card--headline",
        variant === "section-lead" && "blog-card--section-lead",
      )}
    >
      <div className="blog-card__media">
        <SafeImage
          src={article.coverImage}
          alt={localized.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="blog-card__body">
        <BlogCategoryBadge categoryId={article.category} />
        <BlogMeta date={article.createdAt} minutes={minutes} />
        <h3 className="blog-card__title">{localized.title}</h3>
        <p className="blog-card__excerpt">{localized.excerpt}</p>
        <span className="blog-card__link">
          {t.blog.readArticle ?? "Read article"}
          <ArrowRight className="size-3.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
