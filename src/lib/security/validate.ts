import { maxBookingDateInSiteTz, todayInSiteTz } from "./timezone";

export const LIMITS = {
  name: 120,
  email: 254,
  phone: 32,
  idNumber: 64,
  notes: 2000,
  message: 2000,
  slug: 120,
  title: 200,
  excerpt: 500,
  content: 100_000,
  consentId: 64,
  boatId: 64,
  routeId: 64,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const CONSENT_ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;
const ENTITY_ID_RE = /^[a-z0-9-]{1,64}$/i;
const PHONE_RE = /^[\d\s+\-().]{6,32}$/;
const ID_DOC_RE = /^[A-Za-z0-9\s\-/.]{3,64}$/;

const POISON_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export function normalizeEmail(raw: string): string {
  return raw.normalize("NFKC").trim().toLowerCase();
}

export function trimField(value: unknown, maxLen: number): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s || s.length > maxLen) return null;
  return s;
}

export function hasPoisonKeys(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).some((k) => POISON_KEYS.has(k));
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  if (normalized.length > LIMITS.email) return false;
  if (/[^\x00-\x7F]/.test(normalized.split("@")[0] ?? "")) return false;
  return EMAIL_RE.test(normalized);
}

export function isValidSlug(slug: string): boolean {
  return slug.length <= LIMITS.slug && SLUG_RE.test(slug);
}

/** Rejects impossible calendar dates (e.g. 2025-02-30). */
export function isValidDate(date: string): boolean {
  if (!DATE_RE.test(date)) return false;
  const [y, m, d] = date.split("-").map(Number);
  const parsed = new Date(y, m - 1, d);
  return (
    parsed.getFullYear() === y &&
    parsed.getMonth() === m - 1 &&
    parsed.getDate() === d
  );
}

/** Validates HH:MM and marina business hours (08:00–20:00). */
export function isValidTime(time: string): boolean {
  if (!TIME_RE.test(time)) return false;
  const [h, m] = time.split(":").map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) return false;
  const minutes = h * 60 + m;
  return minutes >= 8 * 60 && minutes <= 20 * 60;
}

export function isBookingDateInRange(date: string): boolean {
  if (!isValidDate(date)) return false;
  const today = todayInSiteTz();
  const max = maxBookingDateInSiteTz();
  return date >= today && date <= max;
}

export function isValidConsentId(id: string): boolean {
  return CONSENT_ID_RE.test(id);
}

export function isValidEntityId(id: string): boolean {
  return ENTITY_ID_RE.test(id);
}

export function isValidPhone(phone: string): boolean {
  return PHONE_RE.test(phone);
}

export function isValidIdNumber(idNumber: string): boolean {
  return ID_DOC_RE.test(idNumber);
}

const ALLOWED_IMAGE_HOSTS = new Set(["images.unsplash.com"]);

export function isAllowedCoverImage(url: string): boolean {
  if (!url) return true;
  if (url.startsWith("/images/")) return true;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" && ALLOWED_IMAGE_HOSTS.has(parsed.hostname)
    );
  } catch {
    return false;
  }
}
