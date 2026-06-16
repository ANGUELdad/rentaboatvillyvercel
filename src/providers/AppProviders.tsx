"use client";

import type { Locale } from "@/lib/i18n";
import { LanguageProvider } from "@/providers/LanguageProvider";

export function AppProviders({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  return (
    <LanguageProvider initialLocale={initialLocale}>{children}</LanguageProvider>
  );
}
