"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight, ChevronDown, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useMobileViewport } from "@/hooks/useMobileViewport";
import { appleSpringSoft, premiumHeroSpring, staggerStep } from "@/lib/motion";
import { isLongLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { HeroBookingMini } from "@/components/hero/HeroBookingMini";
import { HeroOrbs } from "@/components/hero/HeroOrbs";
import { MARINA_LOCATION } from "@/lib/site";
import { mediaUrl, shouldLoadHeroBackgroundVideo } from "@/lib/bandwidth";
import { useI18n } from "@/providers/LanguageProvider";

const MARINA_PILL_INDEX = 2;

/** Hero reel — compressed (~4 MB); disable with NEXT_PUBLIC_HERO_VIDEO=false */
const HERO_VIDEO_MP4 = mediaUrl("/videos/rent-a-boat-villy.mp4");
const HERO_POSTER = mediaUrl("/videos/posters/rent-a-boat-villy.jpg");

const POSTER_READY_FALLBACK_MS = 1200;

const heroIntroContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: staggerStep, delayChildren: 0.16 },
  },
};

const heroIntroContainerTouch = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.055, delayChildren: 0.1 },
  },
};

const heroIntroChild = {
  hidden: { opacity: 0, y: 28, clipPath: "inset(100% 0 0 0)" },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0% 0 0 0)",
    transition: premiumHeroSpring,
  },
};

const heroIntroChildLight = {
  hidden: { opacity: 0, y: 20, clipPath: "inset(100% 0 0 0)" },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0% 0 0 0)",
    transition: premiumHeroSpring,
  },
};

const heroPillsContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

const heroPillItem = {
  hidden: { opacity: 0, y: 10, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: appleSpringSoft,
  },
};

interface HeroProps {
  onContentReady?: () => void;
}

type HeroScrollStyles = {
  mediaY: MotionValue<string>;
  copyOpacity: MotionValue<number>;
  copyY: MotionValue<number>;
  bookingOpacity: MotionValue<number>;
  bookingY: MotionValue<number>;
  scrollHintOpacity: MotionValue<number>;
};

function HeroScrollProvider({
  sectionRef,
  children,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  children: (styles: HeroScrollStyles) => ReactNode;
}) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.32, 0.74], [1, 1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 0.32, 0.74], [0, 0, -30]);
  const bookingOpacity = useTransform(scrollYProgress, [0, 0.36, 0.78], [1, 1, 0]);
  const bookingY = useTransform(scrollYProgress, [0, 0.36, 0.78], [0, 0, -22]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.22, 0.48], [1, 1, 0]);

  return children({
    mediaY,
    copyOpacity,
    copyY,
    bookingOpacity,
    bookingY,
    scrollHintOpacity,
  });
}

