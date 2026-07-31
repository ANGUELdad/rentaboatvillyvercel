import { NextResponse } from "next/server";
import { getSourceHash } from "@/lib/i18n/server";
import { getLocaleDictionary } from "@/lib/i18n/static-locales";
import { stripAdminDictionaryKeys } from "@/lib/i18n/public-dictionary";
import { LOCALES, type Locale } from "@/lib/i18n/types";

export const dynamic = "force-dynamic";

function isValidLocale(value: string): value is Locale {
  return LOCALES.some((l) => l.code === value);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  try {
    const dictionary = stripAdminDictionaryKeys(getLocaleDictionary(locale));
    return NextResponse.json({
      locale,
      sourceHash: getSourceHash(),
      dictionary,
    });
  } catch (err) {
    console.error("[i18n] translation failed:", err);
    const { getEnglishDictionary } = await import("@/lib/i18n/dictionary");
    return NextResponse.json({
      locale: "en",
      sourceHash: getSourceHash(),
      dictionary: stripAdminDictionaryKeys(getEnglishDictionary()),
      fallback: true,
    });
  }
}
