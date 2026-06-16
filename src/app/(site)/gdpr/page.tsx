import type { Metadata } from "next";
import { LegalPage } from "@/components/gdpr/LegalPage";
import { getLocalizedLegalDocument } from "@/lib/i18n/legal-translations";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { buildPageMetadata } from "@/lib/seo/build-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  return buildPageMetadata("gdpr", "/gdpr", { lang, noindex: true });
}

export default async function GdprPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = await getRequestLocale(lang);
  const document = getLocalizedLegalDocument("gdpr", locale);
  return <LegalPage type="gdpr" document={document} showGdprForm />;
}
