import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = join(root, "data", "thassos.db");
const articles = JSON.parse(
  readFileSync(join(root, "data", "blog", "en.json"), "utf8"),
);

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80";
const COVER_IMAGES = {
  "hidden-coves-of-thassos":
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
  "marble-beach-boat-guide":
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
  "first-time-boat-rental-greece":
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
  "sunset-cruises-thassos":
    "https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=1200&q=80",
  "aliki-ancient-quarry-from-sea":
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
  "tripiti-cave-boat-guide":
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
  "golden-beach-thassos-by-boat":
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  "limenaria-marina-boat-rental-guide":
    "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80",
  "snorkelling-spots-thassos-by-boat":
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
  "southern-coast-thassos-boat-itinerary":
    "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80",
};

const db = new Database(dbPath);
const cols = db.prepare("PRAGMA table_info(blog_articles)").all();
if (!cols.some((c) => c.name === "category")) {
  db.exec("ALTER TABLE blog_articles ADD COLUMN category TEXT NOT NULL DEFAULT 'guides'");
}

const now = new Date().toISOString();
const upsert = db.prepare(`
  INSERT INTO blog_articles (id, slug, title, excerpt, content, cover_image, author, category, published, created_at, updated_at)
  VALUES (@id, @slug, @title, @excerpt, @content, @cover_image, @author, @category, 1, @created_at, @updated_at)
  ON CONFLICT(slug) DO UPDATE SET
    title = excluded.title,
    excerpt = excluded.excerpt,
    content = excluded.content,
    category = excluded.category,
    updated_at = excluded.updated_at
`);

for (const a of articles) {
  const existing = db
    .prepare("SELECT id, created_at FROM blog_articles WHERE slug = ?")
    .get(a.slug);
  upsert.run({
    id: existing?.id ?? `blog-${a.slug}`,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    content: a.content,
    cover_image:
      COVER_IMAGES[a.slug] ??
      (existing
        ? db.prepare("SELECT cover_image FROM blog_articles WHERE slug=?").get(a.slug)
            ?.cover_image
        : "") ??
      DEFAULT_COVER,
    author: "",
    category: a.category ?? "guides",
    created_at: existing?.created_at ?? now,
    updated_at: now,
  });
}

const count = db.prepare("SELECT COUNT(*) as n FROM blog_articles").get().n;
console.log("Synced", articles.length, "seed articles. DB total:", count);
db.close();
