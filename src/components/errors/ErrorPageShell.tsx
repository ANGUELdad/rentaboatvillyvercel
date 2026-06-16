"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/layout/Logo";
import { ui2026Reveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ErrorPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  eyebrowClassName?: string;
  children: React.ReactNode;
}

export function ErrorPageShell({
  eyebrow,
  title,
  description,
  eyebrowClassName,
  children,
}: ErrorPageShellProps) {
  return (
    <div className="ui-2026-page ui-2026-ambient layout-safe panel-fit flex min-h-[60dvh] flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-24">
      <div
        aria-hidden
        className="ui-2026-orb-drift pointer-events-none absolute -left-10 top-1/4 size-48 rounded-full bg-ds-brand/10 blur-[70px]"
      />
      <motion.div
        initial={ui2026Reveal.initial}
        animate={ui2026Reveal.animate}
        transition={ui2026Reveal.transition}
        className="glass-panel ui-2026-surface layout-safe panel-fit w-full max-w-lg rounded-2xl border border-ds-border p-6 text-center sm:p-10"
      >
        <div className="mx-auto mb-6 flex justify-center">
          <Logo linked={false} size="lg" />
        </div>
        <p className={cn("section-eyebrow mb-3 text-ds-brand", eyebrowClassName)}>{eyebrow}</p>
        <h1 className="section-title mb-4 text-ds-text">{title}</h1>
        <p className="section-subtitle mx-auto max-w-md text-ds-text-secondary">{description}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
