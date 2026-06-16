"use client";

import Link from "next/link";
import { BLOG_CATEGORIES, type BlogCategoryId } from "@/lib/blog-categories";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/LanguageProvider";

export function BlogCategoryBadge({
  categoryId,
  className,
  variant = "default",
}: {
  categoryId: string;
  className?: string;
  variant?: "default" | "light" | "outline";
}) {
  const { t } = useI18n();
  const cat = BLOG_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return null;
  const label = String(t.blog[cat.labelKey] ?? categoryId);

  return (
    <span
      className={cn(
        "blog-category-badge",
        variant === "light" && "blog-category-badge--light",
        variant === "outline" && "blog-category-badge--outline",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function BlogCategoryNav({
  active,
  basePath = "/blog",
}: {
  active: BlogCategoryId;
  basePath?: string;
}) {
  const { t } = useI18n();
  const blog = t.blog;

  const items: { id: BlogCategoryId; label: string }[] = [
    { id: "all", label: blog.categoryAll ?? "All news" },
    ...BLOG_CATEGORIES.map((c) => ({
      id: c.id,
      label: String(blog[c.labelKey] ?? c.id),
    })),
  ];

  return (
    <nav
      className="blog-studio__filters scrollbar-none"
      aria-label={blog.categoriesAria ?? "Article categories"}
    >
      {items.map((item) => {
        const href = item.id === "all" ? basePath : `${basePath}?category=${item.id}`;
        const isActive = active === item.id;
        return (
          <Link
            key={item.id}
            href={href}
            scroll={false}
            className={cn(
              "blog-studio__filter-chip tap-target tap-target--pill",
              isActive && "blog-studio__filter-chip--active",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
