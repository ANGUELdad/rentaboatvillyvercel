"use client";

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Mail,
  Minus,
  Phone,
  Plus,
  Ship,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { BookingTrustBadges } from "@/components/conversion/BookingTrustBadges";
import { useMobileViewport } from "@/hooks/useMobileViewport";
import { useMounted } from "@/hooks/useMounted";
import { StepProgress } from "@/components/conversion/StepProgress";
import { SafeImage } from "@/components/SafeImage";
import { playFeedback } from "@/lib/feedback";
import { postJson } from "@/lib/client-api";
import {
  maxBookingDateInSiteTz,
  todayInSiteTz,
} from "@/lib/security/timezone";
import { isBookingDateInRange, isValidTime } from "@/lib/security/validate";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/DateField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HoneypotField } from "@/components/security/HoneypotField";
import { useI18n } from "@/providers/LanguageProvider";
import type { PublicBoat } from "@/types";

interface BookingSectionProps {
  boats: PublicBoat[];
}

function preventTapFocusScroll(e: ReactMouseEvent<HTMLButtonElement>) {
  e.preventDefault();
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  boatId: string;
  guests: string;
  notes: string;
  _hp: string;
}

type BookingStep = 1 | 2;

const GOOGLE_ADS_BOOKING_CONVERSION_ID = "AW-18244174841/XXmjCI_N_r8cEPmHwPtD";

type GoogleTagParams = {
  send_to: string;
  value: number;
  currency: string;
};

type GoogleTagFunction = (
  command: "event",
  action: "conversion",
  params: GoogleTagParams,
) => void;

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  date: "",
  time: "10:00",
  boatId: "",
  guests: "2",
  notes: "",
  _hp: "",
};

type SearchParamsLike = Pick<URLSearchParams, "get">;

function bookingSearchParamsKey(searchParams: SearchParamsLike): string {
  return ["boat", "spot", "guests", "date", "time", "hours"]
    .map((key) => `${key}=${searchParams.get(key) ?? ""}`)
    .join("&");
}

