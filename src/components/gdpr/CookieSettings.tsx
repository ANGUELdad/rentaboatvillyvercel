"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { readConsentFromDocument } from "@/lib/cookie-utils";
import { playFeedback } from "@/lib/feedback";
import { Z } from "@/lib/z-index";
import { useI18n } from "@/providers/LanguageProvider";

interface CookieSettingsProps {
  initialAnalytics?: boolean;
  initialMarketing?: boolean;
  onSave: (analytics: boolean, marketing: boolean) => void;
  onClose: () => void;
}

export function CookieSettings({
  initialAnalytics,
  initialMarketing,
  onSave,
  onClose,
}: CookieSettingsProps) {
  const { t } = useI18n();
  const [analytics, setAnalytics] = useState(initialAnalytics ?? false);
  const [marketing, setMarketing] = useState(initialMarketing ?? false);

  useEffect(() => {
    const existing = readConsentFromDocument();
    if (existing) {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }
  }, []);

  return (
    <div
      className="cookie-settings-sheet pointer-events-none fixed inset-x-0 bottom-0 layout-safe"
      style={{
        zIndex: Z.cookieSettings,
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto mx-auto max-h-[min(70vh,28rem)] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-b-0 border-ds-border/80 bg-ds-surface/98 p-4 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md sm:rounded-2xl sm:p-5"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xs font-medium tracking-[0.08em] text-ds-text uppercase sm:text-sm">
            {t.cookies.settingsTitle}
          </h2>
          <button
            type="button"
            data-sfx-skip
            onClick={() => {
              playFeedback("dismiss", "light");
              onClose();
            }}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ds-text-muted hover:bg-ds-surface-hover"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          <div className="rounded-xl border border-ds-border bg-ds-surface/60 p-3.5">
            <div className="flex justify-between gap-3">
              <div>
                <p className="text-sm text-ds-text">{t.cookies.necessary}</p>
                <p className="text-xs text-ds-text-secondary">{t.cookies.necessaryDesc}</p>
              </div>
              <span className="text-[10px] text-ds-brand uppercase">{t.cookies.alwaysOn}</span>
            </div>
          </div>
          <ToggleRow
            label={t.cookies.analytics}
            desc={t.cookies.analyticsDesc}
            checked={analytics}
            onChange={setAnalytics}
          />
          <ToggleRow
            label={t.cookies.marketing}
            desc={t.cookies.marketingDesc}
            checked={marketing}
            onChange={setMarketing}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            data-sfx-skip
            onClick={() => {
              playFeedback("dismiss", "light");
              onSave(false, false);
            }}
            className="cookie-consent__btn btn-app-secondary min-h-[44px] flex-1 rounded-xl py-2.5 text-[11px] tracking-[0.08em] uppercase"
          >
            {t.cookies.reject}
          </button>
          <button
            type="button"
            data-sfx-skip
            onClick={() => {
              playFeedback("success", "success");
              onSave(analytics, marketing);
            }}
            className="cookie-consent__btn btn-app-primary min-h-[44px] flex-1 rounded-xl py-2.5 text-[11px] tracking-[0.08em] uppercase"
          >
            {t.cookies.save}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-ds-border bg-ds-surface/60 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ds-text">{label}</p>
          <p className="text-xs text-ds-text-secondary">{desc}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          data-sfx-skip
          onClick={() => {
            playFeedback("select", "light");
            onChange(!checked);
          }}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-ds-brand/70" : "bg-ds-border-strong"}`}
        >
          <span
            className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform ${checked ? "left-5" : "left-0.5"}`}
          />
        </button>
      </div>
    </div>
  );
}
