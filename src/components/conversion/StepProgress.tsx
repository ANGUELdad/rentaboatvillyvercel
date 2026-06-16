"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/LanguageProvider";

interface StepProgressProps {
  current: 1 | 2;
  className?: string;
}

export function StepProgress({ current, className = "" }: StepProgressProps) {
  const { t } = useI18n();
  const steps = t.conversion?.steps ?? {
    date: "Date & boat",
    contact: "Your details",
  };
  const labels = [steps.date, steps.contact];

  return (
    <nav
      aria-label={t.conversion?.stepsAria ?? "Booking progress"}
      className={cn("booking-steps", className)}
    >
      <ol className="booking-steps__list">
        {labels.map((label, i) => {
          const step = (i + 1) as 1 | 2;
          const done = step < current;
          const active = step === current;
          return (
            <li
              key={label}
              className={cn("booking-steps__item", active && "booking-steps__item--active")}
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "booking-steps__dot",
                  done && "booking-steps__dot--done",
                  active && "booking-steps__dot--active",
                )}
                aria-hidden
              >
                {done ? <Check className="size-3.5" /> : step}
              </span>
              <span className="booking-steps__label">{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