export function Hero({
  onContentReady,
}: HeroProps = {}) {
  const { t, locale } = useI18n();
  const isLongLang = isLongLanguage(locale);
  const fleetLinkLabel = locale === "el" ? "Δες τον στόλο" : "View fleet";
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [posterReady, setPosterReady] = useState(true);
  const reduceMotion = useReducedMotion();
  const coarsePointer = useCoarsePointer();
  const mobileViewport = useMobileViewport();
  const enableScrollMotion = mounted && !reduceMotion && !coarsePointer && !mobileViewport;
  const isMobileHero = coarsePointer || mobileViewport;
  const heroPoster = HERO_POSTER;
  const heroVideoMp4 = HERO_VIDEO_MP4;

  const [videoReady, setVideoReady] = useState(false);
  const heroCopy = t.hero as typeof t.hero & {
    hook?: string;
    hookLine?: string;
    pillSelfDrive?: string;
    pillHourly?: string;
    pillMarina?: string;
    marinaMapsLabel?: string;
    marinaMapsAria?: string;
    locationStrip?: string;
    locationStripMobile?: string;
    pillsAriaLabel?: string;
  };
  const heroHook = heroCopy.hook ?? "Rent a boat in Thassos";
  const heroHookLine = heroCopy.hookLine ?? t.hero.subtitle;
  const heroPills = [
    heroCopy.pillSelfDrive ?? "Self-drive",
    heroCopy.pillHourly ?? "Hourly rental",
    heroCopy.pillMarina ?? MARINA_LOCATION.shortName,
  ];
  const marinaMapsLabel = heroCopy.marinaMapsLabel ?? "Get directions";
  const marinaMapsAria =
    heroCopy.marinaMapsAria ?? `Open ${MARINA_LOCATION.shortName} on Google Maps`;
  const locationStrip =
    heroCopy.locationStrip ?? `${MARINA_LOCATION.shortName}, Thassos`;
  const locationStripMobile =
    heroCopy.locationStripMobile ??
    locationStrip.split(/\s[—–-]\s/)[0]?.trim() ??
    locationStrip;
  const brandTitle = t.seo.siteName;
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [saveData, setSaveData] = useState(false);

  const loadHeroVideo = shouldLoadHeroBackgroundVideo({
    reduceMotion,
    saveData,
  });

  useEffect(() => {
    setMounted(true);
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean };
      }
    ).connection;
    setSaveData(Boolean(connection?.saveData));
  }, []);

  useEffect(() => {
    const fallbackMs = window.matchMedia("(pointer: coarse)").matches
      ? 400
      : POSTER_READY_FALLBACK_MS;
    const fallback = window.setTimeout(() => setPosterReady(true), fallbackMs);
    return () => window.clearTimeout(fallback);
  }, []);

  /* Hero is above the fold — mount video as soon as the section ref exists. */
  useEffect(() => {
    if (reduceMotion || !mounted || !loadHeroVideo) return;

    const enableVideo = () => setVideoReady(true);
    if (sectionRef.current) {
      enableVideo();
      return;
    }

    const retry = window.setTimeout(() => {
      if (sectionRef.current) enableVideo();
    }, 0);
    return () => window.clearTimeout(retry);
  }, [reduceMotion, mounted, loadHeroVideo]);

  const tryPlayVideo = (v: HTMLVideoElement) => {
    if (videoFailed || reduceMotion) return;
    v.muted = true;
    if (!v.paused) {
      confirmVideoFrame(v);
      return;
    }
    void v.play()
      .then(() => {
        markVideoActive();
        confirmVideoFrame(v);
      })
      .catch((err: DOMException) => {
        if (err.name === "NotAllowedError") {
          setAutoplayBlocked(true);
          return;
        }
        /* Overlapping play() calls reject with AbortError — not a load failure */
        if (err.name === "AbortError") return;
        setVideoFailed(true);
        setVideoPlaying(false);
        markPosterReady();
      });
  };

  useEffect(() => {
    if (!mounted || reduceMotion || !videoReady || videoFailed || !loadHeroVideo) return;

    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    let video: HTMLVideoElement | null = null;
    let onCanPlay: (() => void) | undefined;

    const bindVideo = () => {
      if (cancelled) return;
      video = videoRef.current;
      if (!video) {
        requestAnimationFrame(bindVideo);
        return;
      }

      onCanPlay = () => tryPlayVideo(video!);
      video.addEventListener("canplay", onCanPlay);
      if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) onCanPlay();
      else tryPlayVideo(video);

      const el = sectionRef.current;
      if (el) {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry?.isIntersecting) tryPlayVideo(video!);
          },
          { threshold: 0.05, rootMargin: "50px 0px" },
        );
        observer.observe(el);
      }
    };

    bindVideo();
    return () => {
      cancelled = true;
      if (video && onCanPlay) video.removeEventListener("canplay", onCanPlay);
      observer?.disconnect();
    };
  }, [mounted, reduceMotion, videoReady, videoFailed, loadHeroVideo]);

  const handleTapToPlay = () => {
    const v = videoRef.current;
    if (!v) return;
    setAutoplayBlocked(false);
    v.muted = true;
    void v.play()
      .then(() => {
        markVideoActive();
        confirmVideoFrame(v);
      })
      .catch(() => setAutoplayBlocked(true));
  };

  const markPosterReady = () => setPosterReady(true);

  const markVideoActive = () => {
    setVideoPlaying(true);
    setAutoplayBlocked(false);
  };

  const handleVideoError = () => {
    setVideoFailed(true);
    setVideoPlaying(false);
    markPosterReady();
  };

  const confirmVideoFrame = (v: HTMLVideoElement) => {
    if (videoFailed) return;
    if (!v.paused) {
      markVideoActive();
      return;
    }
    if (v.currentTime > 0.04) markVideoActive();
  };

  const handleVideoPlaying = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    if (videoFailed) return;
    markVideoActive();
    const v = event.currentTarget;

    if (typeof v.requestVideoFrameCallback === "function") {
      v.requestVideoFrameCallback(() => markVideoActive());
    }
  };

  /* Safety net: hide poster once frames are advancing even if playing event misfires */
  useEffect(() => {
    if (!videoReady || videoPlaying || videoFailed || reduceMotion) return;
    const v = videoRef.current;
    if (!v) return;

    const tick = window.setInterval(() => {
      if (v.currentTime > 0.05 && !v.paused) confirmVideoFrame(v);
    }, 250);
    const timeout = window.setTimeout(() => window.clearInterval(tick), 8000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(timeout);
    };
  }, [videoReady, videoPlaying, videoFailed, reduceMotion]);

  const handleVideoPause = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    if (videoFailed) return;
    const v = event.currentTarget;
    /* Ignore brief buffering pauses — only hide video when truly stopped */
    if (v.ended || (v.paused && v.currentTime < 0.05)) {
      setVideoPlaying(false);
    }
  };

  const showPoster = !videoReady || videoFailed;

  useEffect(() => {
    if (posterReady) onContentReady?.();
  }, [posterReady, onContentReady]);

  const renderHeroInterior = (scroll?: HeroScrollStyles) => (
    <>
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="hero-parallax-target absolute inset-0"
          style={{
            ...(scroll ? { y: scroll.mediaY } : {}),
            backgroundImage: `url(${heroPoster})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Image
            src={heroPoster}
            alt="Rent a boat in Thassos, Aegean sea view from New Port of Limenaria boat departure"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            onLoad={markPosterReady}
            onError={markPosterReady}
            className={cn(
              "hero-poster-image object-cover transition-opacity duration-700 ease-out",
              isMobileHero ? "object-center" : "object-center",
              showPoster ? "z-[2] opacity-100" : "z-0 opacity-0",
            )}
          />
          {mounted && loadHeroVideo && (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={heroPoster}
              src={heroVideoMp4}
              data-hero-video
              onLoadedData={markPosterReady}
              onPlay={(event) => confirmVideoFrame(event.currentTarget)}
              onCanPlay={(event) => {
                markPosterReady();
                tryPlayVideo(event.currentTarget);
              }}
              onPlaying={handleVideoPlaying}
              onTimeUpdate={(event) => {
                if (videoPlaying || videoFailed) return;
                const v = event.currentTarget;
                if (v.currentTime > 0.04 && !v.paused) confirmVideoFrame(v);
              }}
              onPause={handleVideoPause}
              onError={handleVideoError}
              data-playing={videoReady && !videoFailed ? "" : undefined}
              className={cn(
                "hero-bg-video absolute inset-0 z-[1] h-full w-full object-cover object-center transition-opacity duration-700 ease-out",
                videoReady && !videoFailed ? "opacity-100" : "opacity-0",
              )}
            />
          )}
          {autoplayBlocked && !videoFailed && (
            <button
              type="button"
              onClick={handleTapToPlay}
              className="absolute inset-0 z-[5] cursor-pointer border-0 bg-transparent p-0"
              aria-label="Play background video"
            />
          )}
        </motion.div>
      </div>

      {/* Light bottom vignette only — video stays visible */}
      <div
        aria-hidden
        className="hero-video-vignette pointer-events-none absolute inset-0 z-[3]"
      />

      {posterReady && !reduceMotion && !isMobileHero && <HeroOrbs />}

      {posterReady && !reduceMotion && (
        <div aria-hidden className="hero-video-shine pointer-events-none absolute inset-0 z-[4]" />
      )}

      <div className="hero-video-grid relative z-10 min-h-[calc(100dvh-4.5rem)] lg:min-h-0">
        <div className="hero-landscape-body hero-landscape-body--outlier mx-auto flex w-full max-w-7xl min-w-0 flex-col justify-end gap-3 px-[max(1.125rem,env(safe-area-inset-left,0px))] pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(4.5rem,calc(4rem+env(safe-area-inset-bottom,0px)))] pr-[max(1.125rem,env(safe-area-inset-right,0px))] sm:gap-4 sm:px-6 sm:pb-28 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-8 lg:pb-4 lg:pt-4 xl:gap-8">
            <motion.div
              className="hero-landscape-copy hero-landscape-copy--mobile hero-landscape-copy--outlier hero-scroll-layer w-full min-w-0 shrink lg:text-left"
              style={
                scroll
                  ? { opacity: scroll.copyOpacity, y: scroll.copyY }
                  : undefined
              }
            >
              {reduceMotion ? (
                <HeroCopyStatic
                  eyebrow={t.hero.eyebrow}
                  hook={heroHook}
                  brand={brandTitle}
                  hookLine={heroHookLine}
                  pills={heroPills}
                  pillsAriaLabel={heroCopy.pillsAriaLabel ?? "Rental highlights"}
                  locationStrip={locationStrip}
                  locationStripMobile={locationStripMobile}
                  marinaMapsLabel={marinaMapsLabel}
                  marinaMapsAria={marinaMapsAria}
                  isLongLang={isLongLang}
                  fleetLinkLabel={fleetLinkLabel}
                />
              ) : (
                <motion.div
                  className="hero-copy-stack"
                  initial={coarsePointer ? false : "hidden"}
                  animate="visible"
                  variants={coarsePointer ? heroIntroContainerTouch : heroIntroContainer}
                >
                  <motion.p
                    variants={coarsePointer ? heroIntroChildLight : heroIntroChild}
                    className="hero-eyebrow-on-video ui-eyebrow"
                  >
                    {t.hero.eyebrow}
                  </motion.p>
                  <motion.h1
                    variants={heroIntroChild}
                    className={cn(
                      "hero-hook hero-display hero-on-video text-pretty font-semibold",
                      isLongLang ? "max-w-xl" : "max-w-2xl",
                    )}
                  >
                    {heroHook}
                  </motion.h1>
                  <motion.p
                    variants={heroIntroChildLight}
                    className="hero-on-video-sub max-w-md text-pretty text-sm leading-snug sm:text-base"
                  >
                    {heroHookLine}
                  </motion.p>
                  <motion.div variants={heroIntroChildLight} className="hidden lg:block">
                    <HeroLocationStrip
                      placement="copy"
                      locationStrip={locationStrip}
                      locationStripMobile={locationStripMobile}
                      mapsLabel={marinaMapsLabel}
                      mapsAria={marinaMapsAria}
                    />
                  </motion.div>
                  <motion.div
                    variants={heroPillsContainer}
                    className="hero-hook-pills hero-hook-pills--desktop"
                    role="list"
                    aria-label={heroCopy.pillsAriaLabel ?? "Rental highlights"}
                  >
                    {heroPills.map((pill, index) => (
                      <HeroPill
                        key={pill}
                        label={pill}
                        isMarina={index === MARINA_PILL_INDEX}
                        mapsAria={marinaMapsAria}
                        motionVariants={heroPillItem}
                      />
                    ))}
                  </motion.div>
                  <motion.div variants={heroIntroChildLight} className="hero-desktop-fleet-link-wrap">
                    <Link href="/fleet" className="hero-desktop-fleet-link">
                      <span>{fleetLinkLabel}</span>
                      <ArrowUpRight className="size-4" aria-hidden />
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>

            <HeroMobileBooking t={t} reduceMotion={reduceMotion} />

            {reduceMotion ? (
              <div className="hero-landscape-booking hidden w-full shrink-0 lg:block lg:w-auto lg:max-w-md xl:max-w-lg">
                <HeroBookingCard t={t} />
              </div>
            ) : (
              <motion.div
                className="hero-landscape-booking hero-scroll-layer hidden w-full shrink-0 lg:block lg:w-auto lg:max-w-md xl:max-w-lg"
                style={
                  scroll
                    ? { opacity: scroll.bookingOpacity, y: scroll.bookingY }
                    : undefined
                }
              >
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ ...appleSpringSoft, delay: 0.48 }}
                >
                  <HeroBookingCard t={t} />
                </motion.div>
              </motion.div>
            )}
          </div>
      </div>

      {posterReady && (
        <motion.div
          className="hero-scroll-hint-wrap absolute bottom-5 left-1/2 z-20 w-fit max-w-[calc(100%-2rem)] -translate-x-1/2 sm:bottom-7"
          style={
            scroll
              ? { opacity: scroll.scrollHintOpacity }
              : undefined
          }
        >
          <motion.a
            href="#home-start"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ ...appleSpringSoft, delay: 0.72 }}
            className="hero-scroll-hint tap-target inline-flex items-center gap-2 rounded-full px-4 py-2.5"
            aria-label={t.hero.scroll}
          >
            <span className="hero-scroll-hint-label text-xs font-semibold tracking-wide sm:text-[13px]">
              {t.hero.scroll}
            </span>
            <ChevronDown className="hero-scroll-hint-chevron size-4 shrink-0" aria-hidden />
          </motion.a>
        </motion.div>
      )}
    </>
  );

  return (
    <section
      ref={sectionRef}
      data-home-hero
      className="panel-fit landscape-compact-hero relative isolate min-h-[calc(100svh-4.5rem)] w-full overflow-x-clip bg-transparent max-lg:min-h-[calc(100dvh-4.5rem)] lg:min-h-[min(calc(100dvh-4rem),720px)]"
    >
      {enableScrollMotion ? (
        <HeroScrollProvider sectionRef={sectionRef}>
          {renderHeroInterior}
        </HeroScrollProvider>
      ) : (
        renderHeroInterior()
      )}
    </section>
  );
}

function HeroCopyStatic({
  eyebrow,
  hook,
  brand,
  hookLine,
  pills,
  pillsAriaLabel,
  locationStrip,
  locationStripMobile,
  marinaMapsLabel,
  marinaMapsAria,
  isLongLang,
  fleetLinkLabel,
}: {
  eyebrow: string;
  hook: string;
  brand: string;
  hookLine?: string;
  pills: string[];
  pillsAriaLabel: string;
  locationStrip: string;
  locationStripMobile: string;
  marinaMapsLabel: string;
  marinaMapsAria: string;
  isLongLang: boolean;
  fleetLinkLabel: string;
}) {
  return (
    <div className="hero-copy-stack hero-landscape-copy--mobile">
      <p className="hero-eyebrow-on-video ui-eyebrow">{eyebrow}</p>
      <h1
        className={cn(
          "hero-hook hero-display hero-on-video text-pretty font-semibold",
          isLongLang ? "max-w-xl" : "max-w-2xl",
        )}
      >
        {hook}
      </h1>
      {hookLine && (
        <p className="hero-on-video-sub max-w-md text-pretty text-sm leading-snug sm:text-base">
          {hookLine}
        </p>
      )}
      <div className="hidden lg:block">
        <HeroLocationStrip
          placement="copy"
          locationStrip={locationStrip}
          locationStripMobile={locationStripMobile}
          mapsLabel={marinaMapsLabel}
          mapsAria={marinaMapsAria}
        />
      </div>
      <div className="hero-hook-pills hero-hook-pills--desktop" role="list" aria-label={pillsAriaLabel}>
        {pills.map((pill, index) => (
          <HeroPill
            key={pill}
            label={pill}
            isMarina={index === MARINA_PILL_INDEX}
            mapsAria={marinaMapsAria}
          />
        ))}
      </div>
      <div className="hero-desktop-fleet-link-wrap">
        <Link href="/fleet" className="hero-desktop-fleet-link">
          <span>{fleetLinkLabel}</span>
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function HeroLocationStrip({
  locationStrip,
  locationStripMobile,
  mapsLabel,
  mapsAria,
  placement = "copy",
}: {
  locationStrip: string;
  locationStripMobile: string;
  mapsLabel: string;
  mapsAria: string;
  placement?: "copy" | "banner";
}) {
  return (
    <div
      className={cn(
        "hero-location-strip",
        placement === "banner" && "hero-location-strip--banner",
      )}
    >
      <a
        href={MARINA_LOCATION.googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hero-location-strip__link tap-target"
        aria-label={mapsAria}
      >
        <span className="hero-location-strip__main">
          <MapPin className="hero-location-strip__icon size-4 shrink-0" aria-hidden />
          <span className="hero-location-strip__text hero-location-strip__text--desktop">
            {locationStrip}
          </span>
          <span className="hero-location-strip__text hero-location-strip__text--mobile">
            {locationStripMobile}
          </span>
        </span>
        <span className="hero-location-strip__cta">{mapsLabel}</span>
      </a>
    </div>
  );
}

function HeroPill({
  label,
  isMarina,
  mapsAria,
  motionVariants,
}: {
  label: string;
  isMarina: boolean;
  mapsAria: string;
  motionVariants?: typeof heroPillItem;
}) {
  const className = cn(
    "hero-hook-pill",
    motionVariants && "hero-hook-pill--motion",
    isMarina && "hero-hook-pill--marina",
  );

  if (isMarina) {
    const content = (
      <>
        <MapPin className="size-3 shrink-0 opacity-80" aria-hidden />
        <span>{label}</span>
      </>
    );

    if (motionVariants) {
      return (
        <motion.a
          href={MARINA_LOCATION.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          role="listitem"
          variants={motionVariants}
          className={className}
          aria-label={mapsAria}
        >
          {content}
        </motion.a>
      );
    }

    return (
      <a
        href={MARINA_LOCATION.googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        role="listitem"
        className={className}
        aria-label={mapsAria}
      >
        {content}
      </a>
    );
  }

  if (motionVariants) {
    return (
      <motion.span role="listitem" variants={motionVariants} className={className}>
        {label}
      </motion.span>
    );
  }

  return (
    <span role="listitem" className={className}>
      {label}
    </span>
  );
}

function HeroMobileBooking({
  t,
  reduceMotion,
}: {
  t: ReturnType<typeof useI18n>["t"];
  reduceMotion: boolean | null;
}) {
  const content = <HeroBookingCard t={t} variant="mobile" />;

  if (reduceMotion) {
    return <div className="hero-mobile-booking lg:hidden">{content}</div>;
  }

  return (
    <motion.div
      className="hero-mobile-booking lg:hidden"
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...appleSpringSoft, delay: 0.14 }}
    >
      {content}
    </motion.div>
  );
}

function HeroBookingCard({
  variant = "desktop",
}: {
  t: ReturnType<typeof useI18n>["t"];
  variant?: "desktop" | "mobile";
}) {
  const isMobile = variant === "mobile";
  return (
    <div
      className={cn(
        "hero-booking-glass hero-booking-glass--dock hero-booking-glass--refined hero-booking-stack layout-safe w-full min-w-0 max-w-full overflow-hidden",
        isMobile && "hero-booking-glass--mobile-strip",
      )}
    >
      <HeroBookingMini variant={isMobile ? "mobile" : "default"} />
    </div>
  );
}
