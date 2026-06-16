"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getChatTreeFromDictionary,
  getEnglishDictionary,
  LANG_COOKIE,
  LOCALES,
  LOCALE_SNAPSHOT_CACHE_VERSION,
  type Locale,
  type LocaleStrings,
} from "@/lib/i18n";
import { deepMerge } from "@/lib/i18n/merge";
import type { ChatTree } from "@/types";

type ScrollSnapshot = { x: number; y: number; ratio: number };

export type { ScrollSnapshot };

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale, scrollSnapshot?: ScrollSnapshot) => void;
  t: LocaleStrings;
  chatTree: ChatTree;
  locales: typeof LOCALES;
  sourceHash: string;
  translating: boolean;
}

export function captureScrollSnapshot(): ScrollSnapshot {
  const max = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  return {
    x: window.scrollX,
    y: window.scrollY,
    ratio: max > 0 ? window.scrollY / max : 0,
  };
}

function restoreScrollSnapshot(snapshot: ScrollSnapshot) {
  const html = document.documentElement;
  const prevBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  const max = Math.max(0, html.scrollHeight - window.innerHeight);
  const y = Math.min(Math.max(0, snapshot.y), max);
  window.scrollTo({ left: snapshot.x, top: y, behavior: "instant" });
  html.style.scrollBehavior = prevBehavior;
}

let pendingScrollRestore: ScrollSnapshot | null = null;
let restoreIntervalId: ReturnType<typeof setInterval> | null = null;

function stopScrollPreservation() {
  if (restoreIntervalId) {
    clearInterval(restoreIntervalId);
    restoreIntervalId = null;
  }
}

function beginScrollPreservation(snapshot: ScrollSnapshot) {
  pendingScrollRestore = snapshot;
  stopScrollPreservation();

  const tick = () => {
    if (pendingScrollRestore) restoreScrollSnapshot(pendingScrollRestore);
  };

  tick();
  requestAnimationFrame(() => {
    tick();
    requestAnimationFrame(tick);
  });

  let elapsed = 0;
  restoreIntervalId = setInterval(() => {
    tick();
    elapsed += 50;
    if (elapsed >= 2000) stopScrollPreservation();
  }, 50);
}

