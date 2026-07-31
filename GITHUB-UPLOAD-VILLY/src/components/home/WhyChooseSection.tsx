"use client";

import Image from "next/image";
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

const SHOWCASE = [
  {
    src: "/images/boats/kima.jpg",
    alt: "Kima boat on calm turquoise water near Thassos",
    label: "Kima",
    note: "9 seats",
    layout: "hero",
  },
  {
    src: "/images/boats/nikos-1.jpg",
    alt: "Nikos speedboat ready for a day trip from Limenaria",
    label: "Nikos",
    note: "8 seats",
    layout: "stack",
  },
  {
    src: "/images/boats/limenaria-palataki.jpg",
    alt: "Limenaria coast and boat-friendly waters in Thassos",
    label: "Limenaria",
    note: "New Port",
    layout: "stack",
  },
] as const;

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
  icon: Icon,
  title,
  desc,
}: {
  index: number;
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  const reduceMotion = useReducedMotion();
  const coarsePointer = useCoarsePointer();
  const cardVariants = resolveWhyCardVariants(coarsePointer, reduceMotion);

  if (reduceMotion) {
    return (
      <article className="why-choose__card">
        <span className="why-choose__icon" aria-hidden>
          <Icon className="size-5" strokeWidth={1.35} />
        </span>
        <div className="why-choose__card-body">
          <h3 className="why-choose__card-title">{title}</h3>
          <p className="why-choose__card-desc">{desc}</p>
        </div>
      </article>
    );
  }

  return (
    <motion.article
      custom={index}
      className="why-choose__card"
      initial="hidden"
      whileInView="visible"
      viewport={homeScrollViewport}
      variants={cardVariants}
      whileHover={{ y: coarsePointer ? -2 : -5 }}
      transition={appleSpringSoft}
    >
      <motion.span className="why-choose__icon" variants={whyIconVariants} aria-hidden>
        <Icon className="size-5" strokeWidth={1.35} />
      </motion.span>
      <motion.div className="why-choose__card-body" variants={whyCardChildVariants}>
        <h3 className="why-choose__card-title">{title}</h3>
        <p className="why-choose__card-desc">{desc}</p>
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
          <div className="why-choose__showcase" aria-hidden>
            <div className="why-choose__showcase-rail">
              {SHOWCASE.map((item, index) => (
                <motion.figure
                  key={item.src}
                  className={`why-choose__showcase-cell why-choose__showcase-cell--${item.layout}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                  viewport={homeScrollViewport}
                  transition={{ ...appleSpringSoft, delay: index * 0.05 }}
                >
                  <div className="why-choose__showcase-media">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes={item.layout === "hero" ? "(max-width: 767px) 100vw, 52vw" : "(max-width: 767px) 50vw, 18vw"}
                      className="why-choose__showcase-image"
                    />
                    <div className="why-choose__showcase-scrim" />
                  </div>
                  <figcaption className="why-choose__showcase-caption">
                    <span className="why-choose__showcase-name">{item.label}</span>
                    <span className="why-choose__showcase-note">{item.note}</span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
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

        <div className="why-choose__grid">
          {PILLARS.map((pillar, index) => {
            const copy = w?.items?.[pillar.key] ?? FALLBACK.items[pillar.key];

            return (
              <WhyChooseCard
                key={pillar.key}
                index={index}
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
