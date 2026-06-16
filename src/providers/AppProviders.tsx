"use client";

import { LanguageProvider } from "@/providers/LanguageProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
