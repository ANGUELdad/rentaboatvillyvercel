"use client";

import Link from "next/link";
import { ErrorPageShell } from "@/components/errors/ErrorPageShell";
import { useI18n } from "@/providers/LanguageProvider";

export function NotFoundContent() {
  const { t } = useI18n();
  const copy = t.errors.notFound;

  return (
    <ErrorPageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
    >
      <Link href="/" className="btn-app-primary min-h-12 px-8">
        {copy.home}
      </Link>
      <Link href="/booking" className="btn-app-secondary min-h-12 px-8">
        {copy.book}
      </Link>
    </ErrorPageShell>
  );
}
