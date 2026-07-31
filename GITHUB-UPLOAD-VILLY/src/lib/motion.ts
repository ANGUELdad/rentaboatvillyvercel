/** Premium hero mask-reveal — blueprint spring (stiffness 100, damping 20) */
export const premiumHeroSpring = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
  mass: 1,
};

/** Apple-like motion presets (spring physics + easing) */
export const appleSpring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 30,
  mass: 0.85,
};

export const appleSpringSoft = {
  type: "spring" as const,
  stiffness: 220,
  damping: 28,
  mass: 1,
};

export const appleSpringSnappy = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.75,
};

export const appleEase = [0.32, 0.72, 0, 1] as const;

export const revealUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: appleSpringSoft,
};

export const staggerStep = 0.06;

/** Star fill-in stagger (~65ms between stars). */
export const starStagger = 0.065;

/** Pop entrance — one star at a time (~170ms apart). */
export const starPopStagger = 0.17;

export const carouselSlide = {
  enter: (d: number) => ({
    x: d > 0 ? 44 : -44,
    opacity: 0,
    scale: 0.94,
    filter: "blur(5px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (d: number) => ({
    x: d > 0 ? -44 : 44,
    opacity: 0,
    scale: 0.94,
    filter: "blur(5px)",
  }),
};

export const carouselSlideReduced = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

/** Scroll-triggered section reveal (opacity + lift). */
export const scrollReveal = {
  hidden: { opacity: 0, y: 24, scale: 0.99 },
  visible: { opacity: 1, y: 0, scale: 1, transition: appleSpringSoft },
};

export const scrollRevealReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

/** Lighter reveal for touch devices — still animates on scroll. */
export const scrollRevealTouch = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: appleSpringSoft },
};

export const scrollRevealSlideLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: appleSpringSoft },
};

export const scrollRevealSlideLeftTouch = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0, transition: appleSpringSoft },
};

export const scrollRevealSlideRight = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: appleSpringSoft },
};

export const scrollRevealSlideRightTouch = {
  hidden: { opacity: 0, x: 18 },
  visible: { opacity: 1, x: 0, transition: appleSpringSoft },
};

export const scrollRevealScaleTouch = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: appleSpringSoft },
};

/** Default viewport for home scroll reveals — reveal once to avoid scroll flicker. */
export const homeScrollViewport = {
  once: true,
  amount: 0.12,
  margin: "0px 0px -14% 0px",
} as const;

/** Slide-in from the right for horizontal carousels / cards. */
export const scrollRevealFromRight = {
  hidden: { opacity: 0, x: 36 },
  visible: { opacity: 1, x: 0, transition: appleSpringSoft },
};

export const scrollRevealFromRightReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: staggerStep, delayChildren: 0.06 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: appleSpringSoft },
};

export const staggerItemReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: appleSpringSoft },
};

export const scaleInReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

/** 2026 UI — single-element fade-up reveal */
export const ui2026Reveal = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: appleSpringSoft,
};

/** 2026 UI — stagger container for child reveals */
export const ui2026Stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/** 2026 UI — child variant (use with ui2026Stagger parent) */
export const ui2026RevealChild = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: appleSpringSoft },
};

/** Default count-up animation length (seconds) */
export const countUpDuration = 0.85;

/** Fast count-up for live price tickers */
export const countUpDurationFast = 0.45;

/** Subtle hover lift for cards & panels */
export const hoverLift = {
  y: -4,
  transition: appleSpringSoft,
};

/** Touch-safe hover lift (lighter) */
export const hoverLiftTouch = {
  y: -2,
  transition: appleSpringSoft,
};

/** Tap feedback scale */
export const tapScale = {
  scale: 0.98,
  transition: appleSpringSnappy,
};

/** Selection ring pulse for package builder cards */
export const selectionPulse = {
  scale: [1, 1.02, 1],
  transition: { duration: 0.35, ease: appleEase },
};
