"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Ship,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FaqAnswerText } from "@/components/faq/FaqAnswerText";
import {
  FAQ_DEFAULT_SLIDES,
  FAQ_HIGHLIGHT_ICONS,
  FAQ_IMAGES,
} from "@/components/faq/faq-media";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import { playFeedback } from "@/lib/feedback";
import { appleSpringSoft, staggerStep } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/LanguageProvider";

const AUTO_MS = 5200;

type FaqPageCopy = {
  carouselAria?: string;
  highlightsTitle?: string;
  highlights?: { title: string; desc: string; image?: string }[];
  tips?: string[];
  tipsAria?: string;
  allQuestions?: string;
  ctaBook?: string;
  ctaPrices?: string;
  ctaFleet?: string;
  slides?: { src: string; caption: string }[];
};

export function FaqPageExperience() {
  const { t } = useI18n();
  const page = (t.faq as { page?: FaqPageCopy }).page ?? {};
  const items = t.faq.items ?? [];
  const slides = page.slides?.length ? page.slides : [...FAQ_DEFAULT_SLIDES];
  const highlights = page.highlights?.length
    ? page.highlights
    : [
        {
          title: t.faq?.page?.highlights?.[0]?.title ?? "No licence ≤30HP",
          desc: t.conversion?.trust?.licensed ?? "Safety briefing before every departure",
          image: FAQ_IMAGES[1],
        },
        {
          title: t.conversion?.trust?.noFees ?? "All details at our office",
          desc: "Visit us at New Port of Limenaria for full information",
          image: FAQ_IMAGES[3],
        },
        {
          title: t.footer?.marina ?? "New Port of Limenaria",
          desc: t.footer?.hours ?? "South-coast Thassos · Daily 08:00–20:00, May–October",
          image: FAQ_IMAGES[0],
        },
      ];
  const tips = page.tips?.length
    ? page.tips
    : [
        t.package?.eyebrow ?? "Hourly self-drive rental",
        t.conversion?.trust?.noFees ?? "Fuel not included",
        t.home?.trustBar?.deposit ?? "No payment online",
        t.home?.cards?.safety?.title ?? "Briefing every departure",
        t.home?.trustBar?.licence ?? "No licence up to 30HP",
      ];

  const reduceMotion = useReducedMotion();
  const [slide, setSlide] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [paused, setPaused] = useState(false);

  const nextSlide = useCallback(
    (dir: 1 | -1) => {
      setSlide((i) => (i + dir + slides.length) % slides.length);
      playFeedback("select", "light");
    },
    [slides.length],
  );

  useEffect(() => {
    if (reduceMotion || paused || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setSlide((i) => (i + 1) % slides.length);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion, paused, slides.length]);

  const panelTransition = reduceMotion
    ? { duration: 0 }
    : { ...appleSpringSoft, opacity: { duration: 0.25 } };

  return (
    <div className="faq-page">
      <section
        aria-label={page.carouselAria ?? "Thassos boat rental moments"}
        className="faq-page__carousel glass-elevated"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div className="faq-page__carousel-media">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide}
              initial={reduceMotion ? false : { opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0"
            >
              <SafeImage
                src={slides[slide].src}
                alt={slides[slide].caption}
                fill
                sizes="(max-width: 1024px) 100vw, 720px"
                className="object-cover"
                priority={slide === 0}
              />
              <div className="faq-page__carousel-scrim" aria-hidden />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="faq-page__carousel-caption">
          <Sparkles className="size-4 shrink-0 text-ds-brand" aria-hidden />
          <p>{slides[slide].caption}</p>
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              className="faq-page__carousel-nav faq-page__carousel-nav--prev tap-target"
              onClick={() => nextSlide(-1)}
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              className="faq-page__carousel-nav faq-page__carousel-nav--next tap-target"
              onClick={() => nextSlide(1)}
              aria-label="Next slide"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="faq-page__carousel-dots" aria-hidden>
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "faq-page__carousel-dot",
                    i === slide && "faq-page__carousel-dot--active",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="faq-page__highlights" aria-labelledby="faq-highlights-title">
        <h2 id="faq-highlights-title" className="faq-page__section-title">
          {page.highlightsTitle ?? "Good to know at a glance"}
        </h2>
        <div className="faq-page__highlights-track scrollbar-none">
          {highlights.map((card, i) => {
            const Icon = FAQ_HIGHLIGHT_ICONS[i] ?? ShieldCheck;
            return (
              <motion.article
                key={card.title}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ ...appleSpringSoft, delay: i * staggerStep }}
                className="faq-page__highlight glass-card"
              >
                <div className="faq-page__highlight-media">
                  {card.image && (
                    <SafeImage
                      src={card.image}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  )}
                  <span className="faq-page__highlight-icon" aria-hidden>
                    <Icon className="size-4" />
                  </span>
                </div>
                <h3 className="faq-page__highlight-title">{card.title}</h3>
                <p className="faq-page__highlight-desc">{card.desc}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <div
        className="faq-page__tips"
        aria-label={page.tipsAria ?? "Rental quick facts"}
      >
        <div className="faq-page__tips-track">
          {[...tips, ...tips].map((tip, i) => (
            <span key={`${tip}-${i}`} className="faq-page__tip">
              {tip}
            </span>
          ))}
        </div>
      </div>

      <section className="faq-page__questions" aria-labelledby="faq-all-title">
        <h2 id="faq-all-title" className="faq-page__section-title">
          {page.allQuestions ?? "All questions"}
        </h2>
        <div className="faq-page__list space-y-3">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const image = FAQ_IMAGES[index % FAQ_IMAGES.length];

            return (
              <motion.div
                key={item.q}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-32px" }}
                transition={{ ...appleSpringSoft, delay: (index % 4) * 0.04 }}
                className="faq-page__item glass-card overflow-hidden"
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
                  className="faq-page__question tap-target"
                >
                  <span className="faq-page__question-text">{item.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={reduceMotion ? { duration: 0 } : appleSpringSoft}
                    className="shrink-0 text-ds-brand"
                    aria-hidden
                  >
                    <ChevronRight className="size-5 rotate-90" />
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
                      <div className="faq-page__answer">
                        <div className="faq-page__answer-media">
                          <SafeImage
                            src={image}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 100vw, 280px"
                            className="object-cover"
                          />
                        </div>
                        <p className="faq-page__answer-text">
                          <FaqAnswerText text={item.a} />
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      <nav className="faq-page__cta" aria-label="Next steps">
        <Link href="/booking" className="faq-page__cta-card glass-panel">
          <Ship className="size-5 text-ds-brand" aria-hidden />
          <span className="faq-page__cta-label">{page.ctaBook ?? "Send request"}</span>
          <ArrowRight className="size-4 text-ds-text-muted" aria-hidden />
        </Link>
        <Link href="/fleet" className="faq-page__cta-card glass-panel">
          <Ship className="size-5 text-ds-brand" aria-hidden />
          <span className="faq-page__cta-label">{page.ctaFleet ?? "Browse fleet"}</span>
          <ArrowRight className="size-4 text-ds-text-muted" aria-hidden />
        </Link>
      </nav>
    </div>
  );
}
