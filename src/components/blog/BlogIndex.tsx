"use client";

import { BlogNewsIndex } from "@/components/blog/BlogNewsIndex";
import type { BlogCategoryId } from "@/lib/blog-categories";
import type { BlogArticle } from "@/types";

export function BlogIndex({
  articles,
  activeCategory = "all",
}: {
  articles: BlogArticle[];
  activeCategory?: BlogCategoryId;
}) {
  return <BlogNewsIndex articles={articles} activeCategory={activeCategory} />;
}
