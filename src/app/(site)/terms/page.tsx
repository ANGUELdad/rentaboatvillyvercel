import type { Metadata } from "next";
import { TermsPageShell } from "@/components/pages/TermsPageShell";
import { buildPageMetadata } from "@/lib/seo/build-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  return buildPageMetadata("terms", "/terms", { lang, noindex: true });
}

export default function TermsPage() {
  return <TermsPageShell />;
}
