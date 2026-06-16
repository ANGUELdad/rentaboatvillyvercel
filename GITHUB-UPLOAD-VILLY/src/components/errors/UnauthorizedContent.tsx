"use client";

import Link from "next/link";
import { ErrorPageShell } from "@/components/errors/ErrorPageShell";
import { useI18n } from "@/providers/LanguageProvider";

export function UnauthorizedContent() {
  const { t } = useI18n();
  const copy = t.errors.unauthorized;

  return (
    <ErrorPageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
    >
      <Link href="/" className="btn-app-primary min-h-12 px-8">
        {copy.home}
      </Link>
      <Link href="/admin/login" className="btn-app-secondary min-h-12 px-8">
        {copy.login}
      </Link>
    </ErrorPageShell>
  );
}
