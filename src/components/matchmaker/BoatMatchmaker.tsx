"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  CalendarCheck,
  ChevronRight,
  Compass,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import { AppIcon } from "@/components/ui/AppIcon";
import { playFeedback } from "@/lib/feedback";
import { getMatchmakerIcon, NODE_ICONS } from "@/lib/matchmaker-icons";
import { appleSpringSnappy } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/LanguageProvider";
import type { PublicBoat, MatchmakerData } from "@/types";

type Phase = "idle" | "quiz" | "result";

interface BoatMatchmakerProps {
  matchmaker: MatchmakerData;
  boats: PublicBoat[];
  /** Hides section header when wrapped in PageShell */
  embedded?: boolean;
}

export function BoatMatchmaker({
  matchmaker,
  boats,
  embedded = false,
}: BoatMatchmakerProps) {
  const { t } = useI18n();
  const m = t.matchmaker;
  const reducedMotion = useReducedMotion();

  const [phase, setPhase] = useState<Phase>("idle");
  const [nodeId, setNodeId] = useState(matchmaker.start);
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [resultBoatId, setResultBoatId] = useState<string | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);

  const currentNode = matchmaker.nodes[nodeId];
  const NodeIcon = NODE_ICONS[nodeId] ?? Compass;
  const resultBoat = useMemo(
    () => boats.find((b) => b.id === resultBoatId),
    [boats, resultBoatId],
  );

  const progress =
    phase === "result"
      ? 100
      : phase === "quiz"
        ? Math.min((step / matchmaker.maxSteps) * 100, 92)
        : 0;

  const slide = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: appleSpringSnappy,
      };

  const startQuiz = () => {
    playFeedback("open", "medium");
    setPhase("quiz");
    setNodeId(matchmaker.start);
    setStep(1);
    setHistory([]);
    setResultBoatId(null);
    setPickedId(null);
  };

  const reset = () => {
    setPhase("idle");
    setNodeId(matchmaker.start);
    setStep(1);
    setHistory([]);
    setResultBoatId(null);
    setPickedId(null);
  };

  const goBack = () => {
    if (history.length === 0) return;
    playFeedback("dismiss", "light");
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setNodeId(prev);
    setStep((s) => Math.max(1, s - 1));
    setPhase("quiz");
    setResultBoatId(null);
    setPickedId(null);
  };

  const pickOption = (option: (typeof currentNode)["options"][number]) => {
    setPickedId(option.id);
    playFeedback("select", "light");
    window.setTimeout(() => {
      if (option.boatId) {
        setResultBoatId(option.boatId);
        setPhase("result");
        setPickedId(null);
        playFeedback("success", "success");
        return;
      }
      if (option.next) {
        setHistory((h) => [...h, nodeId]);
        setNodeId(option.next);
        setStep((s) => s + 1);
        setPickedId(null);
      }
    }, 220);
  };

  return (
    <section
      id="boat-matchmaker"
      className={embedded ? "relative" : "section-container relative"}
    >
      {!embedded && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={appleSpringSnappy}
          className="mb-8 text-center sm:mb-10"
        >
          <p className="ui-eyebrow section-eyebrow mb-2 text-ds-brand">{m.eyebrow}</p>
          <h2 className="ui-section-title text-2xl font-semibold text-ds-text sm:text-3xl">
            {m.title}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ds-text-secondary">
            {m.subtitle}
          </p>
        </motion.div>
      )}

      <div
        className={cn(
          "matchmaker-studio min-w-0",
          embedded ? "w-full" : "mx-auto max-w-2xl",
        )}
      >
        <div className="matchmaker-studio__shell glass-elevated">
          {(phase === "quiz" || phase === "result") && (
            <div className="matchmaker-studio__progress">
              <ol className="booking-steps__list" aria-hidden>
                {Array.from({ length: matchmaker.maxSteps }).map((_, i) => {
                  const done = phase === "result" || step > i + 1;
                  const active = phase === "quiz" && step === i + 1;
                  return (
                    <li
                      key={i}
                      className={cn(
                        "booking-steps__item",
                        active && "booking-steps__item--active",
                      )}
                    >
                      <span
                        className={cn(
                          "booking-steps__dot",
                          done && "booking-steps__dot--done",
                          active && "booking-steps__dot--active",
                        )}
                      >
                        {i + 1}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <div className="matchmaker-studio__progress-meta">
                <span>
                  {phase === "result"
                    ? m.resultEyebrow
                    : m.progress
                        .replace("{current}", String(step))
                        .replace("{total}", String(matchmaker.maxSteps))}
                </span>
                <strong>{Math.round(progress)}%</strong>
              </div>
              <div className="matchmaker-studio__progress-bar" aria-hidden>
                <motion.div
                  className="matchmaker-studio__progress-fill"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          <div
            className={cn(
              "matchmaker-studio__body landscape-compact",
              phase === "idle" && "matchmaker-studio__body--idle",
            )}
          >
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div key="idle" {...slide} className="matchmaker-studio__idle">
                  <div className="matchmaker-studio__idle-head">
                    <AppIcon name="matchmaker" size="lg" variant="glass" />
                    <div className="min-w-0 text-center sm:text-left">
                      <p className="matchmaker-studio__idle-title">{m.cta}</p>
                      <p className="matchmaker-studio__idle-copy">{m.subtitle}</p>
                    </div>
                  </div>

                  <ol className="matchmaker-studio__idle-steps">
                    {[m.step1Label, m.step2Label, m.step3Label]
                      .filter(Boolean)
                      .map((label, i) => (
                        <li key={label} className="matchmaker-studio__idle-step">
                          <span className="matchmaker-studio__idle-step-num">{i + 1}</span>
                          <span>{label}</span>
                        </li>
                      ))}
                  </ol>

                  <button
                    type="button"
                    data-sfx-skip
                    onClick={startQuiz}
                    className="btn-chip btn-app-green ui-btn-label btn-center inline-flex min-h-[48px] w-full items-center justify-center gap-2 px-6 sm:max-w-sm"
                  >
                    <Sparkles className="size-4 shrink-0" aria-hidden />
                    {m.cta}
                  </button>
                </motion.div>
              )}

              {phase === "quiz" && currentNode && (
                <motion.div key={nodeId} {...slide}>
                  <div className="matchmaker-studio__question">
                    <AppIcon name="matchmaker" size="md" variant="brand" className="mt-0.5" />
                    <div className="matchmaker-studio__question-text">
                      <h3 className="matchmaker-studio__question-title">
                        {currentNode.question}
                      </h3>
                      {currentNode.subtitle && (
                        <p className="matchmaker-studio__question-sub">
                          {currentNode.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="hidden shrink-0 sm:flex">
                      <NodeIcon className="size-5 text-ds-brand" aria-hidden />
                    </span>
                  </div>

                  <div className="matchmaker-studio__options">
                    {currentNode.options.map((option, index) => {
                      const Icon = getMatchmakerIcon(option.icon);
                      const isPicked = pickedId === option.id;
                      return (
                        <motion.div
                          key={option.id}
                          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...appleSpringSnappy, delay: index * 0.05 }}
                        >
                          <button
                            type="button"
                            data-sfx-skip
                            onClick={() => pickOption(option)}
                            disabled={!!pickedId}
                            className={cn(
                              "matchmaker-studio__option",
                              isPicked && "matchmaker-studio__option--picked",
                            )}
                          >
                            <span className="matchmaker-studio__option-icon">
                              <Icon className="size-5" aria-hidden />
                            </span>
                            <span className="matchmaker-studio__option-label">
                              {option.label}
                            </span>
                            <ChevronRight
                              className="size-4 shrink-0 text-ds-text-muted"
                              aria-hidden
                            />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>

                  {history.length > 0 && (
                    <button
                      type="button"
                      data-sfx-skip
                      onClick={goBack}
                      disabled={!!pickedId}
                      className="matchmaker-studio__back"
                    >
                      <ArrowLeft className="size-3.5" aria-hidden />
                      {m.back}
                    </button>
                  )}
                </motion.div>
              )}

              {phase === "result" && resultBoat && (
                <motion.div key="result" {...slide}>
                  <div className="matchmaker-studio__result-head">
                    <p className="matchmaker-studio__result-badge">
                      <Star className="size-3 fill-current" aria-hidden />
                      {m.resultEyebrow}
                    </p>
                    <h3 className="matchmaker-studio__result-title">{m.resultTitle}</h3>
                  </div>

                  <div className="matchmaker-studio__result-card">
                    <div className="matchmaker-studio__result-media">
                      <SafeImage
                        src={resultBoat.image}
                        alt={resultBoat.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 560px"
                        className="object-cover"
                      />
                      <div className="matchmaker-studio__result-caption">
                        <p className="matchmaker-studio__result-tagline">
                          {resultBoat.tagline}
                        </p>
                        <h4 className="matchmaker-studio__result-name">{resultBoat.name}</h4>
                        <div className="matchmaker-studio__result-facts">
                          <span className="inline-flex items-center gap-1">
                            <Users className="size-3.5" aria-hidden />
                            {resultBoat.pax} pax
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="matchmaker-studio__result-desc">{resultBoat.description}</p>
                  </div>

                  <div className="matchmaker-studio__actions">
                    <Link
                      href={`/booking?boat=${resultBoat.id}`}
                      className="btn-app-primary ui-btn-label btn-center inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 px-6"
                    >
                      <CalendarCheck className="size-4 shrink-0" aria-hidden />
                      {m.bookNow}
                    </Link>
                    <button
                      type="button"
                      onClick={reset}
                      className="btn-chip btn-app-green ui-btn-label btn-center inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 px-6"
                    >
                      <Sparkles className="size-4 shrink-0" aria-hidden />
                      {m.retry}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
