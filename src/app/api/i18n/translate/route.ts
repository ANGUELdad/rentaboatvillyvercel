import { NextResponse } from "next/server";
import { translateFields } from "@/lib/i18n/server";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import type { TextBudgetSlot } from "@/lib/i18n/text-budgets";
import { LIMITS, trimField } from "@/lib/security/validate";
import {
  enforceRateLimit,
  parseJsonBody,
  requireSameOrigin,
} from "@/lib/security/request";
import { RATE_LIMITS } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const MAX_TRANSLATE_FIELDS = 40;
const VALID_SLOTS = new Set<TextBudgetSlot>([
  "nav_label",
  "button",
  "eyebrow",
  "hero_title",
  "card_title",
  "card_desc",
  "section_title",
  "subtitle",
  "stat",
  "label",
  "body",
  "seo_title",
  "seo_desc",
  "chat_message",
  "chat_label",
  "blog_title",
  "blog_excerpt",
  "blog_content",
]);

function isValidLocale(value: string): value is Locale {
  return LOCALES.some((l) => l.code === value);
}

export async function POST(request: Request) {
  const originBlock = requireSameOrigin(request);
  if (originBlock) return originBlock;

  const limited = await enforceRateLimit(
    request,
    "i18n-translate",
    RATE_LIMITS.i18nTranslate.limit,
    RATE_LIMITS.i18nTranslate.windowMs,
  );
  if (limited) return limited;

  const parsed = await parseJsonBody<{
    locale?: string;
    slot?: string;
    fields?: Record<string, unknown>;
  }>(request, 16 * 1024);
  if (!parsed.ok) return parsed.response;

  const localeRaw = trimField(parsed.body.locale, 8);
  const slotRaw = trimField(parsed.body.slot ?? "body", 32) ?? "body";
  const { fields } = parsed.body;

  if (!localeRaw || !isValidLocale(localeRaw)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  if (!VALID_SLOTS.has(slotRaw as TextBudgetSlot)) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  }

  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const entries = Object.entries(fields);
  if (entries.length === 0 || entries.length > MAX_TRANSLATE_FIELDS) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }

  const sanitized: Record<string, string> = {};
  for (const [key, value] of entries) {
    if (key.length > 120 || key.includes("__")) {
      return NextResponse.json({ error: "Invalid field key" }, { status: 400 });
    }
    const text = trimField(value, LIMITS.content);
    if (!text) {
      return NextResponse.json({ error: "Invalid field value" }, { status: 400 });
    }
    sanitized[key] = text;
  }

  try {
    const translated = await translateFields(
      sanitized,
      localeRaw,
      slotRaw as TextBudgetSlot,
    );
    return NextResponse.json({ locale: localeRaw, fields: translated });
  } catch (err) {
    console.error("[i18n] field translation failed:", err);
    return NextResponse.json({
      locale: localeRaw,
      fields: sanitized,
      fallback: true,
    });
  }
}
