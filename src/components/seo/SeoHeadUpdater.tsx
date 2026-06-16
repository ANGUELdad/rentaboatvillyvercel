"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useI18n } from "@/providers/LanguageProvider";
import type { SeoPageKey } from "@/lib/seo/build-metadata";
import { OG_LOCALE } from "@/lib/seo/locale-meta";
import { hreflangAlternates, localizedPageUrl } from "@/lib/seo/metadata";

const PATH_TO_PAGE: Record<string, SeoPageKey> = {
  "/": "home",
  "/fleet": "fleet",
  "/booking": "booking",
  "/map": "map",
  "/guide": "guide",
  "/experiences": "experiences",
  "/reviews": "reviews",
  "/faq": "faq",
  "/blog": "blog",
  "/matchmaker": "matchmaker",
  "/privacy": "privacy",
  "/terms": "terms",
  "/cookies": "cookies",
  "/gdpr": "gdpr",
};

function setMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string, extra?: Record<string, string>) {
  const selector = extra
    ? `link[rel="${rel}"][hreflang="${extra.hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    if (extra) {
      for (const [key, value] of Object.entries(extra)) {
        el.setAttribute(key, value);
      }
    }
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Keeps document head in sync when the user switches locale client-side. */
export function SeoHeadUpdater() {
  const pathname = usePathname();
  const { locale, t } = useI18n();

  const pageKey = useMemo(() => {
    if (PATH_TO_PAGE[pathname]) return PATH_TO_PAGE[pathname];
    if (pathname.startsWith("/fleet/")) return null;
    if (pathname.startsWith("/blog/")) return null;
    return null;
  }, [pathname]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (!pageKey) return;

    const pageSeo = t.seo.pages[pageKey];
    const path = pathname === "/" ? "" : pathname;
    const canonical = localizedPageUrl(path, locale);
    const alternates = hreflangAlternates(path);

    document.title = pageSeo.title;
    setMeta("description", pageSeo.description);
    setMeta("keywords", pageSeo.keywords);
    setMeta("og:title", pageSeo.title, true);
    setMeta("og:description", pageSeo.description, true);
    setMeta("og:locale", OG_LOCALE[locale], true);
    setMeta("og:url", canonical, true);
    setMeta("twitter:title", pageSeo.title);
    setMeta("twitter:description", pageSeo.description);
    setLink("canonical", canonical);

    for (const [hreflang, href] of Object.entries(alternates)) {
      setLink("alternate", href, { hreflang });
    }
  }, [pageKey, locale, pathname, t.seo.pages]);

  return null;
}
