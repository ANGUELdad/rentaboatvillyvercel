"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Minus,
  Plus,
  Ship,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type CSSProperties,
  type ReactNode,
} from "react";
import { BookingTrustBadges } from "@/components/conversion/BookingTrustBadges";
import { SafeImage } from "@/components/SafeImage";
import { CountUp } from "@/components/ui/CountUp";
import { playFeedback } from "@/lib/feedback";
import {
  appleSpringSnappy,
  appleSpringSoft,
  countUpDurationFast,
  hoverLift,
  tapScale,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Z } from "@/lib/z-index";
import { useI18n } from "@/providers/LanguageProvider";
import type { PublicBoat } from "@/types";

const MIN_HOURS = 4;
const MAX_HOURS = 8;
const STEPS = [1, 2] as const;
type Step = (typeof STEPS)[number];

function preventTapFocusScroll(e: ReactPointerEvent<HTMLButtonElement>) {
  e.preventDefault();
}

function scrollToStep(el: HTMLElement | null, reducedMotion: boolean | null) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 88;
  window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? "auto" : "smooth" });
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const RATES_CONTACT =
  "Contact us for rates — call +30 698 131 8393 or visit our office at New Port of Limenaria.";

interface PackageBuilderProps {
  boats: PublicBoat[];
  className?: string;
}