function syncLangSearchParam(next: Locale) {
  const url = new URL(window.location.href);
  if (next === "en") url.searchParams.delete("lang");
  else url.searchParams.set("lang", next);
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  const state = window.history.state;
  // Keep Next.js history markers so replaceState does not dispatch ACTION_RESTORE
  // (which would refetch RSC segments and remount the page).
  if (state?.__NA || state?._N) {
    window.history.replaceState(state, "", nextUrl);
    return;
  }
  window.history.replaceState(
    { ...state, __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: state?.__PRIVATE_NEXTJS_INTERNALS_TREE },
    "",
    nextUrl,
  );
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const english = getEnglishDictionary();

function readStoredLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${LANG_COOKIE}=`));
  const code = match?.split("=")[1] as Locale | undefined;
  if (code && LOCALES.some((l) => l.code === code)) return code;
  return "en";
}

function readSessionDictionary(
  locale: Locale,
  sourceHash: string,
): LocaleStrings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(
      `tbc-i18n-v${LOCALE_SNAPSHOT_CACHE_VERSION}-${locale}-${sourceHash}`,
    );
    return raw ? (JSON.parse(raw) as LocaleStrings) : null;
  } catch {
    return null;
  }
}

function readAnySessionDictionary(locale: Locale): LocaleStrings | null {
  if (typeof window === "undefined") return null;
  const prefix = `tbc-i18n-v${LOCALE_SNAPSHOT_CACHE_VERSION}-${locale}-`;
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key?.startsWith(prefix)) continue;
      const raw = sessionStorage.getItem(key);
      if (raw) return JSON.parse(raw) as LocaleStrings;
    }
  } catch {
    return null;
  }
  return null;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [ready, setReady] = useState(false);
  const [t, setT] = useState<LocaleStrings>(() => english);
  const [chatTree, setChatTree] = useState<ChatTree>(() =>
    getChatTreeFromDictionary(english),
  );
  const [sourceHash, setSourceHash] = useState("");
  const [translating, setTranslating] = useState(false);
  const wasTranslating = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang") as Locale | null;
    const urlValid =
      fromUrl && LOCALES.some((l) => l.code === fromUrl) ? fromUrl : null;
    const stored = urlValid ?? readStoredLocale();
    if (urlValid) {
      document.cookie = `${LANG_COOKIE}=${urlValid};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    }
    if (stored !== "en") {
      const cached = readAnySessionDictionary(stored);
      if (cached) {
        const merged = deepMerge(english, cached);
        setT(merged);
        setChatTree(getChatTreeFromDictionary(merged));
      }
    }
    setLocaleState(stored);
    document.documentElement.lang = stored;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const activeLocale = locale;

    if (activeLocale === "en") {
      setT(english);
      setChatTree(getChatTreeFromDictionary(english));
      setTranslating(false);
      return;
    }

    let cancelled = false;

    async function loadTranslations() {
      setTranslating(true);

      const cached = sourceHash
        ? readSessionDictionary(activeLocale, sourceHash)
        : readAnySessionDictionary(activeLocale);
      if (cached) {
        const merged = deepMerge(english, cached);
        setT(merged);
        setChatTree(getChatTreeFromDictionary(merged));
      }

      try {
        const res = await fetch(`/api/i18n/${activeLocale}`);
        const data = (await res.json()) as {
          dictionary: LocaleStrings;
          sourceHash: string;
          fallback?: boolean;
        };
        if (cancelled) return;

        const merged = deepMerge(english, data.dictionary);
        setSourceHash(data.sourceHash);
        setT(merged);
        setChatTree(getChatTreeFromDictionary(merged));

        if (typeof window !== "undefined" && !data.fallback) {
          sessionStorage.setItem(
            `tbc-i18n-v${LOCALE_SNAPSHOT_CACHE_VERSION}-${activeLocale}-${data.sourceHash}`,
            JSON.stringify(merged),
          );
        }
      } catch {
        if (!cancelled) {
          setT(english);
          setChatTree(getChatTreeFromDictionary(english));
        }
      } finally {
        if (!cancelled) setTranslating(false);
      }
    }

    void loadTranslations();
    return () => {
      cancelled = true;
    };
  }, [locale, ready]);

  useEffect(() => {
    if (wasTranslating.current && !translating && pendingScrollRestore) {
      beginScrollPreservation(pendingScrollRestore);
    }
    wasTranslating.current = translating;
  }, [translating]);

  const setLocale = useCallback(
    (next: Locale, scrollSnapshot?: ScrollSnapshot) => {
      if (typeof window !== "undefined") {
        beginScrollPreservation(scrollSnapshot ?? captureScrollSnapshot());
        syncLangSearchParam(next);
      }

      if (next === "en") {
        setT(english);
        setChatTree(getChatTreeFromDictionary(english));
        setTranslating(false);
      } else {
        const cached =
          (sourceHash
            ? readSessionDictionary(next, sourceHash)
            : null) ?? readAnySessionDictionary(next);
        const merged = cached ? deepMerge(english, cached) : english;
        setT(merged);
        setChatTree(getChatTreeFromDictionary(merged));
      }

      document.cookie = `${LANG_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
      document.documentElement.lang = next;
      startTransition(() => setLocaleState(next));
    },
    [sourceHash],
  );

  const value = useMemo(
    () => ({
      locale: ready ? locale : "en",
      setLocale,
      t,
      chatTree,
      locales: LOCALES,
      sourceHash,
      translating,
    }),
    [locale, setLocale, ready, t, chatTree, sourceHash, translating],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
