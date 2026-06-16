"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FaqAnswerText } from "@/components/faq/FaqAnswerText";
import {
  FAQ_HIGHLIGHT_ICONS,
  FAQ_IMAGES,
  FAQ_QUESTION_ICONS,
  HOME_FAQ_LIMIT,
} from "@/components/faq/faq-media";
import { SafeImage } from "@/components/SafeImage";
import { playFeedback } from "@/lib/feedback";
import { appleSpringSoft, homeScrollViewport, staggerStep } from "@/lib/motion";
import { useI18n } from "@/providers/LanguageProvider";

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: appleSpringSoft },
};

const headerVariantsReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: staggerStep, delayChildren: 0.05 },
  },
};

const listVariantsReduced = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.02, delayChildren: 0 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: appleSpringSoft },
};

const itemVariantsReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

type FaqPageCopy = {
  highlightsTitle?: string;
  highlights?: { title: string; desc: string; image?: string }[];
  tips?: string[];
  tipsAria?: string;
  mostAskedTitle?: string;
  viewAllFaq?: string;
  slides?: { src: string; caption: string }[];
};

const DEFAULT_HIGHLIGHTS = [
  {
    title: "No licence ≤30HP",
    desc: "Safety briefing before every departure",
    image: FAQ_IMAGES[1],
  },
  {
    title: "All details at our office",
    desc: "Visit us at New Port of Limenaria for full information",
    image: FAQ_IMAGES[3],
  },
  {
    title: "New Port of Limenaria",
    desc: "South-coast Thassos · Daily 08:00–20:00, May–October",
    image: FAQ_IMAGES[0],
  },
];

export function FAQSection({ hideHeader }: { hideHeader?: boolean }) {
  const { t } = useI18n();
  const page = (t.faq as { page?: FaqPageCopy }).page ?? {};
  const items = t.faq.items ?? [];
  const topItems = items.slice(0, HOME_FAQ_LIMIT);
  const highlights = page.highlights?.length ? page.highlights : DEFAULT_HIGHLIGHTS;
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();

  const panelTransition = reduceMotion
    ? { duration: 0 }
    : { ...appleSpringSoft, opacity: { duration: 0.25 } };

  if (hideHeader) {
    return (
      <FaqAccordionList
        items={items}
        openIndex={openIndex}
        setOpenIndex={setOpenIndex}
        reduceMotion={reduceMotion}
        panelTransition={panelTransition}
      />
    );
  }

  return (
    <section
      id="faq"
      className="home-faq relative w-full min-w-0 box-border"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={homeScrollViewport}
        variants={reduceMotion ? headerVariantsReduced : headerVariants}
        className="home-faq__head mb-8 text-center sm:mb-10 lg:text-left"
      >
        <p className="section-eyebrow mb-3 inline-flex items-center justify-center gap-2 lg:justify-start">
          <Sparkles className="size-4 text-ds-brand" aria-hidden />
          {t.faq.eyebrow}
        </p>
        <h2 className="section-title">{t.faq.title}</h2>
        {t.faq.subtitle && (
          <p className="section-subtitle mx-auto mt-3 max-w-2xl lg:mx-0">{t.faq.subtitle}</p>
        )}
      </motion.div>

      <div className="home-faq__layout">
        <aside className="home-faq__aside">
          <ul className="home-faq__facts" aria-label={page.highlightsTitle ?? "Good to know"}>
            {highlights.map((card, i) => {
              const Icon = FAQ_HIGHLIGHT_ICONS[i] ?? FAQ_HIGHLIGHT_ICONS[0];
              return (
                <motion.li
                  key={card.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={homeScrollViewport}
                  transition={{ ...appleSpringSoft, delay: i * staggerStep }}
                  className="home-faq__fact"
                >
                  <span className="home-faq__fact-icon" aria-hidden>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="home-faq__fact-title">{card.title}</p>
                    <p className="home-faq__fact-desc">{card.desc}</p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </aside>

        <div className="home-faq__questions">
          <h3 className="home-faq__block-title">
            {page.mostAskedTitle ?? "Most asked questions"}
          </h3>
          <FaqAccordionList
            items={topItems}
            openIndex={openIndex}
            setOpenIndex={setOpenIndex}
            reduceMotion={reduceMotion}
            panelTransition={panelTransition}
            withIcons
          />

          {items.length > HOME_FAQ_LIMIT && (
            <div className="home-faq__footer">
              <Link href="/faq" className="home-faq__view-all tap-target">
                {page.viewAllFaq ?? "See all answers"}
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FaqAccordionList({
  items,
  openIndex,
  setOpenIndex,
  reduceMotion,
  panelTransition,
  withIcons = false,
  withImages = false,
}: {
  items: { q: string; a: string }[];
  openIndex: number | null;
  setOpenIndex: (index: number | null) => void;
  reduceMotion: boolean | null;
  panelTransition: object;
  withIcons?: boolean;
  withImages?: boolean;
}) {
  return (
    <motion.div
      className="home-faq__list space-y-2.5"
      initial="hidden"
      animate="visible"
      variants={reduceMotion ? listVariantsReduced : listVariants}
    >
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const Icon = FAQ_QUESTION_ICONS[index % FAQ_QUESTION_ICONS.length];
        const image = FAQ_IMAGES[index % FAQ_IMAGES.length];

        return (
          <motion.div
            key={item.q}
            variants={reduceMotion ? itemVariantsReduced : itemVariants}
            className="home-faq__item overflow-hidden rounded-xl border border-ds-border/60 bg-ds-surface/80"
          >
            <button
              type="button"
              id={`faq-q-${index}`}
              aria-expanded={isOpen}
              aria-controls={`faq-a-${index}`}
              onClick={() => {
                setOpenIndex(isOpen ? null : index);
                playFeedback("select", "light");
              }}
              className="home-faq__question tap-target"
            >
              {withIcons && (
                <span className="home-faq__q-icon" aria-hidden>
                  <Icon className="size-4" />
                </span>
              )}
              <span className="home-faq__q-text">{item.q}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={reduceMotion ? { duration: 0 } : appleSpringSoft}
                className="shrink-0 text-ds-brand"
                aria-hidden
              >
                <ChevronDown className="size-5" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-a-${index}`}
                  role="region"
                  aria-labelledby={`faq-q-${index}`}
                  initial={
                    reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
                  }
                  animate={
                    reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }
                  }
                  exit={
                    reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
                  }
                  transition={panelTransition}
                  className="overflow-hidden"
                >
                  {withImages ? (
                    <div className="faq-page__answer home-faq__answer">
                      <div className="faq-page__answer-media home-faq__answer-media">
                        <SafeImage
                          src={image}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 120px, 200px"
                          className="object-cover"
                        />
                      </div>
                      <p className="faq-page__answer-text">
                        <FaqAnswerText text={item.a} />
                      </p>
                    </div>
                  ) : (
                    <p className="home-faq__answer-text border-t border-ds-border px-5 py-4 text-sm text-ds-text-secondary">
                      <FaqAnswerText text={item.a} />
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
