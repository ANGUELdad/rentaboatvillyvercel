import { getDb } from "./index";
import type { BlogArticle } from "@/types";

function rowToArticle(row: Record<string, unknown>): BlogArticle {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    excerpt: row.excerpt as string,
    content: row.content as string,
    coverImage: row.cover_image as string,
    category: (row.category as string) || "guides",
    published: Boolean(row.published),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function getPublishedArticles(): BlogArticle[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM blog_articles WHERE published = 1 ORDER BY created_at DESC",
    )
    .all();
  return rows.map((r) => rowToArticle(r as Record<string, unknown>));
}

export function getPublishedArticlesByCategory(category: string): BlogArticle[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM blog_articles WHERE published = 1 AND category = ? ORDER BY created_at DESC",
    )
    .all(category);
  return rows.map((r) => rowToArticle(r as Record<string, unknown>));
}

export function getRelatedArticles(
  article: BlogArticle,
  limit = 4,
): BlogArticle[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM blog_articles
       WHERE published = 1 AND slug != ? AND category = ?
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .all(article.slug, article.category, limit);
  const related = rows.map((r) => rowToArticle(r as Record<string, unknown>));
  if (related.length >= limit) return related;

  const filler = db
    .prepare(
      `SELECT * FROM blog_articles
       WHERE published = 1 AND slug != ?
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .all(article.slug, limit)
    .map((r) => rowToArticle(r as Record<string, unknown>))
    .filter((a) => !related.some((r) => r.slug === a.slug));

  return [...related, ...filler].slice(0, limit);
}

export function getAllArticles(): BlogArticle[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM blog_articles ORDER BY created_at DESC")
    .all();
  return rows.map((r) => rowToArticle(r as Record<string, unknown>));
}

export function getArticleBySlug(slug: string): BlogArticle | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM blog_articles WHERE slug = ? AND published = 1")
    .get(slug);
  return row ? rowToArticle(row as Record<string, unknown>) : null;
}

export function getArticleById(id: string): BlogArticle | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM blog_articles WHERE id = ?").get(id);
  return row ? rowToArticle(row as Record<string, unknown>) : null;
}

export function isSlugTaken(slug: string, excludeId?: string): boolean {
  const db = getDb();
  const row = excludeId
    ? db
        .prepare("SELECT id FROM blog_articles WHERE slug = ? AND id != ?")
        .get(slug, excludeId)
    : db.prepare("SELECT id FROM blog_articles WHERE slug = ?").get(slug);
  return !!row;
}

export function createArticle(
  article: Omit<BlogArticle, "createdAt" | "updatedAt"> & {
    createdAt: string;
    updatedAt: string;
  },
): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO blog_articles (id, slug, title, excerpt, content, cover_image, author, category, published, created_at, updated_at)
    VALUES (@id, @slug, @title, @excerpt, @content, @cover_image, @author, @category, @published, @created_at, @updated_at)
  `).run({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    cover_image: article.coverImage,
    author: "",
    category: article.category || "guides",
    published: article.published ? 1 : 0,
    created_at: article.createdAt,
    updated_at: article.updatedAt,
  });
}

export function updateArticle(
  id: string,
  data: Partial<
    Pick<
      BlogArticle,
      | "title"
      | "slug"
      | "excerpt"
      | "content"
      | "coverImage"
      | "category"
      | "published"
    >
  >,
): boolean {
  const db = getDb();
  const existing = getArticleById(id);
  if (!existing) return false;

  const updated = {
    title: data.title ?? existing.title,
    slug: data.slug ?? existing.slug,
    excerpt: data.excerpt ?? existing.excerpt,
    content: data.content ?? existing.content,
    cover_image: data.coverImage ?? existing.coverImage,
    category: data.category ?? existing.category,
    author: "",
    published: (data.published ?? existing.published) ? 1 : 0,
    updated_at: new Date().toISOString(),
  };

  const result = db
    .prepare(
      `UPDATE blog_articles SET title=@title, slug=@slug, excerpt=@excerpt, content=@content,
    cover_image=@cover_image, author=@author, category=@category, published=@published, updated_at=@updated_at
    WHERE id=@id`,
    )
    .run({ ...updated, id });
  return result.changes > 0;
}

export function deleteArticle(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM blog_articles WHERE id = ?").run(id);
  return result.changes > 0;
}

export function isSqliteUniqueViolation(err: unknown): boolean {
  return (
    err instanceof Error &&
    "code" in err &&
    (err as { code: string }).code === "SQLITE_CONSTRAINT_UNIQUE"
  );
}
