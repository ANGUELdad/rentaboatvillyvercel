"use client";

import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import {
  Anchor,
  CalendarCheck,
  Languages,
  PartyPopper,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { useRef, type RefObject } from "react";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import {
  appleSpringSoft,
  homeScrollViewport,
  staggerContainer,
  staggerItem,
  staggerItemReduced,
  staggerStep,
} from "@/lib/motion";
import { useI18n } from "@/providers/LanguageProvider";

const PILLARS: {
  icon: LucideIcon;
  key:
    | "equipped"
    | "amenities"
    | "languages"
    | "celebrate"
    | "earlyBooking"
    | "marina";
}[] = [
  { key: "equipped", icon: Sparkles },
  { key: "amenities", icon: Sun },
  { key: "languages", icon: Languages },
  { key: "celebrate", icon: PartyPopper },
  { key: "earlyBooking", icon: CalendarCheck },
  { key: "marina", icon: Anchor },
];

const FALLBACK = {
  title: "Why choose Villy Boats?",
  subtitle:
    "Brand-new boats, real on-board equipment, and a team that speaks your language — all from New Port of Limenaria.",
  items: {
    equipped: {
      title: "Brand new & fully equipped",
      desc: "Every boat in our fleet is new, maintained, and ready for a comfortable day on the Aegean.",
    },
    amenities: {
      title: "Premium on-board amenities",
      desc: "Sun tent (canopy), Bluetooth speaker, icebox, anchor, and life jackets for adults and children.",
    },
    languages: {
      title: "We speak your language",
      desc: "Customer service in English, French, Romanian, Bulgarian, Serbian, Russian, Arabic, and Greek.",
    },
    celebrate: {
      title: "Celebrate with us",
      desc: "Birthdays, weddings, anniversaries, and parties — for kids and adults alike.",
    },
    earlyBooking: {
      title: "Early booking priority",
      desc: "Book ahead for first choice of boat and date.",
    },
    marina: {
      title: "New Port of Limenaria",
      desc: "Pick up on the south coast of Thassos — cast off in minutes and explore hidden gems by sea.",
    },
  },
} as const;

const accentLineVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { ...appleSpringSoft, duration: 0.55 },
  },
};

const whyCardChildVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: appleSpringSoft },
};

const whyIconVariants: Variants = {
  hidden: { scale: 0.62, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 380, damping: 24 },
  },
};

function resolveWhyCardVariants(coarsePointer: boolean, reduceMotion: boolean | null): Variants {
  if (reduceMotion) return staggerItemReduced;

  return {
    hidden: coarsePointer
      ? { opacity: 0, y: 14, scale: 0.97 }
      : { opacity: 0, y: 22, scale: 0.94 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        ...appleSpringSoft,
        delay: index * staggerStep * 0.35,
        staggerChildren: 0.05,
        delayChildren: 0.08,
      },
    }),
  };
}

function WhyChooseCard({
  index,
  total,
  icon: Icon,
  title,
  desc,
}: {
  index: number;
  total: number;
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  const reduceMotion = useReducedMotion();
  const coarsePointer = useCoarsePointer();
  const cardVariants = resolveWhyCardVariants(coarsePointer, reduceMotion);

  if (reduceMotion) {
    return (
      <article className="why-choose__card !flex-col !items-start !gap-2 !p-3.5 snap-center shrink-0 w-[76vw] max-w-[19rem] lg:w-auto lg:max-w-none">
        <span className="flex w-full items-center gap-2">
          <span className="why-choose__icon !size-9" aria-hidden>
            <Icon className="size-[18px]" strokeWidth={1.5} />
          </span>
          <span
            aria-hidden
            className="ml-auto shrink-0 text-[11px] font-semibold tabular-nums text-ds-text-muted lg:hidden"
          >
            {index + 1}/{total}
          </span>
        </span>
        <div className="why-choose__card-body">
          <h3 className="why-choose__card-title !text-[14px] !leading-snug sm:!text-[15px]">
            {title}
          </h3>
          <p className="why-choose__card-desc !text-[12px] !leading-snug sm:!text-[12.5px]">
            {desc}
          </p>
        </div>
      </article>
    );
  }

  return (
    <motion.article
      custom={index}
      className="why-choose__card !flex-col !items-start !gap-2 !p-3.5 snap-center shrink-0 w-[76vw] max-w-[19rem] lg:w-auto lg:max-w-none"
      initial="hidden"
      whileInView="visible"
      viewport={homeScrollViewport}
      variants={cardVariants}
      whileHover={{ y: coarsePointer ? -2 : -5 }}
      transition={appleSpringSoft}
    >
      <span className="flex w-full items-center gap-2">
        <motion.span className="why-choose__icon !size-9" variants={whyIconVariants} aria-hidden>
          <Icon className="size-[18px]" strokeWidth={1.5} />
        </motion.span>
        <span
          aria-hidden
          className="ml-auto shrink-0 text-[11px] font-semibold tabular-nums text-ds-text-muted lg:hidden"
        >
          {index + 1}/{total}
        </span>
      </span>
      <motion.div className="why-choose__card-body" variants={whyCardChildVariants}>
        <h3 className="why-choose__card-title !text-[14px] !leading-snug sm:!text-[15px]">
          {title}
        </h3>
        <p className="why-choose__card-desc !text-[12px] !leading-snug sm:!text-[12.5px]">
          {desc}
        </p>
      </motion.div>
    </motion.article>
  );
}

function WhyChooseAmbientGlow({
  panelRef,
}: {
  panelRef: RefObject<HTMLElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ["start end", "end start"],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], [28, -28]);
  const glowX = useTransform(scrollYProgress, [0, 1], [-16, 16]);

  return (
    <motion.div
      className="why-choose__ambient"
      aria-hidden
      style={{ y: glowY, x: glowX }}
    >
      <span className="why-choose__ambient-orb why-choose__ambient-orb--a" />
      <span className="why-choose__ambient-orb why-choose__ambient-orb--b" />
    </motion.div>
  );
}

