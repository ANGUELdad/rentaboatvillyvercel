import type { Locale } from "@/lib/i18n/types";
import { GOOGLE_REVIEWS } from "@/lib/site";
import { safeAvgRating } from "@/lib/safe";
import type { Testimonial } from "@/types";

/** Minimum star rating shown in public carousel and marketing surfaces. */
export const PUBLIC_MIN_RATING = 5;

const SITE_LOCALES = new Set<Locale>(["en", "el", "de", "bg", "ro", "sr"]);

function originalLocale(t: Testimonial): string {
  return t.locale?.trim().toLowerCase() || "en";
}

/** Resolve display text: site locale → English → unavailable. */
export function getTestimonialTextForLocale(
  t: Testimonial,
  locale: Locale,
): string | null {
  const original = originalLocale(t);
  const native = t.text.trim();
  if (!native) return null;

  if (locale === original) return native;

  const localized = t.textByLocale?.[locale]?.trim();
  if (localized) return localized;

  if (locale !== "en") {
    if (original === "en") return native;
    const english = t.textByLocale?.en?.trim();
    if (english) return english;
    return null;
  }

  if (original === "en") return native;
  const english = t.textByLocale?.en?.trim();
  return english || null;
}

/** Reviews mentioning specific prices are withheld from public surfaces. */
const PRICE_PATTERN =
  /€|\beur\b|\beuro\b|\beuros\b|евро|ευρώ|evra|evro|\d+\s*(€|eur|euro|евро|ευρώ)/i;

function textContainsPrice(text: string): boolean {
  return PRICE_PATTERN.test(text);
}

export function isPublicTestimonial(t: Testimonial): boolean {
  const text = t.text.trim();
  if (!text || t.rating < PUBLIC_MIN_RATING) return false;

  const variants = [
    text,
    ...Object.values(t.textByLocale ?? {}).map((value) => value?.trim() ?? ""),
  ].filter(Boolean);

  if (variants.some(textContainsPrice)) return false;
  return true;
}

export function getPublicTestimonials(all: Testimonial[]): Testimonial[] {
  return all.filter(isPublicTestimonial);
}

/** Best 5-star reviews first: longer quote text, then stable id. */
export function sortFeaturedTestimonials(items: Testimonial[]): Testimonial[] {
  return [...items]
    .filter((t) => t.rating === 5)
    .sort((a, b) => {
      if (b.text.length !== a.text.length) return b.text.length - a.text.length;
      return a.id.localeCompare(b.id);
    });
}

/** Public reviews with text resolved for the active site locale. */
export function getLocalizedPublicTestimonials(
  all: Testimonial[],
  locale: Locale,
): Testimonial[] {
  if (!SITE_LOCALES.has(locale)) return [];

  return getPublicTestimonials(all).flatMap((t) => {
    const text = getTestimonialTextForLocale(t, locale);
    if (!text) return [];
    return [{ ...t, text }];
  });
}

/** Aggregate rating — SEO/internal only; not shown on site. */
export function getDisplayRating(testimonials: Testimonial[]): string {
  if (GOOGLE_REVIEWS.rating > 0) {
    return GOOGLE_REVIEWS.rating.toFixed(1);
  }
  const publicItems = getPublicTestimonials(testimonials);
  return safeAvgRating(publicItems) ?? "5.0";
}

/** Total Google review count for trust badges. */
export function getGoogleReviewCount(all: Testimonial[]): number {
  if (GOOGLE_REVIEWS.count > 0) return GOOGLE_REVIEWS.count;
  return all.filter((t) => t.text.trim().length > 0).length;
}