export function PackageBuilder({ boats, className }: PackageBuilderProps) {
  const { t } = useI18n();
  const pb = { ...t.packageBuilder, ...t.package };
  const pkg = t.conversion?.package;
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();

  const stepLabels = [
    pb.stepConfigure ?? pb.mobileSummary ?? "Your rental",
    pb.stepSummary ?? "Review",
  ];
  const stepHints = [
    pb.stepConfigureHint ??
      `${pb.stepVessel ?? "Boat"} · ${pb.stepDurationGuests ?? "Hours & guests"}`,
    pb.stepSummaryHint ?? pb.storyReview ?? "Check your estimate",
  ];

  const [step, setStep] = useState<Step>(1);
  const [boatId, setBoatId] = useState(boats[0]?.id ?? "");
  const [hours, setHours] = useState(MIN_HOURS);
  const [guests, setGuests] = useState(2);
  const [preferredDate, setPreferredDate] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const qBoat = searchParams.get("boat");
    const qHours = searchParams.get("hours");
    const qGuests = searchParams.get("guests");
    const qDate = searchParams.get("date");

    if (qBoat && boats.some((b) => b.id === qBoat)) setBoatId(qBoat);
    const h = Number(qHours);
    if (h >= MIN_HOURS && h <= MAX_HOURS && Number.isInteger(h)) setHours(h);
    const g = Number(qGuests);
    if (g >= 1 && g <= 20) setGuests(g);
    if (qDate) setPreferredDate(qDate);
    if (qBoat && qHours) setStep(2);
  }, [searchParams, boats]);

  const boat = useMemo(() => boats.find((b) => b.id === boatId), [boats, boatId]);
  const maxGuests = boat?.pax ?? 10;
  const guestLabel =
    guests === 1 ? (pb.guestSingular ?? "guest") : (pb.guestPlural ?? "guests");

  const bookHref = useMemo(() => {
    const qs = new URLSearchParams();
    if (boatId) qs.set("boat", boatId);
    qs.set("hours", String(hours));
    qs.set("guests", String(guests));
    if (preferredDate) qs.set("date", preferredDate);
    return `/booking?${qs}`;
  }, [boatId, hours, guests, preferredDate]);

  const canAdvance = step === 1 ? !!boatId : true;

  const goStep = useCallback(
    (n: Step) => {
      setStep(n);
      setHint(null);
      requestAnimationFrame(() => scrollToStep(stepRef.current, reducedMotion));
    },
    [reducedMotion],
  );

  const next = useCallback(() => {
    if (!canAdvance) {
      setHint(pb.validationVessel ?? "Select a boat");
      playFeedback("dismiss", "light");
      return;
    }
    if (step < 2) {
      goStep(2);
      playFeedback("select", "medium");
    }
  }, [canAdvance, step, pb.validationVessel, goStep]);

  const back = useCallback(() => {
    if (step > 1) {
      goStep((step - 1) as Step);
      playFeedback("dismiss", "light");
    }
  }, [step, goStep]);

  if (!boats.length) return null;

  const included = pkg?.included ?? [
    "Fuel for Thassos cruising",
    "Safety gear & briefing",
  ];
  const excluded = pkg?.excluded ?? ["Food & drinks", "Optional skipper"];

  return (
    <div className={cn("rental-studio rental-studio--2026", className)}>
      <nav
        aria-label={pb.stepsAria ?? "Rental estimate progress"}
        className="rental-studio__progress glass-panel glass-2026-panel ui-2026-surface"
      >
        <div
          className="rental-studio__progress-track"
          aria-hidden
          style={{ "--step-progress": `${(step / STEPS.length) * 100}%` } as CSSProperties}
        />
        <p className="rental-studio__progress-kicker">
          {(pb.stepProgress ?? "Step {current} of {total}")
            .replace("{current}", String(step))
            .replace("{total}", String(STEPS.length))}
        </p>
        <ol className="booking-steps__list booking-steps__list--two">
          {STEPS.map((n, i) => {
            const active = step === n;
            const done = step > n;
            return (
              <li
                key={n}
                className={cn("booking-steps__item", active && "booking-steps__item--active")}
                aria-current={active ? "step" : undefined}
              >
                <button
                  type="button"
                  disabled={!done && !active}
                  onPointerDown={preventTapFocusScroll}
                  onClick={() => (done || active) && goStep(n)}
                  className="rental-studio__progress-btn tap-target"
                  aria-label={stepLabels[i]}
                >
                  <span
                    className={cn(
                      "booking-steps__dot",
                      done && "booking-steps__dot--done",
                      active && "booking-steps__dot--active",
                    )}
                    aria-hidden
                  >
                    {done ? <Check className="size-3.5" /> : n}
                  </span>
                  <span className="booking-steps__label">{stepLabels[i]}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="rental-studio__progress-hint">{stepHints[step - 1]}</p>
      </nav>

      <div className="rental-studio__layout">
        <aside className="rental-studio__aside hidden lg:order-2 lg:block">
          <RentalSummaryAside
            boat={boat}
            hours={hours}
            guests={guests}
            guestLabel={guestLabel}
            preferredDate={preferredDate}
            step={step}
            bookHref={bookHref}
            pb={pb}
          />
        </aside>

        <div
          ref={stepRef}
          className="rental-studio__form scroll-mt-24 lg:order-1"
        >
          {hint && (
            <p className="mb-4 text-center text-xs text-ds-action" role="status">
              {hint}
            </p>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={appleSpringSnappy}
              className="rental-studio__panel glass-panel glass-2026-panel ui-2026-surface"
            >
              {step === 1 && (
                <ConfigureStep
                  boats={boats}
                  boatId={boatId}
                  hours={hours}
                  guests={guests}
                  maxGuests={maxGuests}
                  preferredDate={preferredDate}
                  pb={pb}
                  onSelectBoat={(id, pax) => {
                    setBoatId(id);
                    if (guests > pax) setGuests(pax);
                    setHint(null);
                    playFeedback("select", "light");
                  }}
                  onHours={setHours}
                  onGuests={setGuests}
                  onDate={setPreferredDate}
                />
              )}
              {step === 2 && (
                <SummaryPanel
                  boat={boat}
                  hours={hours}
                  guests={guests}
                  guestLabel={guestLabel}
                  preferredDate={preferredDate}
                  included={included}
                  excluded={excluded}
                  pb={pb}
                  pkg={pkg}
                />
              )}

              <div className="rental-studio__desktop-nav hidden lg:flex">
                {step > 1 ? (
                  <button
                    type="button"
                    onPointerDown={preventTapFocusScroll}
                    onClick={back}
                    className="tap-target inline-flex items-center gap-1 rounded-xl border border-ds-border px-4 py-2.5 text-sm text-ds-text-secondary hover:text-ds-text"
                  >
                    <ChevronLeft className="size-4" />
                    {pb.back ?? "Back"}
                  </button>
                ) : (
                  <span />
                )}
                {step < 2 ? (
                  <button
                    type="button"
                    onPointerDown={preventTapFocusScroll}
                    onClick={next}
                    className="btn-app-primary ui-btn-label hero-cta-shimmer inline-flex min-h-[48px] items-center gap-2 rounded-xl px-6 text-sm font-semibold"
                  >
                    {pb.continue ?? "Continue"}
                    <ChevronRight className="size-4" />
                  </button>
                ) : (
                  <Link
                    href={bookHref}
                    onClick={() => playFeedback("success", "success")}
                    className="btn-app-primary ui-btn-label hero-cta-shimmer inline-flex min-h-[48px] items-center gap-2 rounded-xl px-6 text-sm font-semibold"
                  >
                    {pb.requestCta ?? pb.ctaBook ?? "Send request"}
                    <ChevronRight className="size-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div
        className="rental-mobile-bar rental-mobile-bar--2026 glass-elevated glass-2026-sheet fixed inset-x-0 bottom-0 lg:hidden"
        style={{
          zIndex: Z.stickyBar,
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="rental-mobile-bar__inner">
          {step > 1 && (
            <button
              type="button"
              onPointerDown={preventTapFocusScroll}
              onClick={back}
              className="rental-mobile-bar__back tap-target"
              aria-label={pb.back ?? "Back"}
            >
              <ChevronLeft className="size-5" />
            </button>
          )}
          <div className="rental-mobile-bar__price min-w-0">
            <p className="rental-mobile-bar__label">
              {boat?.name ?? (pb.total ?? "Contact for rates")}
            </p>
            <p className="rental-mobile-bar__value">
              {boat ? (
                <>
                  <span className="text-sm">{RATES_CONTACT}</span>
                  <span className="rental-mobile-bar__meta">
                    · {hours} {pb.hours ?? "h"} · {guests} {guestLabel}
                  </span>
                </>
              ) : (
                "—"
              )}
            </p>
          </div>
          {step < 2 ? (
            <button
              type="button"
              onPointerDown={preventTapFocusScroll}
              onClick={next}
              className="rental-mobile-bar__cta btn-app-primary ui-btn-label hero-cta-shimmer tap-target"
            >
              {pb.continue ?? "Continue"}
              <ChevronRight className="size-4 shrink-0" />
            </button>
          ) : (
            <Link
              href={bookHref}
              onClick={() => playFeedback("success", "success")}
              className="rental-mobile-bar__cta btn-app-primary ui-btn-label hero-cta-shimmer tap-target"
            >
              {pb.requestCta ?? "Send request"}
              <ArrowRight className="size-4 shrink-0" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function RentalSummaryAside({
  boat,
  hours,
  guests,
  guestLabel,
  preferredDate,
  step,
  bookHref,
  pb,
}: {
  boat?: PublicBoat;
  hours: number;
  guests: number;
  guestLabel: string;
  preferredDate: string;
  step: Step;
  bookHref: string;
  pb: Record<string, string | undefined>;
}) {
  return (
    <div className="rental-summary glass-card glass-2026-card ui-2026-surface">
      <p className="rental-summary__badge">{pb.previewBadge ?? "Your request"}</p>

      <div className="rental-summary__media">
        {boat ? (
          <SafeImage
            src={boat.image}
            alt={boat.name}
            fill
            sizes="(max-width: 1023px) 100vw, 360px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ds-text-muted">
            <Ship className="mr-2 size-5" />
            {pb.emptyVessel}
          </div>
        )}
        {boat && (
          <div className="rental-summary__media-caption">
            <p className="font-semibold">{boat.name}</p>
            {boat.tagline && <p className="text-xs opacity-90">{boat.tagline}</p>}
          </div>
        )}
      </div>

      <dl className="rental-summary__facts">
        <div>
          <dt>{pb.duration ?? "Duration"}</dt>
          <dd>
            {hours} {pb.hours ?? "hours"}
          </dd>
        </div>
        <div>
          <dt>{pb.guests ?? "Guests"}</dt>
          <dd>
            {guests} {guestLabel}
          </dd>
        </div>
        {preferredDate && (
          <div className="col-span-2">
            <dt>{pb.preferredDate ?? "Date"}</dt>
            <dd>{preferredDate}</dd>
          </div>
        )}
      </dl>

      <div className="rental-summary__total">
        <p>{pb.total ?? "Contact for rates"}</p>
        <p className="rental-summary__amount text-sm">{RATES_CONTACT}</p>
        <p className="rental-summary__note">{pb.fuelNote}</p>
      </div>

      {step === 2 && (
        <Link
          href={bookHref}
          onClick={() => playFeedback("success", "success")}
          className="btn-app-primary ui-btn-label hidden min-h-[48px] w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold lg:inline-flex"
        >
          {pb.requestCta ?? "Send request"}
          <ArrowRight className="size-4" />
        </Link>
      )}

      {pb.disclaimer && (
        <p className="rental-summary__disclaimer">{pb.disclaimer}</p>
      )}
    </div>
  );
}

function VesselPicker({
  boats,
  selected,
  pb,
  onSelect,
}: {
  boats: PublicBoat[];
  selected: string;
  pb: Record<string, string | undefined>;
  onSelect: (id: string, pax: number) => void;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="min-w-0">
      <StepHeading
        title={pb.storyVessel ?? "Choose your boat"}
        hint={pb.storyVesselHint}
      />
      <div className="rental-vessel-grid rental-vessel-grid--scroll">
        {boats.map((b, i) => {
          const isOn = selected === b.id;
          const Card = reducedMotion ? "button" : motion.button;
          return (
            <Card
              key={b.id}
              type="button"
              layout={reducedMotion ? undefined : "position"}
              onPointerDown={preventTapFocusScroll}
              onClick={() => onSelect(b.id, b.pax)}
              data-sfx-skip
              initial={reducedMotion ? undefined : { opacity: 0, y: 14 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ ...appleSpringSoft, delay: i * 0.05 }}
              whileHover={reducedMotion ? undefined : hoverLift}
              whileTap={reducedMotion ? undefined : tapScale}
              className={cn(
                "rental-vessel-card tap-target text-left",
                isOn && "rental-vessel-card--selected rental-vessel-card--glow",
              )}
            >
              <div className="rental-vessel-card__media">
                <SafeImage
                  src={b.image}
                  alt={b.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 280px"
                  className="object-cover"
                />
                <AnimatePresence>
                  {isOn && (
                    <motion.span
                      initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                      transition={appleSpringSnappy}
                      className="rental-vessel-card__badge"
                    >
                      <Check className="size-3" />
                      {pb.selected ?? "Selected"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="rental-vessel-card__body">
                <p className="rental-vessel-card__name">{b.name}</p>
                {b.tagline && (
                  <p className="rental-vessel-card__tagline">{b.tagline}</p>
                )}
                <p className="rental-vessel-card__specs">
                  <span>
                    <Users className="size-3" aria-hidden />
                    {b.pax} seats
                  </span>
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ConfigureStep({
  boats,
  boatId,
  hours,
  guests,
  maxGuests,
  preferredDate,
  pb,
  onSelectBoat,
  onHours,
  onGuests,
  onDate,
}: {
  boats: PublicBoat[];
  boatId: string;
  hours: number;
  guests: number;
  maxGuests: number;
  preferredDate: string;
  pb: Record<string, string | undefined>;
  onSelectBoat: (id: string, pax: number) => void;
  onHours: (h: number) => void;
  onGuests: (g: number) => void;
  onDate: (d: string) => void;
}) {
  const boat = boats.find((b) => b.id === boatId);
  const guestLabel =
    guests === 1 ? (pb.guestSingular ?? "guest") : (pb.guestPlural ?? "guests");

  return (
    <div className="rental-configure min-w-0">
      <section className="rental-configure__section">
        <VesselPicker
          boats={boats}
          selected={boatId}
          pb={pb}
          onSelect={onSelectBoat}
        />
      </section>

      <section className="rental-configure__section">
        <h3 className="rental-configure__heading">
          {pb.storyDay ?? "Rental details"}
        </h3>
        {pb.storyDayHint && (
          <p className="rental-configure__hint">{pb.storyDayHint}</p>
        )}

        <div className="rental-adjust-grid">
          <AdjustCard
            icon={<Clock className="size-4 text-ds-brand" aria-hidden />}
            label={pb.duration ?? "Duration"}
            value={`${hours} ${pb.hours ?? "h"}`}
          >
            <RentalStepper
              value={hours}
              min={MIN_HOURS}
              max={MAX_HOURS}
              onDecrease={() => onHours(Math.max(MIN_HOURS, hours - 1))}
              onIncrease={() => onHours(Math.min(MAX_HOURS, hours + 1))}
              decreaseLabel={pb.decreaseHours ?? "Decrease hours"}
              increaseLabel={pb.increaseHours ?? "Increase hours"}
            />
          </AdjustCard>

          <AdjustCard
            icon={<Users className="size-4 text-ds-brand" aria-hidden />}
            label={pb.guests ?? "Guests"}
            value={`${guests} ${guestLabel}`}
            hint={pb.maxGuestsNote?.replace("{max}", String(maxGuests))}
          >
            <RentalStepper
              value={guests}
              min={1}
              max={maxGuests}
              onDecrease={() => onGuests(Math.max(1, guests - 1))}
              onIncrease={() => onGuests(Math.min(maxGuests, guests + 1))}
              decreaseLabel={pb.decreaseGuests ?? "Decrease guests"}
              increaseLabel={pb.increaseGuests ?? "Increase guests"}
            />
          </AdjustCard>
        </div>

        <fieldset className="rental-field rental-configure__date">
          <legend className="rental-field__legend">
            <CalendarDays className="size-4 text-ds-brand" aria-hidden />
            {pb.preferredDate ?? "Preferred date"}
            <span className="font-normal normal-case text-ds-text-muted">
              ({pb.optional ?? "optional"})
            </span>
          </legend>
          <input
            type="date"
            min={todayIso()}
            value={preferredDate}
            onChange={(e) => onDate(e.target.value)}
            className="rental-date tap-target"
          />
        </fieldset>

        {boat && (
          <div className="rental-configure__live">
            <p className="rental-configure__live-label">{pb.total ?? "Contact for rates"}</p>
            <p className="rental-configure__live-value text-sm">{RATES_CONTACT}</p>
            <p className="rental-configure__live-note">{pb.fuelNote}</p>
          </div>
        )}
      </section>

      <p className="rental-freedom-note text-sm leading-relaxed text-ds-text-secondary">
        {pb.rentalFreedomNote ??
          "No fixed tours — you rent the boat and sail where you like."}{" "}
        <Link href="/map" className="font-semibold text-ds-brand underline-offset-2 hover:underline">
          {pb.mapInspirationLink ?? "Browse the sea atlas"}
        </Link>
      </p>
    </div>
  );
}

function AdjustCard({
  icon,
  label,
  value,
  hint,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="rental-adjust-card glass-subtle glass-glow-hover">
      <div className="rental-adjust-card__head">
        <span className="rental-adjust-card__icon">{icon}</span>
        <div className="min-w-0">
          <p className="rental-adjust-card__label">{label}</p>
          <p className="rental-adjust-card__value">{value}</p>
        </div>
      </div>
      {children}
      {hint && <p className="rental-field__hint">{hint}</p>}
    </div>
  );
}

function RentalStepper({
  value,
  min,
  max,
  onDecrease,
  onIncrease,
  decreaseLabel,
  increaseLabel,
}: {
  value: number;
  min: number;
  max: number;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseLabel: string;
  increaseLabel: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="rental-stepper">
      <button
        type="button"
        onPointerDown={preventTapFocusScroll}
        onClick={onDecrease}
        disabled={value <= min}
        data-sfx-skip
        className="rental-stepper__btn tap-target"
        aria-label={decreaseLabel}
      >
        <Minus className="size-4" />
      </button>
      <AnimatePresence mode="popLayout" initial={false}>
        {reducedMotion ? (
          <span className="rental-stepper__value" aria-live="polite">
            {value}
          </span>
        ) : (
          <motion.span
            key={value}
            className="rental-stepper__value"
            aria-live="polite"
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 1.04 }}
            transition={appleSpringSnappy}
          >
            <CountUp value={value} startOnView={false} duration={0.35} />
          </motion.span>
        )}
      </AnimatePresence>
      <button
        type="button"
        onPointerDown={preventTapFocusScroll}
        onClick={onIncrease}
        disabled={value >= max}
        data-sfx-skip
        className="rental-stepper__btn tap-target"
        aria-label={increaseLabel}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function SummaryPanel({
  boat,
  hours,
  guests,
  guestLabel,
  preferredDate,
  included,
  excluded,
  pb,
  pkg,
}: {
  boat?: PublicBoat;
  hours: number;
  guests: number;
  guestLabel: string;
  preferredDate: string;
  included: string[];
  excluded: string[];
  pb: Record<string, string | undefined>;
  pkg?: { includedTitle?: string; excludedTitle?: string };
}) {
  return (
    <div className="min-w-0 space-y-5">
      <StepHeading title={pb.storyReview ?? "Your rental estimate"} />

      <div className="rental-estimate-card glass-card glass-2026-card ui-2026-surface">
        {boat && (
          <div className="rental-estimate-card__hero">
            <SafeImage
              src={boat.image}
              alt={boat.name}
              fill
              sizes="600px"
              className="object-cover"
            />
            <div className="rental-estimate-card__hero-copy">
              <p>{pb.boardingPassLabel ?? "Rental estimate"}</p>
              <h3>{boat.name}</h3>
            </div>
          </div>
        )}
        <dl className="rental-estimate-card__grid">
          <div>
            <dt>{pb.duration ?? "Duration"}</dt>
            <dd>
              {hours} {pb.hours ?? "hours"} · {guests} {guestLabel}
            </dd>
          </div>
          {preferredDate && (
            <div>
              <dt>{pb.preferredDate ?? "Date"}</dt>
              <dd>{preferredDate}</dd>
            </div>
          )}
          <div className="rental-estimate-card__total">
            <dt>{pb.total ?? "Contact for rates"}</dt>
            <dd className="text-sm">{RATES_CONTACT}</dd>
            <p>{pb.fuelNote}</p>
          </div>
        </dl>
      </div>

      {pb.requestNote && (
        <p className="rental-studio__disclaimer">{pb.requestNote}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <CheckList title={pkg?.includedTitle ?? pb.includedTitle ?? "Included"} items={included} />
        <CheckList
          title={pkg?.excludedTitle ?? pb.excludedTitle ?? "Not included"}
          items={excluded}
          muted
        />
      </div>

      <BookingTrustBadges />
    </div>
  );
}

function StepHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-5 min-w-0">
      <h2 className="text-balance text-xl font-semibold text-ds-text sm:text-2xl">{title}</h2>
      {hint && (
        <p className="mt-2 text-pretty text-sm leading-relaxed text-ds-text-secondary">{hint}</p>
      )}
    </div>
  );
}

function CheckList({
  title,
  items,
  muted,
}: {
  title: string;
  items: string[];
  muted?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ds-text-muted">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className={cn(
              "flex items-start gap-2 text-xs",
              muted ? "text-ds-text-muted" : "text-ds-text-secondary",
            )}
          >
            <Check
              className={cn("mt-0.5 size-3.5 shrink-0", muted ? "text-ds-text-muted" : "text-ds-brand")}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
