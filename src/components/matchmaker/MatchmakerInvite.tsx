"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock, Ship, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { appleSpring } from "@/lib/motion";
import { useI18n } from "@/providers/LanguageProvider";

const STEP_ICONS = [Users, Sparkles, Ship] as const;

export function MatchmakerInvite() {
  const { t } = useI18n();
  const m = t.matchmaker;
  const reduceMotion = useReducedMotion();

  const steps = [
    {
      label: m.step1Label ?? "Group size",
      desc: m.step1Desc ?? "Who's coming aboard?",
    },
    {
      label: m.step2Label ?? "Your vibe",
      desc: m.step2Desc ?? "Coves, family fun, or celebration.",
    },
    {
      label: m.step3Label ?? "Your match",
      desc: m.step3Desc ?? "We pick from our Limenaria fleet.",
    },
  ];

  const stats = [
    m.statQuestions ?? "3 questions",
    m.statTimeLabel && m.statTime
      ? `${m.statTimeLabel} ${m.statTime}`
      : (m.statTime ?? "~2 min"),
  ];

  return (
    <section id="boat-matchmaker" className="matchmaker-invite">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={appleSpring}
        className="matchmaker-invite__card"
      >
        <div className="matchmaker-invite__glow" aria-hidden />

        <div className="matchmaker-invite__head">
          <div className="matchmaker-invite__copy min-w-0">
            <p className="matchmaker-invite__eyebrow">{m.eyebrow}</p>
            <h2 className="matchmaker-invite__title text-balance">{m.title}</h2>
            <p className="matchmaker-invite__subtitle text-pretty">{m.subtitle}</p>
          </div>
          <ul className="matchmaker-invite__stats" aria-label={m.stepsTitle ?? "How it works"}>
            {stats.map((stat) => (
              <li key={stat} className="matchmaker-invite__stat">
                <Clock className="size-3 shrink-0 opacity-70" aria-hidden />
                {stat}
              </li>
            ))}
          </ul>
        </div>

        <ol className="matchmaker-invite__flow">
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[i] ?? Ship;
            return (
              <li key={step.label} className="matchmaker-invite__step">
                <div className="matchmaker-invite__step-card">
                  <span className="matchmaker-invite__step-num" aria-hidden>
                    {i + 1}
                  </span>
                  <Icon className="matchmaker-invite__step-icon" aria-hidden />
                  <span className="matchmaker-invite__step-label">{step.label}</span>
                  <span className="matchmaker-invite__step-desc">{step.desc}</span>
                </div>
                {i < steps.length - 1 && (
                  <span className="matchmaker-invite__connector" aria-hidden>
                    <ArrowRight className="size-3.5" />
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        <Link href="/matchmaker" className="matchmaker-invite__cta tap-target group">
          <span className="matchmaker-invite__cta-inner">
            <Ship className="size-4 shrink-0" aria-hidden />
            <span>{m.cta}</span>
            <ArrowRight
              className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
          <span className="matchmaker-invite__cta-hint">
            {m.statQuestions ?? "3 questions"} · {m.statTime ?? "~2 min"}
          </span>
        </Link>
      </motion.div>
    </section>
  );
}