function applySearchParamsToForm(
  searchParams: SearchParamsLike,
  boats: PublicBoat[],
  base: FormState = initialForm,
): FormState {
  const boatParam = searchParams.get("boat");
  const spotParam = searchParams.get("spot");
  const guestsParam = searchParams.get("guests");
  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");
  const hoursParam = searchParams.get("hours");

  if (
    !boatParam &&
    !spotParam &&
    !guestsParam &&
    !dateParam &&
    !timeParam &&
    !hoursParam
  ) {
    return base;
  }

  const next = { ...base };

  if (boatParam && boats.some((b) => b.id === boatParam)) {
    next.boatId = boatParam;
  }

  if (spotParam) {
    const interest = `Destination interest: ${spotParam.replace(/-/g, " ")}`;
    if (!next.notes.includes(interest)) {
      next.notes = next.notes ? `${next.notes}\n${interest}` : interest;
    }
  }

  if (guestsParam) {
    const g = Number(guestsParam);
    if (Number.isFinite(g) && g >= 1) {
      const cap = next.boatId
        ? (boats.find((b) => b.id === next.boatId)?.pax ?? 10)
        : 10;
      next.guests = String(Math.min(g, cap));
    }
  }

  if (dateParam && isBookingDateInRange(dateParam)) {
    next.date = dateParam;
  }

  if (timeParam && isValidTime(timeParam)) {
    next.time = timeParam;
  }

  if (hoursParam) {
    const h = Number(hoursParam);
    if (h >= 4 && h <= 8 && Number.isInteger(h)) {
      const note = `Rental duration: ${h} hours`;
      if (!next.notes.includes(note)) {
        next.notes = next.notes ? `${next.notes}\n${note}` : note;
      }
    }
  }

  if (next.boatId) {
    const cap = boats.find((b) => b.id === next.boatId)?.pax;
    if (cap) {
      next.guests = String(Math.min(Number(next.guests) || 1, cap));
    }
  }

  return next;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function trackBookingConversion() {
  const params: GoogleTagParams = {
    send_to: GOOGLE_ADS_BOOKING_CONVERSION_ID,
    value: 1.0,
    currency: "EUR",
  };
  const win = window as Window & {
    dataLayer?: unknown[];
    gtag?: GoogleTagFunction;
  };

  if (typeof win.gtag === "function") {
    win.gtag("event", "conversion", params);
    return;
  }

  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push(["event", "conversion", params]);
}

export function BookingSection({
  boats,
  hideHeader,
}: BookingSectionProps & { hideHeader?: boolean }) {
  const { t, locale } = useI18n();
  const f = t.booking.form ?? {};
  const pb = t.packageBuilder ?? {};
  const cv = t.conversion?.booking ?? {};
  const searchParams = useSearchParams();
  const mounted = useMounted();
  const isMobileViewport = useMobileViewport();
  const isMobileFlow = mounted && isMobileViewport && !!hideHeader;
  const [form, setForm] = useState<FormState>(() =>
    applySearchParamsToForm(searchParams, boats),
  );
  const [step, setStep] = useState<BookingStep>(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const submittingRef = useRef(false);
  const lastSearchParamsKey = useRef(bookingSearchParamsKey(searchParams));

  const selectedBoat = useMemo(
    () => boats.find((b) => b.id === form.boatId),
    [boats, form.boatId],
  );
  const maxGuests = selectedBoat?.pax ?? 10;
  const guestCount = Math.max(1, Number(form.guests) || 1);
  const bookingErrorMessages = useMemo(
    () => ({
      invalid_json: cv.errorInvalidRequest ?? t.common.errorGeneric,
      invalid_request: cv.errorInvalidRequest ?? t.common.errorGeneric,
      empty_body: cv.errorInvalidRequest ?? t.common.errorGeneric,
      unsupported_content_type: cv.errorUnsupportedRequest ?? t.common.errorGeneric,
      request_too_large: cv.errorRequestTooLarge ?? t.common.errorGeneric,
      invalid_email: cv.validationEmail ?? "Please enter a valid email.",
      invalid_phone: cv.validationPhone ?? "Please enter a phone number.",
      invalid_date: cv.validationDate ?? "Please choose a rental date.",
      invalid_time: cv.validationTime ?? "Please choose a valid time between 08:00 and 20:00.",
      invalid_boat_selection: cv.validationBoat ?? "Please select a boat.",
      invalid_boat: cv.validationBoat ?? "Please select a boat.",
      invalid_guests: cv.validationGuests ?? "Please choose a valid guest count.",
      invalid_guest_range: cv.validationGuests ?? "Please choose a valid guest count.",
      guests_exceed_capacity: cv.validationGuests ?? "Please choose a valid guest count.",
      missing_required_fields: cv.errorInvalidRequest ?? t.common.errorGeneric,
      duplicate_booking: cv.errorDuplicate ?? t.common.errorGeneric,
      rate_limited: cv.errorRateLimited ?? t.common.errorGeneric,
      guest_email_failed: cv.errorEmailFailed ?? t.common.errorGeneric,
      server_error: cv.errorServer ?? t.common.errorGeneric,
      notification_failed: cv.errorNotificationFailed ?? t.common.errorGeneric,
      successWarningGuestEmail:
        cv.successWarningGuestEmail ?? cv.errorEmailFailed ?? t.common.errorGeneric,
    }),
    [cv, t.common.errorGeneric],
  );

  useEffect(() => {
    const key = bookingSearchParamsKey(searchParams);
    if (lastSearchParamsKey.current === key) return;
    lastSearchParamsKey.current = key;
    setForm((prev) => applySearchParamsToForm(searchParams, boats, prev));
    setStep(1);
    setStatus("idle");
    setErrorMsg("");
    setSuccessNotice("");
    setFieldErrors({});
  }, [searchParams, boats]);

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateStep = (s: BookingStep): boolean => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (s === 1) {
      if (!form.date) errors.date = cv.validationDate ?? "Please choose a rental date.";
      if (!isValidTime(form.time)) {
        errors.time = cv.validationTime ?? "Please choose a valid time between 08:00 and 20:00.";
      }
      if (!selectedBoat && form.boatId) {
        errors.boatId = cv.validationBoat ?? "Please select a boat.";
      }
      if (Number.isNaN(Number(form.guests)) || Number(form.guests) < 1) {
        errors.guests = cv.validationGuests ?? "Please choose a valid guest count.";
      }
      if (!selectedBoat && Number(form.guests) > 10) {
        errors.guests = cv.validationGuests ?? "Please choose a valid guest count.";
      }
      if (selectedBoat && Number(form.guests) > selectedBoat.pax) {
        errors.guests = cv.validationGuests ?? "Please choose a valid guest count.";
      }
    }
    if (s === 2) {
      if (!form.fullName.trim()) errors.fullName = cv.validationName ?? "Please enter your full name.";
      if (!isValidEmail(form.email)) errors.email = cv.validationEmail ?? "Please enter a valid email.";
      if (!form.phone.trim()) errors.phone = cv.validationPhone ?? "Please enter a phone number.";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setErrorMsg("");
      setStatus("error");
      return false;
    }
    setErrorMsg("");
    setStatus("idle");
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) {
      playFeedback("error", "light");
      return;
    }
    playFeedback("step", "light");
    setStep(2);
  };

  const goBack = () => {
    setErrorMsg("");
    setStatus("idle");
    setSuccessNotice("");
    playFeedback("step", "light");
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    try {
      if (!validateStep(1)) {
        playFeedback("error", "light");
        setStep(1);
        return;
      }
      if (!validateStep(2)) {
        playFeedback("error", "light");
        return;
      }
      if (!acceptedTerms) {
        setErrorMsg(t.booking.consentCheckboxError ?? "Please accept the terms to continue.");
        setStatus("error");
        return;
      }

      submittingRef.current = true;
      setStatus("loading");
      setErrorMsg("");

      const result = await postJson<{ success: boolean; code?: string }>("/api/bookings", {
        ...form,
        guests: Number(form.guests),
        locale,
      });

      if (result.ok) {
        setConfirmedEmail(form.email);
        setSuccessNotice(
          result.data.code === "guest_email_failed"
            ? bookingErrorMessages.successWarningGuestEmail ??
                cv.errorEmailFailed ??
                "Your request was received, but the confirmation email could not be sent."
            : "",
        );
        setStatus("success");
        trackBookingConversion();
        playFeedback("success", "success");
        setForm(initialForm);
        setAcceptedTerms(false);
        setStep(1);
      } else {
        const code = result.code ?? "";
        if (code === "invalid_date") {
          setFieldErrors({ date: bookingErrorMessages.invalid_date });
          setStep(1);
        } else if (code === "invalid_time") {
          setFieldErrors({ time: bookingErrorMessages.invalid_time });
          setStep(1);
        } else if (code === "invalid_boat" || code === "invalid_boat_selection") {
          setFieldErrors({ boatId: bookingErrorMessages.invalid_boat });
          setStep(1);
        } else if (
          code === "invalid_guests" ||
          code === "invalid_guest_range" ||
          code === "guests_exceed_capacity"
        ) {
          setFieldErrors({ guests: bookingErrorMessages.invalid_guests });
          setStep(1);
        } else if (code === "invalid_email") {
          setFieldErrors({ email: bookingErrorMessages.invalid_email });
          setStep(2);
        } else if (code === "invalid_phone") {
          setFieldErrors({ phone: bookingErrorMessages.invalid_phone });
          setStep(2);
        } else if (code === "missing_required_fields") {
          setStep(1);
        }
        setStatus("error");
        setErrorMsg(
          bookingErrorMessages[code as keyof typeof bookingErrorMessages] ??
            (result.status === 0
              ? bookingErrorMessages.server_error
              : result.status === 409
                ? bookingErrorMessages.duplicate_booking
                : result.status === 413
                  ? bookingErrorMessages.request_too_large
                  : result.status === 415
                    ? bookingErrorMessages.unsupported_content_type
                    : result.error || bookingErrorMessages.server_error),
        );
      }
    } catch {
      setStatus("error");
      setErrorMsg(bookingErrorMessages.server_error);
    } finally {
      submittingRef.current = false;
    }
  };

  if (boats.length === 0) {
    return (
      <section id="booking" className="py-16 text-center">
        <p className="text-sm text-ds-text-muted">
          {cv.emptyFleet ?? "Booking is temporarily unavailable. Please call us."}
        </p>
      </section>
    );
  }

  const stepTitle =
    step === 1
      ? cv.step1Title ?? "When & which boat?"
      : cv.step2Title ?? "Your details";
  const formTitle = isMobileFlow
    ? cv.mobileTitle ?? cv.step1Title ?? "When & which boat?"
    : stepTitle;
  const showTripPanel = isMobileFlow || step === 1;
  const showContactPanel = isMobileFlow || step === 2;

  const guidelinesAside = (
    <>
      <div className="booking-expect">
        <p className="booking-expect__title">{t.booking.expectTitle}</p>
        <ol className="booking-expect__list">
          <li>{t.booking.expect1}</li>
          <li>{t.booking.expect2}</li>
          <li>{t.booking.expect3}</li>
        </ol>
      </div>
      <BookingTrustBadges className="booking-trust-compact" />
    </>
  );

  return (
    <section
      id="booking"
      className={
        hideHeader
          ? "booking-studio panel-fit w-full min-w-0"
          : "booking-studio relative py-14 sm:py-16 lg:py-12"
      }
    >
      <div
        className={
          hideHeader
            ? "w-full min-w-0"
            : "mx-auto w-full max-w-7xl min-w-0 box-border px-4 sm:px-6 lg:px-8"
        }
      >
        {!hideHeader && (
          <header className="booking-studio__head mb-10 text-center lg:text-left">
            <p className="section-eyebrow mb-3 lg:inline-flex">{t.booking.eyebrow}</p>
            <h2 className="heading-fit section-title text-3xl sm:text-4xl">
              {t.booking.title}
            </h2>
          </header>
        )}

        <div
          className={
            hideHeader
              ? `booking-studio__layout${isMobileFlow ? " booking-studio__layout--mobile-flow" : ""}`
              : "booking-studio__layout booking-studio__layout--single"
          }
        >
          <form
            onSubmit={handleSubmit}
            noValidate
            className="booking-studio__form"
          >
            {status === "success" ? (
              <div className="booking-success">
                <CheckCircle2 className="booking-success__icon" aria-hidden />
                <h3 className="booking-success__title">{t.booking.successTitle}</h3>
                <p className="booking-success__message">
                  {t.booking.successMessage ?? t.booking.successDesc}
                </p>
                {confirmedEmail && (
                  <p className="booking-success__email text-sm text-ds-text-muted">
                    {(t.booking.successEmailNote ??
                      "A confirmation email was sent to {email}."
                    ).replace("{email}", confirmedEmail)}
                  </p>
                )}
                {successNotice && (
                  <p className="booking-success__warning" role="status">
                    {successNotice}
                  </p>
                )}
                <Button
                  type="button"
                  className="btn-app-primary ui-btn-label"
                  onClick={() => {
                    setStatus("idle");
                    setConfirmedEmail("");
                    setSuccessNotice("");
                  }}
                >
                  {t.booking.successAgain}
                </Button>
              </div>
            ) : (
              <>
                <div className="booking-studio__form-head">
                  {!isMobileFlow && (
                    <div className="booking-studio__progress glass-subtle">
                      <StepProgress current={step} />
                    </div>
                  )}
                  <h3 className="booking-studio__step-title">{formTitle}</h3>
                </div>

                <HoneypotField
                  value={form._hp}
                  onChange={(v) => update("_hp", v)}
                />

                <div
                  className={
                    isMobileFlow ? "booking-studio__panels booking-studio__panels--mobile" : undefined
                  }
                >
                {showTripPanel && (
                  <div className="booking-studio__panel booking-step-trip space-y-5">
                    <div className="booking-fields booking-fields--date">
                      <DateField
                        label={f.date ?? "Date"}
                        value={form.date}
                        onChange={(v) => update("date", v)}
                        required
                        min={todayInSiteTz()}
                        max={maxBookingDateInSiteTz()}
                        placeholder={f.date ?? "Select rental date"}
                      />
                      {fieldErrors.date && (
                        <p role="alert" className="booking-error booking-field--full">
                          {fieldErrors.date}
                        </p>
                      )}
                      <div className="booking-field min-w-0 space-y-2">
                        <Label htmlFor="booking-time" className="booking-label">
                          <Clock className="size-3.5 text-summer-gold" aria-hidden />
                          {f.time ?? "Time"}
                        </Label>
                      <Input
                        id="booking-time"
                        type="time"
                        value={form.time}
                        onChange={(e) => update("time", e.target.value)}
                        className="booking-input"
                      />
                      {fieldErrors.time && (
                        <p role="alert" className="booking-error booking-field--full">
                          {fieldErrors.time}
                        </p>
                      )}
                    </div>
                  </div>

                    <div className="booking-field space-y-2">
                      <Label className="booking-label">
                        <Users className="size-3.5 text-summer-aqua" aria-hidden />
                        {f.guests ?? "Guests"}
                      </Label>
                      <div className="booking-guest-counter app-input flex h-12 w-full min-h-[48px] items-center justify-between gap-2 px-2">
                        <button
                          type="button"
                          onMouseDown={preventTapFocusScroll}
                          onClick={() => {
                            if (guestCount <= 1) return;
                            update("guests", String(guestCount - 1));
                            playFeedback("select", "light");
                          }}
                          disabled={guestCount <= 1}
                          className="booking-guest-counter__btn tap-target"
                          aria-label={pb.decreaseGuests ?? "Decrease guests"}
                        >
                          <Minus className="size-4" aria-hidden />
                        </button>
                        <span className="booking-guest-counter__value flex min-w-0 flex-1 items-center justify-center gap-2 text-sm font-semibold text-ds-text">
                          {guestCount}{" "}
                          {guestCount === 1
                            ? (f.guestCount ?? "guest")
                            : (f.guestCountPlural ?? "guests")}
                        </span>
                        <button
                          type="button"
                          onMouseDown={preventTapFocusScroll}
                          onClick={() => {
                            if (guestCount >= maxGuests) return;
                            update("guests", String(guestCount + 1));
                            playFeedback("select", "light");
                          }}
                          disabled={guestCount >= maxGuests}
                          className="booking-guest-counter__btn tap-target"
                          aria-label={pb.increaseGuests ?? "Increase guests"}
                        >
                          <Plus className="size-4" aria-hidden />
                        </button>
                      </div>
                    </div>

                    <div className="booking-vessels space-y-3">
                      <Label className="booking-label">
                        <Ship className="size-3.5 text-app-teal" aria-hidden />
                        {f.vessel ?? "Boat"}
                        {f.vesselOptional && (
                          <span className="normal-case tracking-normal text-ds-text-muted">
                            ({f.vesselOptional})
                          </span>
                        )}
                      </Label>
                      <div className="booking-vessels__scroll scrollbar-none">
                        {boats.map((boat) => {
                          const selected = form.boatId === boat.id;
                          return (
                            <button
                              key={boat.id}
                              type="button"
                              onClick={() => {
                                setForm((prev) => {
                                  const guestTotal = Math.max(
                                    1,
                                    Number(prev.guests) || 1,
                                  );
                                  return {
                                    ...prev,
                                    boatId: boat.id,
                                    guests: String(Math.min(guestTotal, boat.pax)),
                                  };
                                });
                                setFieldErrors((prev) => {
                                  if (!prev.boatId) return prev;
                                  const next = { ...prev };
                                  delete next.boatId;
                                  return next;
                                });
                              }}
                              aria-pressed={selected}
                              className={`booking-vessel tap-target ${selected ? "booking-vessel--selected" : ""}`}
                            >
                              <div className="booking-vessel__media">
                                <SafeImage
                                  src={boat.image}
                                  alt=""
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="booking-vessel__body">
                                <p className="booking-vessel__name">{boat.name}</p>
                                <p className="booking-vessel__specs">
                                  <Users className="size-3" aria-hidden />
                                  {boat.pax}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {fieldErrors.boatId && (
                        <p role="alert" className="booking-error booking-field--full">
                          {fieldErrors.boatId}
                        </p>
                      )}
                      {fieldErrors.guests && (
                        <p role="alert" className="booking-error booking-field--full">
                          {fieldErrors.guests}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {showContactPanel && (
                  <div className="booking-studio__panel booking-step-contact booking-fields booking-fields--contact space-y-4">
                    <div className="booking-field booking-field--full min-w-0 space-y-2">
                      <Label htmlFor="booking-name" className="booking-label">
                        <User className="size-3.5 text-app-teal" aria-hidden />
                        {f.fullName ?? "Full name"}
                      </Label>
                      <Input
                        id="booking-name"
                        required
                        autoComplete="name"
                        value={form.fullName}
                        onChange={(e) => update("fullName", e.target.value)}
                        aria-invalid={!!fieldErrors.fullName}
                        aria-describedby={fieldErrors.fullName ? "err-name" : undefined}
                        className="booking-input"
                        placeholder={f.namePlaceholder ?? "John Smith"}
                      />
                      {fieldErrors.fullName && (
                        <p id="err-name" role="alert" className="booking-error">
                          {fieldErrors.fullName}
                        </p>
                      )}
                    </div>
                    <div className="booking-field min-w-0 space-y-2">
                      <Label htmlFor="booking-email" className="booking-label">
                        <Mail className="size-3.5 text-summer-coral" aria-hidden />
                        {f.email ?? "Email"}
                      </Label>
                      <Input
                        id="booking-email"
                        required
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby={fieldErrors.email ? "err-email" : undefined}
                        className="booking-input"
                        placeholder={f.emailPlaceholder ?? "you@email.com"}
                      />
                      {fieldErrors.email && (
                        <p id="err-email" role="alert" className="booking-error">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                    <div className="booking-field min-w-0 space-y-2">
                      <Label htmlFor="booking-phone" className="booking-label">
                        <Phone className="size-3.5 text-summer-aqua" aria-hidden />
                        {f.phone ?? "Phone"}
                      </Label>
                      <Input
                        id="booking-phone"
                        required
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        aria-invalid={!!fieldErrors.phone}
                        aria-describedby={fieldErrors.phone ? "err-phone" : undefined}
                        className="booking-input"
                        placeholder={f.phonePlaceholder ?? "+30 690 000 0000"}
                      />
                      {fieldErrors.phone && (
                        <p id="err-phone" role="alert" className="booking-error">
                          {fieldErrors.phone}
                        </p>
                      )}
                    </div>
                    {!isMobileFlow && (
                      <>
                        <div className="booking-field space-y-2">
                          <Label htmlFor="booking-notes" className="booking-label">
                            {f.notes ?? "Notes"}
                            <span className="normal-case tracking-normal text-ds-text-muted">
                              ({f.vesselOptional ?? "optional"})
                            </span>
                          </Label>
                          <Textarea
                            id="booking-notes"
                            value={form.notes}
                            onChange={(e) => update("notes", e.target.value)}
                            className="booking-input min-h-20"
                            placeholder={f.notesPlaceholder ?? "Anything we should know?"}
                          />
                        </div>
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ds-border-strong/60 bg-ds-surface/40 p-4">
                          <input
                            type="checkbox"
                            required
                            checked={acceptedTerms}
                            onChange={(e) => {
                              setAcceptedTerms(e.target.checked);
                              if (e.target.checked) {
                                setErrorMsg("");
                                setStatus("idle");
                              }
                            }}
                            className="mt-0.5 size-4 shrink-0 accent-ds-brand"
                          />
                          <span className="text-xs leading-relaxed text-ds-text-secondary">
                            {t.booking.consentCheckbox ??
                              "I agree to the Terms of Service, Privacy Policy, and processing of my personal data for this booking request."}
                          </span>
                        </label>
                        <p className="booking-legal text-xs text-ds-text-muted">
                          {cv.legalNote ?? "By requesting, you agree to our"}{" "}
                          <Link href="/terms" className="text-app-teal underline-offset-2 hover:underline">
                            {cv.termsLink ?? t.footer.terms}
                          </Link>{" "}
                          {cv.and ?? "and"}{" "}
                          <Link href="/privacy" className="text-app-teal underline-offset-2 hover:underline">
                            {cv.privacyLink ?? t.footer.privacy}
                          </Link>
                          .
                        </p>
                      </>
                    )}
                  </div>
                )}

                {isMobileFlow && (
                  <div className="booking-studio__panel booking-step-extras space-y-4">
                    <div className="booking-field space-y-2">
                      <Label htmlFor="booking-notes-mobile" className="booking-label">
                        {f.notes ?? "Notes"}
                        <span className="normal-case tracking-normal text-ds-text-muted">
                          ({f.vesselOptional ?? "optional"})
                        </span>
                      </Label>
                      <Textarea
                        id="booking-notes-mobile"
                        value={form.notes}
                        onChange={(e) => update("notes", e.target.value)}
                        className="booking-input min-h-20"
                        placeholder={f.notesPlaceholder ?? "Anything we should know?"}
                      />
                    </div>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ds-border-strong/60 bg-ds-surface/40 p-4">
                      <input
                        type="checkbox"
                        required
                        checked={acceptedTerms}
                        onChange={(e) => {
                          setAcceptedTerms(e.target.checked);
                          if (e.target.checked) {
                            setErrorMsg("");
                            setStatus("idle");
                          }
                        }}
                        className="mt-0.5 size-4 shrink-0 accent-ds-brand"
                      />
                      <span className="text-xs leading-relaxed text-ds-text-secondary">
                        {t.booking.consentCheckbox ??
                          "I agree to the Terms of Service, Privacy Policy, and processing of my personal data for this booking request."}
                      </span>
                    </label>
                    <p className="booking-legal text-xs text-ds-text-muted">
                      {cv.legalNote ?? "By requesting, you agree to our"}{" "}
                      <Link href="/terms" className="text-app-teal underline-offset-2 hover:underline">
                        {cv.termsLink ?? t.footer.terms}
                      </Link>{" "}
                      {cv.and ?? "and"}{" "}
                      <Link href="/privacy" className="text-app-teal underline-offset-2 hover:underline">
                        {cv.privacyLink ?? t.footer.privacy}
                      </Link>
                      .
                    </p>
                  </div>
                )}
                </div>

                {status === "error" &&
                  errorMsg &&
                  Object.keys(fieldErrors).length === 0 && (
                  <p role="alert" className="booking-error">
                    {errorMsg}
                  </p>
                )}

                <div className="booking-studio__actions booking-actions">
                  {isMobileFlow ? (
                    <Button
                      type="submit"
                      disabled={status === "loading" || !acceptedTerms}
                      className="btn-app-primary ui-btn-label booking-actions__primary w-full"
                    >
                      {status === "loading" ? t.booking.submitting : t.booking.submit}
                    </Button>
                  ) : (
                    <>
                      {step > 1 ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="tap-target gap-2 border-ds-border-strong bg-transparent text-ds-text hover:bg-ds-surface-hover"
                          onClick={goBack}
                        >
                          <ArrowLeft className="size-4" aria-hidden />
                          {cv.back ?? "Back"}
                        </Button>
                      ) : (
                        <span />
                      )}
                      {step < 2 ? (
                        <Button
                          type="button"
                          className="btn-app-primary ui-btn-label booking-actions__primary gap-2"
                          onClick={goNext}
                        >
                          {cv.continue ?? "Continue"}
                          <ArrowRight className="size-4" aria-hidden />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={status === "loading" || !acceptedTerms}
                          className="btn-app-primary ui-btn-label booking-actions__primary"
                        >
                          {status === "loading" ? t.booking.submitting : t.booking.submit}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </form>

          {hideHeader && status !== "success" && (
            <>
              <aside className="booking-studio__aside booking-studio__aside--desk">
                <div className="booking-summary">
                  <p className="booking-summary__title">
                    <ClipboardList className="size-3.5" aria-hidden />
                    {t.booking.summaryTitle}
                  </p>
                  {selectedBoat ? (
                    <div className="booking-summary__boat">
                      <div className="booking-summary__boat-media">
                        <SafeImage
                          src={selectedBoat.image}
                          alt=""
                          fill
                          sizes="52px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ds-text">
                          {selectedBoat.name}
                        </p>
                        <p className="text-xs text-ds-text-muted">
                          {selectedBoat.pax}{" "}
                          {selectedBoat.pax === 1
                            ? (f.guestCount ?? "guest")
                            : (f.guestCountPlural ?? "guests")}{" "}
                          max
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="booking-summary__empty">{t.booking.summaryBoatEmpty}</p>
                  )}
                  <ul className="booking-summary__meta">
                    <li>
                      <Calendar className="size-3.5 shrink-0 text-ds-brand" aria-hidden />
                      <span>{form.date || (f.date ?? "Date")}</span>
                    </li>
                    <li>
                      <Clock className="size-3.5 shrink-0 text-summer-gold" aria-hidden />
                      <span>{form.time || "10:00"}</span>
                    </li>
                    <li>
                      <Users className="size-3.5 shrink-0 text-summer-aqua" aria-hidden />
                      <span>
                        {guestCount}{" "}
                        {guestCount === 1
                          ? (f.guestCount ?? "guest")
                          : (f.guestCountPlural ?? "guests")}
                      </span>
                    </li>
                  </ul>
                </div>
                {guidelinesAside}
              </aside>
              <aside className="booking-studio__aside booking-studio__aside--foot">
                {guidelinesAside}
              </aside>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
