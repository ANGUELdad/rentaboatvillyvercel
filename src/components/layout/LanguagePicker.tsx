"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { Locale } from "@/lib/i18n";
import { Z } from "@/lib/z-index";
import { cn } from "@/lib/utils";
import { playFeedback } from "@/lib/feedback";
import {
  captureScrollSnapshot,
  type ScrollSnapshot,
  useI18n,
} from "@/providers/LanguageProvider";

interface LanguagePickerProps {
  variant?: "header" | "footer";
  /** Compact flag+code control for mobile header (lg:hidden row) */
  compact?: boolean;
  /** Flat icon inside grouped iOS glass dock */
  inDock?: boolean;
}

function LanguageOptions({
  locale,
  locales,
  onPick,
}: {
  locale: Locale;
  locales: ReturnType<typeof useI18n>["locales"];
  onPick: (code: Locale) => void;
}) {
  return (
    <div className="space-y-1.5" role="group">
      {locales.map((l) => {
        const active = l.code === locale;
        return (
          <button
            key={l.code}
            type="button"
            data-sfx-skip
            onClick={() => onPick(l.code)}
            className={cn(
              "flex w-full min-h-[48px] items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
              active
                ? "border-brand-green/40 bg-brand-green/10"
                : "border-ds-border bg-ds-surface/70 hover:bg-ds-surface active:bg-ds-surface-hover",
            )}
          >
            <span className="text-xl leading-none">{l.flag}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ds-text">{l.label}</p>
              <p className="text-[10px] uppercase text-ds-text-muted">{l.code}</p>
            </div>
            {active && <Check className="size-4 shrink-0 text-brand-green" />}
          </button>
        );
      })}
    </div>
  );
}

export function LanguagePicker({
  variant = "header",
  compact = false,
  inDock = false,
}: LanguagePickerProps) {
  const { locale, setLocale, locales, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const isMobile = useIsMobile();
  /** Compact header sits in lg:hidden row — use sheet there, not a floating portal */
  const useSheet = compact || isMobile;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const scrollBeforeOpenRef = useRef<ScrollSnapshot | null>(null);
  const current = locales.find((l) => l.code === locale)!;
  const label = t.common?.language ?? "Language";
  const ariaLabel = `${label}: ${current.label}`;

  const rememberScroll = () => {
    if (typeof window !== "undefined") {
      scrollBeforeOpenRef.current = captureScrollSnapshot();
    }
  };

  const pick = (code: Locale) => {
    if (code !== locale) playFeedback("select", "light");
    const scrollSnapshot =
      scrollBeforeOpenRef.current ??
      (typeof window !== "undefined" ? captureScrollSnapshot() : undefined);
    scrollBeforeOpenRef.current = null;
    setOpen(false);

    const applyLocale = () => setLocale(code, scrollSnapshot);
    if (useSheet) {
      // Wait for sheet scroll-lock to release before swapping locale.
      window.setTimeout(applyLocale, 300);
    } else {
      requestAnimationFrame(applyLocale);
    }
  };

  const updateMenuPos = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  };

  const toggle = () => {
    if (!open) {
      rememberScroll();
      updateMenuPos();
      playFeedback("open", "light");
    } else {
      playFeedback("dismiss", "light");
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!useSheet) setOpen(false);
  }, [useSheet]);

  useEffect(() => {
    if (!open || useSheet) return;
    updateMenuPos();
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      const menu = document.getElementById("lang-picker-menu");
      if (menu?.contains(target)) return;
      playFeedback("dismiss", "light");
      setOpen(false);
    };
    const onLayout = () => updateMenuPos();
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
    };
  }, [open, useSheet]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playFeedback("dismiss", "light");
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const triggerClass =
    variant === "footer"
      ? "flex h-11 w-full min-h-[44px] items-center gap-3 rounded-xl border border-ds-border bg-ds-surface/70 px-3 text-left transition-colors hover:border-brand-green/30 active:bg-ds-surface-hover"
      : compact
        ? cn(
            "header-icon-btn header-icon-btn--lang tap-target tap-target--icon btn-center box-border shrink-0 overflow-visible rounded-xl p-0 leading-none transition-colors",
            inDock
              ? "header-icon-btn--dock text-ds-text-secondary hover:text-ds-text"
              : "glass-subtle border-ds-border/70 text-ds-text-secondary hover:border-ds-brand/35 hover:text-ds-text active:scale-[0.96]",
          )
        : "glass-subtle inline-flex h-10 min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border-ds-border/70 px-2.5 text-ds-text-secondary leading-none transition-colors hover:border-brand-green/30 hover:text-ds-text active:scale-[0.96] sm:gap-2 sm:px-3";

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => {
        if (useSheet) {
          rememberScroll();
          playFeedback("open", "light");
          setOpen(true);
        } else {
          toggle();
        }
      }}
      data-sfx-skip
      aria-label={ariaLabel}
      aria-expanded={open}
      aria-haspopup="listbox"
      className={triggerClass}
      style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
    >
      {compact ? (
        <span className="relative z-[1] flex size-full items-center justify-center leading-none" aria-hidden>
          {current.flag}
        </span>
      ) : (
        <>
          {variant === "header" && (
            <Globe
              className="relative z-[1] size-4 shrink-0 text-ds-brand"
              aria-hidden
            />
          )}
          <span className="relative z-[1] text-base leading-none sm:text-lg">
            {current.flag}
          </span>
          <span
            className={cn(
              "relative z-[1] min-w-0 font-medium text-balance leading-snug text-ds-text",
              variant === "footer" ? "flex-1 text-sm" : "hidden text-xs sm:inline",
            )}
          >
            {current.label}
          </span>
          {variant === "header" && (
            <span className="relative z-[1] text-[10px] font-semibold text-ds-text-muted sm:hidden">
              {current.code.toUpperCase()}
            </span>
          )}
          <ChevronDown
            className={cn(
              "relative z-[1] size-3.5 shrink-0 text-ds-text-muted transition-transform duration-150",
              open && !useSheet && "rotate-180",
            )}
          />
        </>
      )}
    </button>
  );

  return (
    <>
      {trigger}

      {useSheet ? (
        <Sheet
          open={open}
          onOpenChange={(next) => {
            if (!next && open) playFeedback("dismiss", "light");
            setOpen(next);
          }}
        >
          <SheetContent
            side="bottom"
            initialFocus={false}
            finalFocus={false}
            className="glass-elevated !max-w-none max-h-[85vh] rounded-t-2xl border-t border-ds-border px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <SheetHeader className="mb-3 p-0">
              <SheetTitle className="flex items-center gap-2 text-sm font-medium text-ds-text">
                <Globe className="size-4 text-brand-green" />
                {label}
              </SheetTitle>
            </SheetHeader>
            <LanguageOptions locale={locale} locales={locales} onPick={pick} />
          </SheetContent>
        </Sheet>
      ) : (
        open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="lang-picker-menu"
            role="listbox"
            aria-label={label}
            className="glass-elevated !fixed !w-56 !max-w-none max-h-[min(70vh,400px)] overflow-y-auto rounded-2xl border border-ds-border p-2 shadow-xl"
            style={{
              zIndex: Z.dropdown,
              top: menuPos.top,
              right: menuPos.right,
            }}
          >
            <LanguageOptions locale={locale} locales={locales} onPick={pick} />
          </div>,
          document.body,
        )
      )}
    </>
  );
}
