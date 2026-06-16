"use client";

import { ArrowRight, Clock, HelpCircle, Lock, MapPin, Receipt, Ship, Sparkles } from "lucide-react";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { useI18n } from "@/providers/LanguageProvider";
import type { PublicBoat } from "@/types";

const STEP_ICONS = [HelpCircle, Sparkles, Ship] as const;
const TRUST_ICONS = [Lock, MapPin, Receipt] as const;

export function MatchmakerAside({ boats }: { boats: PublicBoat[] }) {
  const { t } = useI18n();
  const m = t.matchmaker;
  const preview = boats.slice(0, 4);

  const steps = [
    { label: m.step1Label, desc: m.step1Desc },
    { label: m.step2Label, desc: m.step2Desc },
    { label: m.step3Label, desc: m.step3Desc },
  ];
  const trust = m as typeof m & {
    trustEyebrow?: string;
    trustSecureTitle?: string;
    trustSecureDesc?: string;
    trustLocalTitle?: string;
    trustLocalDesc?: string;
    trustPriceTitle?: string;
    trustPriceDesc?: string;
  };
  const trustItems = [
    {
      title: trust.trustSecureTitle ?? "No payment now",
      desc: trust.trustSecureDesc ?? "Secure request — you pay at the marina",
    },
    {
      title: trust.trustLocalTitle ?? "Local Limenaria team",
      desc: trust.trustLocalDesc ?? "Family-run at the marina pier",
    },
    {
      title: trust.trustPriceTitle ?? "Safety briefing included",
      desc: trust.trustPriceDesc ?? trust.trustSecureDesc ?? "Safety briefing on every departure",
    },
  ];

  return (
    <aside className="matchmaker-studio__aside" aria-label={m.stepsTitle}>
      <div className="matchmaker-studio__aside-card glass-panel">
        <p className="ui-eyebrow section-eyebrow mb-3 text-ds-brand">{m.stepsTitle}</p>
        <ol className="matchmaker-studio__steps">
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[i] ?? HelpCircle;
            return (
              <li key={step.label} className="matchmaker-studio__step">
                <span className="matchmaker-studio__step-icon" aria-hidden>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="matchmaker-studio__step-label">
                    <span className="matchmaker-studio__step-num">{i + 1}</span>
                    {step.label}
                  </p>
                  <p className="matchmaker-studio__step-desc">{step.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="matchmaker-studio__time-hint">
          <Clock className="size-3.5 shrink-0 text-ds-brand" aria-hidden />
          {m.statTime}
        </p>
      </div>

      {preview.length > 0 && (
        <div className="matchmaker-studio__aside-card glass-panel">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="ui-eyebrow section-eyebrow mb-0 text-ds-brand">{m.fleetTitle}</p>
            <Link
              href="/fleet"
              className="inline-flex items-center gap-1 text-xs font-semibold text-ds-brand hover:text-ds-text"
            >
              {m.fleetLink}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <ul className="matchmaker-studio__fleet-grid">
            {preview.map((boat) => (
              <li key={boat.id}>
                <Link
                  href={`/fleet/${boat.id}`}
                  className="matchmaker-studio__fleet-card"
                >
                  <span className="matchmaker-studio__fleet-media">
                    <SafeImage
                      src={boat.image}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </span>
                  <span className="matchmaker-studio__fleet-meta">
                    <span className="matchmaker-studio__fleet-name">{boat.name}</span>
                    <span className="matchmaker-studio__fleet-price">
                      {boat.pax} pax
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="matchmaker-studio__aside-card glass-panel">
        <p className="ui-eyebrow section-eyebrow mb-3 text-ds-brand">
          {trust.trustEyebrow ?? "Book with confidence"}
        </p>
        <ul className="matchmaker-studio__trust">
          {trustItems.map((item, i) => {
            const Icon = TRUST_ICONS[i] ?? Lock;
            return (
              <li key={item.title} className="matchmaker-studio__trust-item">
                <span className="matchmaker-studio__step-icon" aria-hidden>
                  <Icon className="size-4" strokeWidth={2.25} />
                </span>
                <div className="min-w-0">
                  <p className="matchmaker-studio__trust-title">{item.title}</p>
                  <p className="matchmaker-studio__trust-desc">{item.desc}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
