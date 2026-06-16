"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import {
  resolveScrollRevealVariants,
  type ScrollRevealVariant,
} from "@/components/ui/ScrollReveal";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import {
  appleSpringSoft,
  homeScrollViewport,
  staggerContainer,
  staggerItem,
  staggerItemReduced,
  staggerStep,
} from "@/lib/motion";

interface ImmersiveSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  stagger?: boolean;
  variant?: ScrollRevealVariant;
  /** Skip scroll-reveal entrance — content stays visible (e.g. promos above the fold). */
  reveal?: boolean;
}

const childVariants = {
  hidden: staggerItem.hidden,
  visible: (i: number) => ({
    ...staggerItem.visible,
    transition: { ...appleSpringSoft, delay: i * staggerStep },
  }),
};

export function ImmersiveSection({
  children,
  className = "",
  id,
  delay = 0,
  stagger = false,
  variant = "up",
  reveal = true,
}: ImmersiveSectionProps) {
  const reduceMotion = useReducedMotion();
  const coarsePointer = useCoarsePointer();
  const sectionVariants: Variants = resolveScrollRevealVariants(
    variant,
    reduceMotion,
    coarsePointer,
  );

  if (reduceMotion || !reveal) {
    return (
      <section id={id} className={`home-section-flow relative overflow-x-clip min-w-0 ${className}`}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={homeScrollViewport}
      variants={sectionVariants}
      transition={{ ...appleSpringSoft, delay }}
      className={`home-section-flow home-section-reveal relative overflow-x-clip min-w-0 ${className}`}
    >
      <motion.span
        aria-hidden
        className="home-section-reveal__line"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={homeScrollViewport}
        transition={{ ...appleSpringSoft, delay: delay + 0.04, duration: 0.38 }}
      />
      {stagger ? (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={homeScrollViewport}
          variants={staggerContainer}
          className="contents"
        >
          {Array.isArray(children)
            ? children.map((child, i) => (
                <motion.div key={i} custom={i} variants={childVariants} className="contents">
                  {child}
                </motion.div>
              ))
            : children}
        </motion.div>
      ) : (
        children
      )}
    </motion.section>
  );
}