export function WhyChooseSection() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const coarsePointer = useCoarsePointer();
  const panelRef = useRef<HTMLElement>(null);
  const enableAmbientScroll = !reduceMotion && !coarsePointer;
  const w = t.home?.whyChoose;
  const title = w?.title ?? FALLBACK.title;
  const subtitle = w?.subtitle ?? FALLBACK.subtitle;
  const headItemVariants = reduceMotion ? staggerItemReduced : staggerItem;

  return (
    <section ref={panelRef} className="why-choose" aria-labelledby="why-choose-title">
      {enableAmbientScroll ? <WhyChooseAmbientGlow panelRef={panelRef} /> : null}

      <div className="why-choose__panel">
        <div className="why-choose__lead">
          {/* The decorative photo rail that sat here is gone. It was
              aria-hidden, so it carried no information, and it showed the same
              boats already presented twice on this page — in the fleet showcase
              directly above and in the gallery below. Its caption pills also
              overflowed their cards at every phone width. The trust line is
              real copy, so it stays. */}
          <div className="why-choose__showcase" aria-hidden>
            <div className="why-choose__showcase-ribbon">
              <Sparkles className="size-4" aria-hidden />
              <span>Brand-new boats, real equipment, local guidance</span>
            </div>
          </div>

          {reduceMotion ? (
            <header className="why-choose__head">
              <h2 id="why-choose-title" className="why-choose__title text-balance">
                {title}
              </h2>
              <p className="why-choose__subtitle text-pretty">{subtitle}</p>
            </header>
          ) : (
            <motion.header
              className="why-choose__head"
              initial="hidden"
              whileInView="visible"
              viewport={homeScrollViewport}
              variants={staggerContainer}
            >
              <motion.span
                className="why-choose__accent-line"
                variants={accentLineVariants}
                aria-hidden
              />
              <motion.h2
                id="why-choose-title"
                className="why-choose__title text-balance"
                variants={headItemVariants}
              >
                {title}
              </motion.h2>
              <motion.p className="why-choose__subtitle text-pretty" variants={headItemVariants}>
                {subtitle}
              </motion.p>
            </motion.header>
          )}

          <div className="why-choose__stats" aria-label="Key boat rental highlights">
            <div className="why-choose__stat">
              <span className="why-choose__stat-kicker">Fleet</span>
              <strong className="why-choose__stat-value">8 boats</strong>
            </div>
            <div className="why-choose__stat">
              <span className="why-choose__stat-kicker">Licence</span>
              <strong className="why-choose__stat-value">No licence up to 30HP</strong>
            </div>
            <div className="why-choose__stat">
              <span className="why-choose__stat-kicker">Base</span>
              <strong className="why-choose__stat-value">New Port of Limenaria</strong>
            </div>
          </div>
        </div>

        {/* A scroll journey on phones: the six points become a snapping rail
            you swipe through one at a time, each numbered so you know where you
            are in the sequence, rather than a static block of cards you skim
            past. Desktop keeps the grid — there is room to see them at once.
            Set here rather than globals.css because fifteen competing
            .why-choose__grid rules make that cascade unpredictable, and rules
            appended to the end of that file are dropped by the build. */}
        <div
          className="why-choose__grid !flex snap-x snap-mandatory !gap-3 overflow-x-auto overscroll-x-contain scroll-pl-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:!grid lg:!grid-cols-3 lg:snap-none lg:overflow-visible lg:pb-0">
          {PILLARS.map((pillar, index) => {
            const copy = w?.items?.[pillar.key] ?? FALLBACK.items[pillar.key];

            return (
              <WhyChooseCard
                key={pillar.key}
                index={index}
                total={PILLARS.length}
                icon={pillar.icon}
                title={copy.title}
                desc={copy.desc}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
