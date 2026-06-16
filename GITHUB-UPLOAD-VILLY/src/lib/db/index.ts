import Database from "better-sqlite3";
import { join } from "path";
import { mkdirSync } from "fs";
import { seedDatabase } from "./seed";

function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.NETLIFY ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.VERCEL,
  );
}

function resolveDbDirectory(): string {
  if (isServerlessRuntime()) {
    return "/tmp";
  }
  return join(process.cwd(), "data");
}

const dbDirectory = resolveDbDirectory();
const dbPath = join(dbDirectory, "thassos.db");

let db: Database.Database | null = null;

function runMigrations(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      id_number TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      boat_id TEXT NOT NULL,
      guests INTEGER NOT NULL,
      route_id TEXT NOT NULL,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS blog_articles (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      cover_image TEXT NOT NULL,
      author TEXT NOT NULL,
      published INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cookie_consents (
      id TEXT PRIMARY KEY,
      consent_id TEXT NOT NULL,
      necessary INTEGER DEFAULT 1,
      analytics INTEGER DEFAULT 0,
      marketing INTEGER DEFAULT 0,
      ip_hash TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gdpr_requests (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      request_type TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      message TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_articles(slug);
    CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_articles(published);
    CREATE INDEX IF NOT EXISTS idx_consent_created ON cookie_consents(created_at);

    CREATE TABLE IF NOT EXISTS translation_cache (
      cache_key TEXT PRIMARY KEY,
      locale TEXT NOT NULL,
      slot TEXT NOT NULL,
      source_text TEXT NOT NULL,
      translated_text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS locale_snapshots (
      locale TEXT NOT NULL,
      source_hash TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (locale, source_hash)
    );
  `);

  const blogCols = database
    .prepare("PRAGMA table_info(blog_articles)")
    .all() as { name: string }[];
  if (!blogCols.some((c) => c.name === "category")) {
    database.exec(
      "ALTER TABLE blog_articles ADD COLUMN category TEXT NOT NULL DEFAULT 'guides'",
    );
    database.exec(
      "CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_articles(category)",
    );
  }

  const consentCols = database
    .prepare("PRAGMA table_info(cookie_consents)")
    .all() as { name: string }[];
  if (!consentCols.some((c) => c.name === "policy_version")) {
    database.exec(
      "ALTER TABLE cookie_consents ADD COLUMN policy_version TEXT",
    );
  }
}

export function getDb(): Database.Database {
  if (db) return db;

  mkdirSync(dbDirectory, { recursive: true });
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.pragma("synchronous = NORMAL");
  db.pragma("temp_store = MEMORY");
  runMigrations(db);
  seedDatabase(db);
  return db;
}
