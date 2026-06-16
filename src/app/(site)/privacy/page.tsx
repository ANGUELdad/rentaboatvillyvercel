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
  return buildPageMetadata("privacy", "/privacy", { lang, noindex: true });
}

export default async function PrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = await getRequestLocale(lang);
  const document = getLocalizedLegalDocument("privacy", locale);
  return <LegalPage type="privacy" document={document} />;
}
