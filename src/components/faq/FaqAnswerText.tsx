"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { localizedHref } from "@/lib/i18n/routing";
import { useI18n } from "@/providers/LanguageProvider";

const MARKDOWN_LINK_RE = /\[([^\]]+)\]\((\/[^)]+)\)/g;

export function FaqAnswerText({ text }: { text: string }) {
  const { locale } = useI18n();
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  const re = new RegExp(MARKDOWN_LINK_RE);
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const [, label, path] = match;
    parts.push(
      <Link
        key={`${match.index}-${path}`}
        href={localizedHref(path, locale)}
        className="font-medium text-ds-brand underline-offset-2 hover:underline"
      >
        {label}
      </Link>,
    );
    last = re.lastIndex;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return <>{parts.length > 0 ? parts : text}</>;
}
