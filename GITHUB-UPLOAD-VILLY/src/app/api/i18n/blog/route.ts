import { NextResponse } from "next/server";
import {
  getBlogArticleTranslation,
  countBlogTranslations,
} from "@/lib/i18n/blog-translations";
import { LOCALES, type Locale } from "@/lib/i18n/types";

export const dynamic = "force-dynamic";

function isValidLocale(value: string): value is Locale {
  return LOCALES.some((l) => l.code === value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const localeRaw = searchParams.get("locale") ?? "";
  const slug = searchParams.get("slug");

  if (!isValidLocale(localeRaw)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  if (localeRaw === "en") {
    return NextResponse.json({ locale: "en", count: 0, article: null });
  }

  if (slug) {
    const article = getBlogArticleTranslation(slug, localeRaw);
    if (!article) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ locale: localeRaw, slug, fields: article });
  }

  return NextResponse.json({
    locale: localeRaw,
    count: countBlogTranslations(localeRaw),
  });
}
