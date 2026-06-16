import { NextResponse } from "next/server";
import {
  getLocalizedLegalDocument,
  type LegalDocumentType,
} from "@/lib/i18n/legal-translations";
import { LOCALES, type Locale } from "@/lib/i18n/types";

const TYPES = new Set<LegalDocumentType>(["privacy", "cookies", "terms", "gdpr"]);

function isValidLocale(value: string): value is Locale {
  return LOCALES.some((l) => l.code === value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "en";
  const type = searchParams.get("type") as LegalDocumentType | null;

  if (!type || !TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  }
  if (!isValidLocale(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  return NextResponse.json({
    locale,
    type,
    document: getLocalizedLegalDocument(type, locale),
  });
}
