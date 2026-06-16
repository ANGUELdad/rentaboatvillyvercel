"use client";

import { Calendar } from "lucide-react";
import { useId, useRef } from "react";
import { cn } from "@/lib/utils";
import { useMobileViewport } from "@/hooks/useMobileViewport";
import { useMounted } from "@/hooks/useMounted";
import { useI18n } from "@/providers/LanguageProvider";

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  className?: string;
}

function formatDisplay(value: string, locale: string) {
  if (!value) return "";
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function openDatePicker(input: HTMLInputElement | null) {
  if (!input) return;
  try {
    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }
  } catch {
    // showPicker can throw without a user gesture on some browsers.
  }
  input.focus({ preventScroll: true });
  input.click();
}

export function DateField({
  value,
  onChange,
  label,
  placeholder = "Pick a date",
  required,
  min,
  max,
  className,
}: DateFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const mounted = useMounted();
  const isMobileViewport = useMobileViewport();
  const isMobile = mounted && isMobileViewport;
  const { locale } = useI18n();
  const dateLocale = locale === "en" ? "en-GB" : locale;

  const fieldLabel = (
    <span className="app-label mb-2 flex items-center gap-1.5">
      <Calendar className="size-3.5 text-brand-green" />
      {label}
    </span>
  );

  if (!isMobile) {
    return (
      <div className={className}>
        {label ? fieldLabel : null}
        <input
          id={id}
          ref={inputRef}
          type="date"
          value={value}
          min={min}
          max={max}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className="date-field-native booking-input app-input w-full min-h-[52px] px-4"
          aria-label={label ?? placeholder}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {label ? fieldLabel : null}
      <div
        role="button"
        tabIndex={0}
        onClick={() => openDatePicker(inputRef.current)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openDatePicker(inputRef.current);
          }
        }}
        className={cn(
          "date-field app-input group relative flex w-full min-h-[52px] cursor-pointer items-center gap-3 px-4 text-left transition-colors hover:border-ds-border-strong hover:bg-ds-surface-hover/60",
          !value && "text-ds-text-muted",
        )}
      >
        <span className="pointer-events-none flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-green/12 text-brand-green transition-colors group-hover:bg-brand-green/18">
          <Calendar className="size-4" />
        </span>
        <span
          className="pointer-events-none min-w-0 flex-1 truncate text-sm font-medium text-ds-text"
          suppressHydrationWarning
        >
          {value ? formatDisplay(value, dateLocale) : placeholder}
        </span>
        <input
          ref={inputRef}
          id={id}
          type="date"
          value={value}
          min={min}
          max={max}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className="date-field-input"
          aria-label={label ?? placeholder}
        />
      </div>
    </div>
  );
}
