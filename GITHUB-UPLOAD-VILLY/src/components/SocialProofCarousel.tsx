"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { GuestRatingsScore } from "@/components/reviews/GuestRatingsScore";
import { SafeImage } from "@/components/SafeImage";
import { StarRating } from "@/components/ui/StarRating";
import { playFeedback } from "@/lib/feedback";
import {
  appleEase,
  appleSpringSnappy,
  appleSpringSoft,
  carouselSlide,
  carouselSlideReduced,
  homeScrollViewport,
  staggerStep,
} from "@/lib/motion";
import { safeInitials } from "@/lib/safe";
import {
  getLocalizedPublicTestimonials,
  sortFeaturedTestimonials,
} from "@/lib/testimonials";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/LanguageProvider";
import type { Testimonial } from "@/types";

const AUTO_INTERVAL_MS = 3500;
const HOME_AUTO_INTERVAL_MS_MOBILE = 4500;
const HOME_AUTO_INTERVAL_MS_DESKTOP = 8500;
const MOBILE_LAYOUT_QUERY = "(max-width: 1023px)";
const SWIPE_THRESHOLD = 48;
const STARS_STATIC_HOLD_MS = 300;

function subscribeMobileLayout(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_LAYOUT_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getMobileLayoutSnapshot() {
  return window.matchMedia(MOBILE_LAYOUT_QUERY).matches;
}

function getMobileLayoutServerSnapshot() {
  return true;
}

function anonymizeReviewName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length < 2) return name;

  const [first, ...rest] = parts;
  const firstInitial = first ? `${Array.from(first)[0]}.` : "";
  return [firstInitial, rest.join(" ")].filter(Boolean).join(" ");
}

interface SocialProofCarouselProps {
  testimonials: Testimonial[];
  variant?: "home" | "page";
  hideHeader?: boolean;
  recentBookings?: number;
}

