"use client";

import Link from "next/link";
import { BlogCategoryBadge } from "@/components/blog/BlogCategoryBadge";
import { SafeImage } from "@/components/SafeImage";
import { useLocalizedBlogArticle } from "@/hooks/useLocalizedBlogArticle";
import { useI18n } from "@/providers/LanguageProvider";
import type { BlogArticle } from "@/types";

function RelatedCard({ article }: { article: BlogArticle }) {
  const localized = useLocalizedBlogArticle(article);

  return (
    <Link href={`/blog/${article.slug}`} className="blog-related-card tap-target group">
      <div className="blog-related-card__media">
        <SafeImage
          src={article.coverImage}
          alt={localized.title}
          fill
          sizes="(max-width: 640px) 40vw, 200px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="blog-related-card__body">
        <BlogCategoryBadge categoryId={article.category} variant="outline" />
        <h3 className="blog-related-card__title">{localized.title}</h3>
      </div>
    </Link>
  );
}

export function BlogRelated({ articles }: { articles: BlogArticle[] }) {
  const { t } = useI18n();
  const blog = t.blog;

  if (articles.length === 0) return null;

  return (
    <section className="blog-related" aria-labelledby="blog-related-heading">
      <h2 id="blog-related-heading" className="blog-related__title">
        {blog.relatedTitle ?? "More from Thassos Boat News"}
      </h2>
      <div className="blog-related__grid">
        {articles.map((article) => (
          <RelatedCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
