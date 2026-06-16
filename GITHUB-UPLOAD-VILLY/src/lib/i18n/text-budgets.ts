/** Max character budgets per UI slot — keeps long languages from overflowing. */
export const TEXT_BUDGETS = {
  nav_label: 18,
  button: 22,
  eyebrow: 24,
  hero_title: 48,
  card_title: 32,
  card_desc: 80,
  section_title: 40,
  subtitle: 120,
  stat: 20,
  label: 28,
  body: 300,
  seo_title: 60,
  seo_desc: 160,
  chat_message: 200,
  chat_label: 22,
  blog_title: 64,
  blog_excerpt: 200,
  blog_content: 8000,
} as const;

export type TextBudgetSlot = keyof typeof TEXT_BUDGETS;

const LONG_LOCALES = new Set(["de", "ro", "el", "bg", "sr"]);

/** Slightly tighter budgets for languages that expand more than English. */
export function budgetForLocale(
  slot: TextBudgetSlot,
  locale: string,
): number {
  const base = TEXT_BUDGETS[slot];
  if (!LONG_LOCALES.has(locale)) return base;
  return Math.max(8, Math.floor(base * 0.92));
}

/** Map a dot-path inside en.json to a text budget slot. */
export function resolveBudgetSlot(path: string): TextBudgetSlot {
  if (path.startsWith("errors.")) {
    if (path.endsWith(".eyebrow") || path.endsWith("Eyebrow")) return "eyebrow";
    if (path.endsWith(".title")) return "section_title";
    if (path.endsWith(".description")) return "subtitle";
    return "button";
  }
  if (path.startsWith("nav.")) return "nav_label";
  if (path === "hero.title") return "hero_title";
  if (path.endsWith(".eyebrow") || path.includes("Eyebrow")) return "eyebrow";
  if (
    path.endsWith(".cta") ||
    path.endsWith(".submit") ||
    path.endsWith(".bookNow") ||
    path.endsWith("bookNow") ||
    path.endsWith(".acceptAll") ||
    path.endsWith(".reject") ||
    path.endsWith(".save") ||
    path.endsWith(".retry") ||
    path.endsWith(".back") && !path.includes("backHome")
  ) {
    return "button";
  }
  if (path.endsWith(".subtitle") || path.includes("Desc") || path.endsWith(".desc")) {
    return path.endsWith(".desc") || path.includes("Desc") ? "card_desc" : "subtitle";
  }
  if (path.endsWith(".title") && !path.includes("seo")) return "section_title";
  if (path.includes(".cards.") && path.endsWith(".title")) return "card_title";
  if (path.startsWith("seo.")) {
    if (path.includes("description") || path.includes("Description")) return "seo_desc";
    return "seo_title";
  }
  if (path.includes("chat.") && path.endsWith(".label")) return "chat_label";
  if (path.includes("chat.") && path.endsWith(".message")) return "chat_message";
  if (path.includes("faq.items") && path.endsWith(".q")) return "card_title";
  if (path.includes("faq.items") && path.endsWith(".a")) return "body";
  if (path.includes("seo.homeContent.sections") && path.endsWith(".title")) {
    return "section_title";
  }
  if (path.includes("seo.homeContent.sections") && path.endsWith(".items")) {
    return "body";
  }
  if (path.includes("experiences.items") && path.endsWith(".title")) return "card_title";
  if (path.includes("experiences.items") && path.endsWith(".desc")) return "card_desc";
  if (path.includes("stat")) return "stat";
  if (path.endsWith(".label") || path.endsWith("Label")) return "label";
  return "body";
}

/** Last-resort truncation — prefer shorter translations from the API. */
export function enforceBudget(text: string, max?: number): string {
  if (!max || text.length <= max) return text;
  const room = max - 1;
  const trimmed = text.slice(0, room).trimEnd();
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace > room * 0.55) return `${trimmed.slice(0, lastSpace)}…`;
  return `${trimmed}…`;
}

export function isLongLanguage(locale: string): boolean {
  return LONG_LOCALES.has(locale);
}
