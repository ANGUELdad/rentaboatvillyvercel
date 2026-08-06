"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Languages, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useConsentResolved } from "@/hooks/useConsentResolved";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { appleSpringSoft } from "@/lib/motion";
import { Z } from "@/lib/z-index";
import { useI18n } from "@/providers/LanguageProvider";

/* Written in the language being offered, not the one on screen — a Bulgarian
   visitor reading an English page needs to recognise their own language at a
   glance, so an English prompt would be the one thing they cannot skim. */
const OFFER: Record<Locale, { prompt: string; action: string }> = {
  en: { prompt: "This site is available in English", action: "Switch" },
  el: { prompt: "Ο ιστότοπος είναι διαθέσιμος στα Ελληνικά", action: "Αλλαγή" },
  ro: { prompt: "Acest site este disponibil în română", action: "Schimbă" },
  bg: { prompt: "Сайтът е достъпен на български", action: "Смени" },
  sr: { prompt: "Sajt je dostupan na srpskom", action: "Promeni" },
  de: { prompt: "Diese Seite ist auf Deutsch verfügbar", action: "Wechseln" },
};

const DISMISS_KEY = "tbc-lang-notice-dismissed";
const APPEAR_MS = 3_500;

/** First browser preference we actually publish, ignoring the active locale. */
function detectOffer(active: Locale): Locale | null {
  const prefs =
    typeof navigator !== "undefined"
      ? (navigator.languages ?? [navigator.language]).filter(Boolean)
      : [];

  for (const raw of prefs) {
    const base = raw.toLowerCase().split("-")[0];
    const match = LOCALES.find((l) => l.code === base);
    if (match && match.code !== active) return match.code;
  }
  return null;
}

export function LanguageNotice() {
  const { locale, setLocale } = useI18n();
  const reduceMotion = useReducedMotion();
  const consentResolved = useConsentResolved();
  const [offer, setOffer] = useState<Locale | null>(null);

  const dismiss = useCallback(() => {
    setOffer(null);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode — the notice simply returns next session */
    }
  }, []);

  useEffect(() => {
    /* Wait for the consent bar: two prompts stacked at the bottom of a phone is
       the clutter, and consent is the one the visitor legally must answer. */
    if (!consentResolved) return;
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* ignore */
    }

    const candidate = detectOffer(locale);
    if (!candidate) return;

    const timer = window.setTimeout(() => setOffer(candidate), APPEAR_MS);
    return () => window.clearTimeout(timer);
  }, [consentResolved, locale]);

  const meta = offer ? LOCALES.find((l) => l.code === offer) : null;
  if (!meta || !offer) return null;

  const copy = OFFER[offer];

  return (
    <AnimatePresence>
      {offer && (
        <motion.div
          role="dialog"
          aria-label={copy.prompt}
          initial={reduceMotion ? { opacity: 0 } : { y: -24, opacity: 0 }}
          animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: -24, opacity: 0 }}
          transition={appleSpringSoft}
          className="fixed inset-x-0 flex justify-center px-3"
          style={{
            zIndex: Z.cookie - 1,
            top: "calc(5.25rem + env(safe-area-inset-top, 0px))",
          }}
        >
          <div className="flex w-full max-w-md items-center gap-2.5 rounded-2xl border border-white/60 bg-white/95 px-3 py-2.5 shadow-[0_18px_44px_-14px_rgba(15,45,75,0.5)] backdrop-blur-xl">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ds-brand/10 text-[17px]">
              <span aria-hidden>{meta.flag}</span>
            </span>

            <p className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-ds-text">
              {copy.prompt}
            </p>

            <button
              type="button"
              onClick={() => {
                setLocale(offer);
                dismiss();
              }}
              className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-lg bg-[var(--color-ds-brand)] px-2.5 text-[12.5px] font-semibold leading-none text-white transition-[filter] duration-200 hover:brightness-[1.05] active:brightness-95"
            >
              <Languages className="size-[15px] shrink-0" aria-hidden />
              {copy.action}
            </button>

            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="grid size-7 shrink-0 place-items-center rounded-lg text-ds-text-muted transition-colors hover:bg-black/5 hover:text-ds-text"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
