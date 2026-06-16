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
import { useRouter } from "next/navigation";
import {
  getChatTreeFromDictionary,
  LANG_COOKIE,
  LOCALES,
  type Locale,
  type LocaleStrings,
} from "@/lib/i18n";
import { getLocaleDictionary } from "@/lib/i18n/static-locales";
import type { ChatTree } from "@/types";

type ScrollSnapshot = { x: number; y: number; ratio: number };

export type { ScrollSnapshot };

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale, scrollSnapshot?: ScrollSnapshot) => void;
  t: LocaleStrings;
  chatTree: ChatTree;
  locales: typeof LOCALES;
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

function dictionaryFor(locale: Locale): LocaleStrings {
  return getLocaleDictionary(locale);
}

function chatFor(locale: Locale): ChatTree {
  return getChatTreeFromDictionary(dictionaryFor(locale));
}

function readStoredLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${LANG_COOKIE}=`));
  const code = match?.split("=")[1] as Locale | undefined;
  if (code && LOCALES.some((l) => l.code === code)) return code;
  return "en";
}

export function LanguageProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [ready, setReady] = useState(false);
  const [t, setT] = useState<LocaleStrings>(() => dictionaryFor(initialLocale));
  const [chatTree, setChatTree] = useState<ChatTree>(() =>
    chatFor(initialLocale),
  );
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
    if (stored !== initialLocale) {
      setT(dictionaryFor(stored));
      setChatTree(chatFor(stored));
      setLocaleState(stored);
    }
    document.documentElement.lang = stored;
    setReady(true);
  }, [initialLocale]);

  useEffect(() => {
    if (!ready) return;
    setT(dictionaryFor(locale));
    setChatTree(chatFor(locale));
  }, [locale, ready]);

  useEffect(() => {
    if (wasTranslating.current && pendingScrollRestore) {
      beginScrollPreservation(pendingScrollRestore);
    }
    wasTranslating.current = false;
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale, scrollSnapshot?: ScrollSnapshot) => {
      if (typeof window !== "undefined") {
        beginScrollPreservation(scrollSnapshot ?? captureScrollSnapshot());
        syncLangSearchParam(next);
      }

      setT(dictionaryFor(next));
      setChatTree(chatFor(next));
      document.cookie = `${LANG_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
      document.documentElement.lang = next;
      startTransition(() => {
        setLocaleState(next);
        router.refresh();
      });
    },
    [router],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      chatTree,
      locales: LOCALES,
      translating: !ready,
    }),
    [locale, setLocale, ready, t, chatTree],
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
