import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/types";
import { PRIMARY_KEYWORDS, SITE_BRAND, SITE_URL } from "./config";
import {
  hreflangAlternates,
  localizedPageUrl,
  ogAlternateLocales,
  OG_LOCALE,
} from "./locale-meta";

/** Next.js serves dynamic branded OG at /opengraph-image */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;

export const DEFAULT_KEYWORDS = PRIMARY_KEYWORDS.join(", ");

const GOOGLE_BOT = {
  index: true,
  follow: true,
  "max-image-preview": "large" as const,
  "max-snippet": -1,
  "max-video-preview": -1,
};

export type PageMetaOptions = {
  title: string;
  description: string;
  path?: string;
  locale?: Locale;
  image?: string;
  keywords?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path = "",
  locale = "en",
  image = DEFAULT_OG_IMAGE,
  keywords,
  type = "website",
  publishedTime,
  modifiedTime,
  noindex = false,
}: PageMetaOptions): Metadata {
  const url = localizedPageUrl(path, locale);
  const absoluteTitle =
    title.includes("|") || title.length > 55
      ? { absolute: title }
      : title;
  const resolvedTitle =
    typeof absoluteTitle === "string" ? absoluteTitle : title;
  const ogLocale = OG_LOCALE[locale];

  return {
    title: absoluteTitle,
    description,
    keywords: keywords ?? DEFAULT_KEYWORDS,
    authors: [{ name: SITE_BRAND, url: SITE_URL }],
    creator: SITE_BRAND,
    publisher: SITE_BRAND,
    category: "Travel",
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: GOOGLE_BOT },
    openGraph: {
      title: resolvedTitle,
      description,
      url,
      type,
      siteName: SITE_BRAND,
      locale: ogLocale,
      alternateLocale: ogAlternateLocales(locale),
      images: [
        {
          url: image.startsWith("http") ? image : `${SITE_URL}${image}`,
          width: 1200,
          height: 630,
          alt: resolvedTitle,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [image.startsWith("http") ? image : `${SITE_URL}${image}`],
    },
    alternates: {
      canonical: url,
      languages: hreflangAlternates(path),
    },
  };
}

export { hreflangAlternates, localizedPageUrl } from "./locale-meta";
