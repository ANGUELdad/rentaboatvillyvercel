"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { buildConsentCookie } from "@/lib/consent";
import { logConsentToServer } from "@/lib/consent-log";
import { readConsentFromDocument, writeConsentToDocument } from "@/lib/cookie-utils";
import { playFeedback } from "@/lib/feedback";
import { Z } from "@/lib/z-index";
import { useI18n } from "@/providers/LanguageProvider";
import { CookieSettings } from "./CookieSettings";

const COOKIE_PROMPT_DELAY_MS = 2_400;

export function CookieConsent() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consentId, setConsentId] = useState<string | undefined>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existing = readConsentFromDocument();
    if (existing) {
      setConsentId(existing.consentId);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), COOKIE_PROMPT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const shouldOffsetFab = mounted && visible && !showSettings;
    if (shouldOffsetFab) {
      root.dataset.cookieBarVisible = "true";
    } else {
      delete root.dataset.cookieBarVisible;
    }

    return () => {
      delete root.dataset.cookieBarVisible;
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
                className="cookie-consent__btn cookie-consent__btn--ghost min-h-[40px] rounded-xl px-3 py-2 text-[12px] font-medium sm:text-[13px]"
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
