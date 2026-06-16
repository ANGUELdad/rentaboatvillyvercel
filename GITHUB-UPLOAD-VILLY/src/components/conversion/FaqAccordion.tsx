"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { FaqAnswerText } from "@/components/faq/FaqAnswerText";
import { playFeedback } from "@/lib/feedback";
import { appleSpringSoft } from "@/lib/motion";
import type { FaqItem } from "@/lib/i18n/types";

interface FaqAccordionProps {
  items: FaqItem[];
  title?: string;
  className?: string;
}

export function FaqAccordion({ items, title, className = "" }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<number | null>(0);
  const baseId = useId();

  if (items.length === 0) return null;

  return (
    <section className={className} aria-labelledby={title ? `${baseId}-title` : undefined}>
      {title && (
        <h2 id={`${baseId}-title`} className="text-base font-bold text-ds-text">
          {title}
        </h2>
      )}
      <div className={`space-y-2 ${title ? "mt-3" : ""}`}>
        {items.map((item, i) => {
          const panelId = `${baseId}-panel-${i}`;
          const triggerId = `${baseId}-trigger-${i}`;
          const isOpen = openId === i;
          return (
            <div
              key={item.q}
              className="glass-card ui-2026-card overflow-hidden rounded-xl border border-ds-border"
            >
              <button
                type="button"
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => {
                  playFeedback(isOpen ? "dismiss" : "open", "light");
                  setOpenId(isOpen ? null : i);
                }}
                data-sfx-skip
                className="tap-target flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-ds-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-brand/50"
              >
                {item.q}
                <ChevronDown
                  className={`size-4 shrink-0 text-ds-text-muted transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={appleSpringSoft}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-ds-border px-4 py-3 text-sm leading-relaxed text-ds-text-secondary">
                      <FaqAnswerText text={item.a} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
