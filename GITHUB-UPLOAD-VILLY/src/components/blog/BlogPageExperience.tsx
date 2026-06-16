"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, ChevronRight, HelpCircle, Ship } from "lucide-react";
import Link from "next/link";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogCategoryNav } from "@/components/blog/BlogCategoryBadge";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { BLOG_CATEGORIES, type BlogCategoryId } from "@/lib/blog-categories";
import { useI18n } from "@/providers/LanguageProvider";
import type { BlogArticle } from "@/types";

export function BlogPageExperience({
  articles,
  activeCategory = "all",
}: {
  articles: BlogArticle[];
  activeCategory?: BlogCategoryId;
}) {
  const { t } = useI18n();
  const blog = t.blog;
  const page = blog.page ?? {};
  const reduceMotion = useReducedMotion();

  const activeCatMeta = BLOG_CATEGORIES.find((c) => c.id === activeCategory);
  const activeCategoryLabel = activeCatMeta
    ? String(blog[activeCatMeta.labelKey] ?? activeCategory)
    : null;

  if (articles.length === 0) {
    return (
      <p className="blog-empty text-center text-sm text-ds-text-muted">
        {blog.empty ?? "Articles coming soon."}
      </p>
    );
  }

  const GridWrap = reduceMotion ? "div" : motion.div;
  const gridVariants = reduceMotion ? undefined : staggerContainer;
  const itemVariants = reduceMotion ? undefined : staggerItem;

  return (
    <div className="blog-studio">
      <nav className="blog-studio__trail" aria-label={page.trailAria ?? "Breadcrumb"}>
        <ol className="blog-studio__trail-list">
          <li className="blog-studio__trail-item">
            <Link href="/" className="blog-studio__trail-link">
              {page.trailHome ?? "Home"}
            </Link>
          </li>
          <li className="blog-studio__trail-item" aria-hidden>
            <ChevronRight className="blog-studio__trail-sep size-3" />
          </li>
          <li className="blog-studio__trail-item">
            {activeCategory === "all" ? (
              <span className="blog-studio__trail-current" aria-current="page">
                {page.trailBlog ?? blog.title ?? "Blog"}
              </span>
            ) : (
              <Link href="/blog" className="blog-studio__trail-link">
                {page.trailBlog ?? blog.title ?? "Blog"}
              </Link>
            )}
          </li>
          {activeCategoryLabel ? (
            <>
              <li className="blog-studio__trail-item" aria-hidden>
                <ChevronRight className="blog-studio__trail-sep size-3" />
              </li>
              <li className="blog-studio__trail-item">
                <span className="blog-studio__trail-current" aria-current="page">
                  {activeCategoryLabel}
                </span>
              </li>
            </>
          ) : null}
        </ol>
      </nav>

      <div className="blog-studio__nav-sticky">
        <BlogCategoryNav active={activeCategory} />
      </div>

      <nav
        className="blog-studio__quick"
        aria-label={page.quickLinksAria ?? "Quick links"}
      >
        <Link href="/guide" className="blog-studio__quick-chip tap-target tap-target--pill">
          <BookOpen className="size-3.5 shrink-0 text-ds-brand" aria-hidden />
          <span className="blog-studio__quick-chip-label">
            {page.quickGuide ?? "Sea guide"}
          </span>
        </Link>
        <Link href="/booking" className="blog-studio__quick-chip tap-target tap-target--pill">
          <Ship className="size-3.5 shrink-0 text-ds-brand" aria-hidden />
          <span className="blog-studio__quick-chip-label">
            {page.quickBooking ?? "Request booking"}
          </span>
        </Link>
        <Link href="/faq" className="blog-studio__quick-chip tap-target tap-target--pill">
          <HelpCircle className="size-3.5 shrink-0 text-ds-brand" aria-hidden />
          <span className="blog-studio__quick-chip-label">
            {page.quickFaq ?? "FAQ"}
          </span>
        </Link>
      </nav>

      <section className="blog-studio__body" aria-label={blog.latestAria ?? "Latest articles"}>
        <GridWrap
          className="even-grid even-grid--3 blog-index__grid"
          {...(!reduceMotion && {
            initial: "hidden",
            animate: "visible",
            variants: gridVariants,
          })}
        >
          {articles.map((article) => {
            const ItemWrap = reduceMotion ? "div" : motion.div;
            return (
              <ItemWrap key={article.id} variants={itemVariants}>
                <BlogCard article={article} />
              </ItemWrap>
            );
          })}
        </GridWrap>
      </section>
    </div>
  );
}
