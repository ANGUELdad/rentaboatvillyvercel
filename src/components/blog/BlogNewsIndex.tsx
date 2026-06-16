"use client";

import { BlogPageExperience } from "@/components/blog/BlogPageExperience";
import type { BlogCategoryId } from "@/lib/blog-categories";
import type { BlogArticle } from "@/types";

export function BlogNewsIndex({
  articles,
  activeCategory = "all",
}: {
  articles: BlogArticle[];
  activeCategory?: BlogCategoryId;
}) {
  return (
    <BlogPageExperience articles={articles} activeCategory={activeCategory} />
  );
}
