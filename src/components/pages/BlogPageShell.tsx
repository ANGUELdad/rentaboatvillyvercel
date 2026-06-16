"use client";

import { BlogPageExperience } from "@/components/blog/BlogPageExperience";
import { PageShell } from "@/components/layout/PageShell";
import {
  getBlogCategory,
  parseBlogCategoryParam,
  type BlogCategoryId,
} from "@/lib/blog-categories";
import { useI18n } from "@/providers/LanguageProvider";
import type { BlogArticle } from "@/types";

export function BlogPageShell({
  articles,
  activeCategory = "all",
}: {
  articles: BlogArticle[];
  activeCategory?: BlogCategoryId;
}) {
  const { t } = useI18n();
  const blog = t.blog;
  const category = parseBlogCategoryParam(activeCategory);
  const catMeta = category !== "all" ? getBlogCategory(category) : null;

  return (
    <PageShell
      accent="emerald"
      eyebrow={blog.eyebrow ?? "Thassos Boat News"}
      title={
        catMeta
          ? String(blog[catMeta.labelKey] ?? blog.title)
          : (blog.title ?? "Thassos Boat News")
      }
      subtitle={
        catMeta
          ? String(blog[catMeta.descriptionKey] ?? blog.subtitle)
          : (blog.subtitle ??
            "Hourly boat rental guides, beach reports, sea routes & island updates from New Port of Limenaria.")
      }
    >
      <BlogPageExperience articles={articles} activeCategory={category} />
    </PageShell>
  );
}
