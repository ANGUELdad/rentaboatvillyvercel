import type Database from "better-sqlite3";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { DEFAULT_BLOG_CATEGORY } from "@/lib/blog-categories";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80";

const COVER_IMAGES: Record<string, string> = {
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
  "rent-boat-thassos-prices-hourly":
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1200&q=80",
  "potos-harbor-boat-guide":
    "https://images.unsplash.com/photo-1544551763-77ef2d0cfcb0?auto=format&fit=crop&w=1200&q=80",
  "pefkari-beach-by-boat":
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  "metalia-beach-limenaria-guide":
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
  "vathi-bay-north-shore-anchorage":
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
  "north-shore-marble-route-thassos":
    "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80",
  "thassos-boat-rental-no-license-30hp":
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
  "family-boat-day-thassos":
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
  "thassos-sea-atlas-marine-map":
    "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80",
  "thassos-boating-weather-guide":
    "https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=1200&q=80",
  "paradise-beach-thassos-by-boat":
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
  "best-speedboats-limenaria-fleet":
    "https://images.unsplash.com/photo-1544551763-77ef2d0cfcb0?auto=format&fit=crop&w=1200&q=80",
};

interface SeedArticle {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category?: string;
}

function loadArticles(): SeedArticle[] {
  const path = join(process.cwd(), "data", "blog", "en.json");
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as SeedArticle[];
}

export function seedDatabase(db: Database.Database) {
  const articles = loadArticles();
  const now = new Date().toISOString();

  const upsert = db.prepare(`
    INSERT INTO blog_articles (id, slug, title, excerpt, content, cover_image, author, category, published, created_at, updated_at)
    VALUES (@id, @slug, @title, @excerpt, @content, @cover_image, @author, @category, 1, @created_at, @updated_at)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      excerpt = excluded.excerpt,
      content = excluded.content,
      cover_image = CASE WHEN excluded.cover_image != '' THEN excluded.cover_image ELSE cover_image END,
      category = excluded.category,
      updated_at = excluded.updated_at
  `);

  articles.forEach((a, i) => {
    const existing = db
      .prepare("SELECT id, created_at FROM blog_articles WHERE slug = ?")
      .get(a.slug) as { id: string; created_at: string } | undefined;

    upsert.run({
      id: existing?.id ?? `blog-${a.slug}`,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      cover_image: COVER_IMAGES[a.slug] ?? DEFAULT_COVER,
      author: "",
      category: a.category ?? DEFAULT_BLOG_CATEGORY,
      created_at: existing?.created_at ?? now,
      updated_at: now,
    });
  });

  const bookingsPath = join(process.cwd(), "data", "bookings.json");
  if (existsSync(bookingsPath)) {
    const existing = db.prepare("SELECT COUNT(*) as c FROM bookings").get() as {
      c: number;
    };
    if (existing.c === 0) {
      let bookings: Array<{
        id: string;
        fullName: string;
        email: string;
        phone: string;
        idNumber: string;
        date: string;
        time: string;
        boatId: string;
        guests: number;
        routeId: string;
        notes: string;
        createdAt: string;
      }>;
      try {
        const raw = readFileSync(bookingsPath, "utf-8");
        bookings = JSON.parse(raw) as typeof bookings;
        if (!Array.isArray(bookings)) return;
      } catch {
        return;
      }
      const insertBooking = db.prepare(`
        INSERT OR IGNORE INTO bookings (id, full_name, email, phone, id_number, date, time, boat_id, guests, route_id, notes, created_at)
        VALUES (@id, @full_name, @email, @phone, @id_number, @date, @time, @boat_id, @guests, @route_id, @notes, @created_at)
      `);
      for (const b of bookings) {
        insertBooking.run({
          id: b.id,
          full_name: b.fullName,
          email: b.email,
          phone: b.phone,
          id_number: b.idNumber,
          date: b.date,
          time: b.time,
          boat_id: b.boatId,
          guests: b.guests,
          route_id: b.routeId,
          notes: b.notes ?? "",
          created_at: b.createdAt,
        });
      }
    }
  }
}