export function SocialProofCarousel({
  testimonials,
  variant = "page",
  hideHeader = false,
  recentBookings = 0,
}: SocialProofCarouselProps) {
  const { t, locale } = useI18n();
  const r = t.reviews;
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: "-8% 0px" });
  const [starsInView, setStarsInView] = useState(false);
  const [starsAnimating, setStarsAnimating] = useState(false);
  const [primedStarsId, setPrimedStarsId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const autoAdvanceRef = useRef(false);
  const dragX = useMotionValue(0);
  const imageParallaxX = useTransform(dragX, [-140, 0, 140], [-8, 0, 8]);

  const isMobileLayout = useSyncExternalStore(
    subscribeMobileLayout,
    getMobileLayoutSnapshot,
    getMobileLayoutServerSnapshot,
  );
  const autoIntervalMs =
    variant === "home"
      ? isMobileLayout
        ? HOME_AUTO_INTERVAL_MS_MOBILE
        : HOME_AUTO_INTERVAL_MS_DESKTOP
      : AUTO_INTERVAL_MS;

  const localizedTestimonials = useMemo(
    () => getLocalizedPublicTestimonials(testimonials, locale),
    [testimonials, locale],
  );
  const localizedReviewCount = localizedTestimonials.length;
  const hasReviews = localizedReviewCount > 0;
  const featured = useMemo(
    () => sortFeaturedTestimonials(localizedTestimonials).slice(0, 6),
    [localizedTestimonials],
  );
  const total = featured.length;
  const current = featured[index] ?? featured[0] ?? null;

  useEffect(() => {
    const timer = window.setTimeout(() => setIndex(0), 0);
    return () => window.clearTimeout(timer);
  }, [locale, localizedReviewCount]);

  useEffect(() => {
    if (!inView || starsInView) return;
    const timer = window.setTimeout(() => setStarsInView(true), 0);
    return () => window.clearTimeout(timer);
  }, [inView, starsInView]);

  useEffect(() => {
    if (!starsInView || reducedMotion) return;
    const timer = setTimeout(() => setStarsAnimating(true), STARS_STATIC_HOLD_MS);
    return () => clearTimeout(timer);
  }, [starsInView, reducedMotion]);

  useEffect(() => {
    if (!starsAnimating || primedStarsId !== null || !current) return;
    const timer = window.setTimeout(() => setPrimedStarsId(current.id), 0);
    return () => window.clearTimeout(timer);
  }, [current, primedStarsId, starsAnimating]);

  const goTo = useCallback((next: number, dir: number, fromAuto = false) => {
    autoAdvanceRef.current = fromAuto;
    setDirection(dir);
    setIndex(next);
  }, []);

  const prev = useCallback(() => {
    goTo(index === 0 ? total - 1 : index - 1, -1);
  }, [goTo, index, total]);

  const next = useCallback(() => {
    goTo(index === total - 1 ? 0 : index + 1, 1);
  }, [goTo, index, total]);

  useEffect(() => {
    if (paused || reducedMotion || total <= 1 || !inView) return;
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((i) => {
        autoAdvanceRef.current = true;
        return i === total - 1 ? 0 : i + 1;
      });
    }, autoIntervalMs);
    return () => clearInterval(timer);
  }, [paused, reducedMotion, total, inView, autoIntervalMs]);

  useEffect(() => {
    if (autoAdvanceRef.current) {
      playFeedback("carousel", "none");
      autoAdvanceRef.current = false;
    }
  }, [index]);

  if (!hasReviews) {
    return (
      <section className={variant === "home" ? "" : "py-24"}>
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-ds-text-muted">{r.comingSoon ?? "Reviews coming soon."}</p>
        </div>
      </section>
    );
  }

  if (!current) return null;

  const variants = reducedMotion ? carouselSlideReduced : carouselSlide;
  const slideVariants = reducedMotion
    ? variants
    : {
        ...variants,
        center: {
          ...variants.center,
          boxShadow:
            "0 10px 32px rgba(15, 45, 75, 0.08), 0 0 36px rgba(255, 200, 80, 0.14), 0 0 0 1px color-mix(in srgb, var(--color-ds-brand) 12%, transparent)",
        },
      };
  const starsPopEntrance =
    starsAnimating && primedStarsId === current.id && !reducedMotion;
  const starsEffectsLive = starsAnimating && !reducedMotion;

  return (
    <section
      ref={sectionRef}
      className={cn(
        "guest-reviews-section relative",
        variant === "home" && "guest-reviews-section--home",
        variant === "page" && "overflow-hidden py-24",
      )}
      style={{ "--carousel-interval": `${autoIntervalMs}ms` } as CSSProperties}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div
        className={cn(
          "guest-reviews-shell layout-safe w-full min-w-0",
          variant === "page" && "mx-auto max-w-7xl",
          variant === "home" && "guest-reviews-shell--home",
          hideHeader ? "" : "box-border",
        )}
      >
        {!hideHeader && (
          <motion.header
            className="guest-reviews-head"
            initial={reducedMotion ? false : { opacity: 0, y: 22 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={variant === "home" ? homeScrollViewport : { once: true, margin: "-40px" }}
            transition={appleSpringSoft}
          >
            {variant === "home" && (
              <div className="guest-reviews-sparkles" aria-hidden>
                <span className="guest-reviews-sparkle guest-reviews-sparkle--1" />
                <span className="guest-reviews-sparkle guest-reviews-sparkle--2" />
                <span className="guest-reviews-sparkle guest-reviews-sparkle--3" />
                <span className="guest-reviews-sparkle guest-reviews-sparkle--4" />
                <span className="guest-reviews-sparkle guest-reviews-sparkle--5" />
              </div>
            )}
            <p className="section-eyebrow mb-2">{r.eyebrow}</p>
            <h2 className="section-title text-balance">{r.title}</h2>
          </motion.header>
        )}

        {variant === "home" ? (
          <motion.div
            className="guest-reviews-shell__score-wrap"
            initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={homeScrollViewport}
            transition={{ ...appleSpringSoft, delay: 0.08 }}
          >
            <GuestRatingsScore
              reviewCount={localizedReviewCount}
              recentBookings={recentBookings}
              className="guest-ratings-score--home"
            />
          </motion.div>
        ) : null}

        <motion.div
          className="guest-reviews-shell__stage-wrap"
          initial={reducedMotion ? false : { opacity: 0, y: 28 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={variant === "home" ? homeScrollViewport : { once: true, amount: 0.08, margin: "0px 0px -8% 0px" }}
          transition={{ ...appleSpringSoft, delay: variant === "home" ? 0.14 + staggerStep : 0.08 }}
        >
          <div className="guest-review-stage">
          {!reducedMotion && total > 1 && (
            <motion.div
              key={`stage-glow-${index}`}
              className="guest-review-stage__glow"
              initial={{ opacity: 0.5, scale: 0.94 }}
              animate={{ opacity: 0, scale: 1.06 }}
              transition={{ duration: 0.85, ease: appleEase }}
              aria-hidden
            />
          )}

          <AnimatePresence mode="wait" custom={direction}>
            <motion.article
              key={current.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={
                reducedMotion
                  ? { duration: 0.16 }
                  : { type: "spring", stiffness: 520, damping: 30, mass: 0.72 }
              }
              drag={total > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDrag={(_, info) => {
                if (!reducedMotion) dragX.set(info.offset.x);
              }}
              onDragEnd={(_, info) => {
                dragX.set(0);
                if (info.offset.x < -SWIPE_THRESHOLD) next();
                else if (info.offset.x > SWIPE_THRESHOLD) prev();
              }}
              className="guest-review-card touch-pan-y"
              data-variant={variant}
            >
              {current.image && (
                <div className="guest-review-card__media">
                  <motion.div
                    className="absolute inset-0"
                    style={reducedMotion ? undefined : { x: imageParallaxX }}
                  >
                    <SafeImage
                      src={current.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 480px"
                      className="object-cover"
                      priority={variant === "home" && index === 0}
                    />
                  </motion.div>
                  {current.trip && (
                    <span className="guest-review-card__trip">{current.trip}</span>
                  )}
                </div>
              )}

              <div className="guest-review-card__body">
                <div className="guest-review-card__stars">
                  {starsInView ? (
                    <StarRating
                      value={5}
                      size="2xl"
                      animated={starsPopEntrance}
                      popEntrance={starsPopEntrance}
                      glow={starsEffectsLive}
                      shimmer={starsEffectsLive}
                      delay={starsPopEntrance ? 0.12 : 0}
                      animationKey={current.id}
                      label=""
                      className={cn(
                        "star-rating-carousel guest-review-card__star-rating",
                        starsEffectsLive && "star-rating-carousel--live",
                      )}
                    />
                  ) : null}
                </div>

                <motion.blockquote
                  key={`quote-${current.id}`}
                  initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.42, ease: appleEase }}
                  className="guest-review-card__quote"
                >
                  &ldquo;{current.text}&rdquo;
                </motion.blockquote>

                <motion.footer
                  key={`author-${current.id}`}
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22, duration: 0.38, ease: appleEase }}
                  className="guest-review-card__author"
                >
                  <div
                    className="guest-review-card__avatar"
                    aria-hidden
                  >
                    {safeInitials(current.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ds-text">
                      {anonymizeReviewName(current.name)}
                    </p>
                    <p className="truncate text-xs text-ds-text-muted">
                      {current.location}
                      {current.date ? ` · ${current.date}` : ""}
                    </p>
                  </div>
                </motion.footer>
              </div>
            </motion.article>
          </AnimatePresence>

          {total > 1 && (
            <div className="guest-review-controls mt-4 flex w-full max-w-full flex-col items-center gap-3 overflow-x-clip px-1 sm:mt-6">
              <div className="flex max-w-full items-center justify-center gap-2 sm:gap-3">
                <motion.button
                  type="button"
                  onClick={prev}
                  whileHover={reducedMotion ? undefined : { scale: 1.07 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.94 }}
                  transition={appleSpringSnappy}
                  className="tap-target flex size-11 items-center justify-center rounded-full border border-ds-border bg-ds-surface/80 text-ds-text-secondary backdrop-blur-md transition-colors hover:border-ds-brand/40 hover:text-ds-text"
                  aria-label={r.prevReview ?? "Previous review"}
                >
                  <ChevronLeft className="size-5" />
                </motion.button>

                <div className="flex gap-2" role="group" aria-label={r.reviewSlides ?? "Review slides"}>
                  {featured.map((item, i) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={i === index ? "true" : undefined}
                      aria-label={(r.reviewOf ?? "Review {current} of {total}")
                        .replace("{current}", String(i + 1))
                        .replace("{total}", String(total))}
                      onClick={() => {
                        goTo(i, i > index ? 1 : -1);
                        playFeedback("select", "light");
                      }}
                      className="relative flex h-11 w-11 items-center justify-center border-0 bg-transparent p-0"
                    >
                      <motion.span
                        layout
                        animate={{
                          width: i === index ? 22 : 10,
                          scale: i === index ? 1.1 : 1,
                        }}
                        transition={reducedMotion ? { duration: 0 } : appleSpringSnappy}
                        className={cn(
                          "block h-2.5 rounded-full",
                          i === index
                            ? "bg-ds-brand shadow-[0_0_12px_rgba(102,204,51,0.45)]"
                            : "bg-ds-text-subtle/40 hover:bg-ds-text-muted",
                        )}
                      />
                    </button>
                  ))}
                </div>

                <motion.button
                  type="button"
                  onClick={next}
                  whileHover={reducedMotion ? undefined : { scale: 1.07 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.94 }}
                  transition={appleSpringSnappy}
                  className="tap-target flex size-11 items-center justify-center rounded-full border border-ds-border bg-ds-surface/80 text-ds-text-secondary backdrop-blur-md transition-colors hover:border-ds-brand/40 hover:text-ds-text"
                  aria-label={r.nextReview ?? "Next review"}
                >
                  <ChevronRight className="size-5" />
                </motion.button>
              </div>

              {!reducedMotion && (
                <div
                  className="h-0.5 w-28 overflow-hidden rounded-full bg-ds-border/35"
                  aria-hidden
                >
                  <div
                    key={index}
                    className={cn(
                      "carousel-progress-fill h-full w-full rounded-full bg-ds-brand/55",
                      paused && "is-paused",
                    )}
                  />
                </div>
              )}
            </div>
          )}
          </div>
        </motion.div>

        {variant === "home" && (
          <div className="guest-reviews-foot">
            <Link href="/reviews" className="guest-reviews-foot__link tap-target">
              {r.allReviews}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
