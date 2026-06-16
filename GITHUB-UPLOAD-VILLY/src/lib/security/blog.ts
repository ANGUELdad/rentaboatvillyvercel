import { DEFAULT_BLOG_CATEGORY, isBlogCategoryId } from "@/lib/blog-categories";
import { sanitizeBlogHtml } from "./sanitize";
import {
  isAllowedCoverImage,
  isValidSlug,
  LIMITS,
  trimField,
} from "./validate";

export type BlogInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  published: boolean;
};

export function parseBlogInput(
  body: Record<string, unknown>,
): { ok: true; data: BlogInput } | { ok: false; error: string } {
  const title = trimField(body.title, LIMITS.title);
  const slug = trimField(body.slug, LIMITS.slug);
  const excerpt = trimField(body.excerpt, LIMITS.excerpt);
  const contentRaw = trimField(body.content, LIMITS.content);
  const coverImage = trimField(body.coverImage ?? "", 500) ?? "";
  const categoryRaw = trimField(body.category ?? DEFAULT_BLOG_CATEGORY, 32) ?? DEFAULT_BLOG_CATEGORY;
  const category = isBlogCategoryId(categoryRaw) ? categoryRaw : DEFAULT_BLOG_CATEGORY;

  if (!title || !slug || !excerpt || !contentRaw) {
    return { ok: false, error: "All required fields must be provided" };
  }

  if (!isValidSlug(slug)) {
    return { ok: false, error: "Slug must be lowercase letters, numbers, and hyphens" };
  }

  if (!isAllowedCoverImage(coverImage)) {
    return { ok: false, error: "Cover image must be an https://images.unsplash.com URL" };
  }

  return {
    ok: true,
    data: {
      title,
      slug,
      excerpt,
      content: sanitizeBlogHtml(contentRaw),
      coverImage,
      category,
      published: Boolean(body.published),
    },
  };
}
