"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import { type ReactNode } from "react";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useScrollInView } from "@/hooks/useScrollInView";
import {
  appleSpringSoft,
  homeScrollViewport,
  scaleIn,
  scaleInReduced,
  scrollReveal,
  scrollRevealFromRight,
  scrollRevealFromRightReduced,
  scrollRevealReduced,
  scrollRevealScaleTouch,
  scrollRevealSlideLeft,
  scrollRevealSlideLeftTouch,
  scrollRevealSlideRight,
  scrollRevealSlideRightTouch,
  scrollRevealTouch,
  staggerContainer,
  staggerItem,
  staggerItemReduced,
  staggerStep,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

export type ScrollRevealVariant = "up" | "left" | "right" | "scale";

const VARIANT_SETS: Record<
  ScrollRevealVariant,
  { full: Variants; touch: Variants; reduced: Variants }
> = {
  up: {
    full: scrollReveal,
    touch: scrollRevealTouch,
    reduced: scrollRevealReduced,
  },
  left: {
    full: scrollRevealSlideLeft,
    touch: scrollRevealSlideLeftTouch,
    reduced: scrollRevealReduced,
  },
  right: {
    full: scrollRevealSlideRight,
    touch: scrollRevealSlideRightTouch,
    reduced: scrollRevealReduced,
  },
  scale: {
    full: scaleIn,
    touch: scrollRevealScaleTouch,
    reduced: scaleInReduced,
  },
};

/** Legacy alias — maps to horizontal slide-in from the right. */
const FROM_RIGHT = {
  full: scrollRevealFromRight,
  touch: scrollRevealFromRight,
  reduced: scrollRevealFromRightReduced,
};

export function resolveScrollRevealVariants(
  variant: ScrollRevealVariant,
  reduceMotion: boolean | null,
  coarsePointer: boolean,
): Variants {
  const set = VARIANT_SETS[variant];
  if (reduceMotion) return set.reduced;
  if (coarsePointer) return set.touch;
  return set.full;
}

export function useScrollRevealMotion(variant: ScrollRevealVariant = "up") {
  const reduceMotion = useReducedMotion();
  const coarsePointer = useCoarsePointer();
  return {
    reduceMotion,
    variants: resolveScrollRevealVariants(variant, reduceMotion, coarsePointer),
    viewport: homeScrollViewport,
    transition: appleSpringSoft,
  };
}

type MotionTag =
  | "div"
  | "section"
  | "article"
  | "nav"
  | "header"
  | "span"
  | "p";

interface ScrollRevealProps
  extends Omit<
    HTMLMotionProps<"div">,
    | "initial"
    | "whileInView"
    | "viewport"
    | "variants"
    | "transition"
    | "children"
  > {
  children?: ReactNode;
  /** @deprecated Use `variant="right"` instead. */
  direction?: "up" | "right";
  variant?: ScrollRevealVariant;
  delay?: number;
  as?: MotionTag;
  viewport?: typeof homeScrollViewport;
}

export function ScrollReveal({
  children,
  className,
  direction,
  variant: variantProp = "up",
  delay = 0,
  as = "div",
  viewport,
  ...props
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();
  const coarsePointer = useCoarsePointer();
  const variant = direction === "right" ? "right" : variantProp;
  const { variants, viewport: defaultViewport, transition } = useScrollRevealMotion(variant);
  const vp = viewport ?? defaultViewport;
  const { ref, isInView } = useScrollInView(vp);

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as] as typeof motion.div;
  const useEntrance = !coarsePointer;

  return (
    <MotionTag
      ref={ref as never}
      initial={useEntrance ? "hidden" : false}
      animate={useEntrance ? (isInView ? "visible" : "hidden") : undefined}
      whileInView={useEntrance ? undefined : "visible"}
      viewport={useEntrance ? undefined : vp}
      variants={variants}
      transition={{ ...transition, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </MotionTag>
  );
}

/** Horizontal slide from the right (legacy ScrollReveal `direction="right"`). */
export function ScrollRevealFromRight({
  children,
  className,
  delay = 0,
  as = "div",
  viewport,
  ...props
}: Omit<ScrollRevealProps, "variant" | "direction">) {
  const reduceMotion = useReducedMotion();
  const coarsePointer = useCoarsePointer();
  const variants = reduceMotion
    ? FROM_RIGHT.reduced
    : coarsePointer
      ? FROM_RIGHT.touch
      : FROM_RIGHT.full;

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      initial={false}
      whileInView="visible"
      viewport={viewport ?? homeScrollViewport}
      variants={variants}
      transition={{ ...appleSpringSoft, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </MotionTag>
  );
}

interface ScrollRevealStaggerProps {
  children: ReactNode;
  className?: string;
  as?: MotionTag;
  viewport?: typeof homeScrollViewport;
}

/** Stagger children as they enter the viewport (cards, list items). */
export function ScrollRevealStagger({
  children,
  className,
  as = "div",
  viewport,
}: ScrollRevealStaggerProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      initial={false}
      whileInView="visible"
      viewport={viewport ?? homeScrollViewport}
      variants={staggerContainer}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={staggerItem}>
              {child}
            </motion.div>
          ))
        : children}
    </MotionTag>
  );
}

/** Stagger with per-item delay based on index (for mapped lists). */
export function ScrollRevealItem({
  children,
  index = 0,
  className,
  as = "div",
  viewport,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  as?: MotionTag;
  viewport?: typeof homeScrollViewport;
}) {
  const reduceMotion = useReducedMotion();
  const coarsePointer = useCoarsePointer();
  const { ref, isInView } = useScrollInView(viewport ?? homeScrollViewport);
  const useEntrance = !reduceMotion && !coarsePointer;

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref as never}
      initial={useEntrance ? "hidden" : false}
      animate={useEntrance ? (isInView ? "visible" : "hidden") : undefined}
      whileInView={useEntrance ? undefined : "visible"}
      viewport={useEntrance ? undefined : viewport ?? homeScrollViewport}
      variants={staggerItem}
      transition={{ ...appleSpringSoft, delay: index * staggerStep }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

export { staggerItemReduced };
