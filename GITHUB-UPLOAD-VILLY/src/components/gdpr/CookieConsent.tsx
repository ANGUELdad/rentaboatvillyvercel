"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { buildConsentCookie } from "@/lib/consent";
import { logConsentToServer } from "@/lib/consent-log";
import { readConsentFromDocument, writeConsentToDocument } from "@/lib/cookie-utils";
import { playFeedback } from "@/lib/feedback";
import { Z } from "@/lib/z-index";
import { useI18n } from "@/providers/LanguageProvider";
import { CookieSettings } from "./CookieSettings";

const COOKIE_PROMPT_DELAY_MS = 5_200;

export function CookieConsent() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consentId, setConsentId] = useState<string | undefined>();
  const [mounted, setMounted] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const existing = readConsentFromDocument();
    if (existing) {
      setConsentId(existing.consentId);
      return;
    }

    let cancelled = false;
    let timer = 0;

    const showPrompt = () => {
      if (!cancelled) setVisible(true);
    };

    const schedulePrompt = () => {
      const requestIdle =
        "requestIdleCallback" in window
          ? window.requestIdleCallback.bind(window)
          : null;

      if (!requestIdle) {
        showPrompt();
        return;
      }

      requestIdle(() => showPrompt(), { timeout: 1200 });
    };

    timer = window.setTimeout(schedulePrompt, COOKIE_PROMPT_DELAY_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const barOnScreen = mounted && visible && !showSettings;

    const clear = () => {
      delete root.dataset.cookieBarVisible;
      root.style.removeProperty("--cookie-bar-h");
    };

    if (!barOnScreen) {
      clear();
      return;
    }

    root.dataset.cookieBarVisible = "true";

    /* Publish the bar's real height so the hero can lift its CTA clear of it.
       Measured rather than assumed — el/de/ro wrap to taller bars than en. */
    const bar = barRef.current;
    if (!bar) return clear;

    const publishHeight = () => {
      const { height } = bar.getBoundingClientRect();
      root.style.setProperty("--cookie-bar-h", `${Math.ceil(height)}px`);
    };

    publishHeight();
    const observer = new ResizeObserver(publishHeight);
    observer.observe(bar);

    return () => {
      observer.disconnect();
      clear();
    };
  }, [mounted, visible, showSettings]);

  const saveConsent = useCallback(
    (analytics: boolean, marketing: boolean) => {
      setVisible(false);
      setShowSettings(false);

      const newPrefs = buildConsentCookie({ analytics, marketing, consentId });
      writeConsentToDocument(newPrefs);
      setConsentId(newPrefs.consentId);
      void logConsentToServer({
        consentId: newPrefs.consentId,
        analytics,
        marketing,
        policyVersion: newPrefs.policyVersion,
      });
    },
    [consentId],
  );

  if (!mounted) return null;

  return (
    <>
      {visible && !showSettings && (
        <div
          ref={barRef}
          role="region"
          aria-label={t.cookies.title}
          className="cookie-consent-bar pointer-events-none fixed inset-x-0 bottom-0 layout-safe"
          style={{
            zIndex: Z.cookie,
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          }}
        >
          <div className="cookie-consent-card pointer-events-auto mx-auto flex max-w-md flex-col gap-3 px-3 sm:max-w-lg sm:px-4">
            <p className="cookie-consent-card__text text-[12px] leading-relaxed text-ds-text-secondary sm:text-[13px]">
              {t.cookies.desc}{" "}
              <Link href="/cookies" className="text-ds-brand underline underline-offset-2">
                {t.cookies.policy}
              </Link>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-sfx-skip
                onPointerUp={(e) => {
                  e.preventDefault();
                  saveConsent(true, true);
                }}
                className="cookie-consent__btn cookie-consent__btn--primary min-h-[40px] rounded-xl px-4 py-2 text-[12px] font-semibold sm:text-[13px]"
                style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
              >
                {t.cookies.acceptAll}
              </button>
              <button
                type="button"
                data-sfx-skip
                onPointerUp={(e) => {
                  e.preventDefault();
                  saveConsent(false, false);
                }}
                /* EDPB guidance: refusing must be as easy and as visible as
                   accepting. This was an outlined button with smaller padding
                   and a lighter weight than "accept all" — three separate ways
                   of nudging. Same geometry and weight now, solid fill too, so
                   only the colour differs. */
                className="cookie-consent__btn min-h-[40px] rounded-xl bg-[var(--color-brand-navy)] px-4 py-2 text-[12px] font-semibold text-white ring-1 ring-inset ring-white/15 sm:text-[13px]"
                style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
              >
                {t.cookies.reject}
              </button>
              <button
                type="button"
                data-sfx-skip
                onPointerUp={(e) => {
                  e.preventDefault();
                  setShowSettings(true);
                }}
                className="cookie-consent__btn cookie-consent__btn--link min-h-[40px] rounded-xl px-2 py-2 text-[12px] font-medium sm:text-[13px]"
                style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
              >
                {t.cookies.customize}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <CookieSettings
          onSave={(a, m) => saveConsent(a, m)}
          onClose={() => {
            setShowSettings(false);
            if (!readConsentFromDocument()) setVisible(true);
          }}
        />
      )}
    </>
  );
}

export function CookieSettingsButton({ className }: { className?: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        data-sfx-skip
        onClick={() => {
          playFeedback("open", "light");
          setOpen(true);
        }}
        className={className ?? "transition-colors hover:text-summer-turquoise"}
      >
        {t.cookies.footerSettings}
      </button>
      {open && (
        <CookieSettings
          onSave={(a, m) => {
            const prefs = buildConsentCookie({ analytics: a, marketing: m });
            writeConsentToDocument(prefs);
            void logConsentToServer({
              consentId: prefs.consentId,
              analytics: a,
              marketing: m,
              policyVersion: prefs.policyVersion,
            });
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
