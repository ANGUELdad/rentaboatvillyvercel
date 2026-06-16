"use client";

import type { ReactNode } from "react";
import {
  ScrollReveal,
  ScrollRevealStagger,
  type ScrollRevealVariant,
} from "@/components/ui/ScrollReveal";

export type HomeRevealVariant = ScrollRevealVariant;

export function HomeScrollReveal({
  children,
  className,
  variant = "up",
  delay = 0,
  stagger = false,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  variant?: HomeRevealVariant;
  delay?: number;
  stagger?: boolean;
  as?: "div" | "section" | "nav" | "header";
}) {
  if (stagger) {
    return (
      <ScrollReveal variant={variant} delay={delay} as={as} className={className}>
        <ScrollRevealStagger>{children}</ScrollRevealStagger>
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal
      variant={variant}
      delay={delay}
      as={as}
      className={className}
    >
      {children}
    </ScrollReveal>
  );
}

/** Stagger children as they enter the viewport (cards, list items). */
export function HomeScrollStagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <ScrollRevealStagger className={className}>{children}</ScrollRevealStagger>;
}
