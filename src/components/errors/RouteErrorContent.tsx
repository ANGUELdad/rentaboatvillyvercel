"use client";

import Link from "next/link";
import { ErrorPageShell } from "@/components/errors/ErrorPageShell";
import { useI18n } from "@/providers/LanguageProvider";

interface RouteErrorContentProps {
  reset: () => void;
}

export function RouteErrorContent({ reset }: RouteErrorContentProps) {
  const { t } = useI18n();
  const copy = t.errors.route;

  return (
    <ErrorPageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      eyebrowClassName="text-brand-green"
    >
      <button
        type="button"
        onClick={reset}
        className="btn-app-primary min-h-12 px-8"
      >
        {copy.retry}
      </button>
      <Link href="/" className="btn-app-secondary min-h-12 px-8">
        {copy.home}
      </Link>
    </ErrorPageShell>
  );
}
