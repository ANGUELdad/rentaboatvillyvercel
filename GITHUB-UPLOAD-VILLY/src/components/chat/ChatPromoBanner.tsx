"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { VillyAvatar } from "@/components/chat/VillyAvatar";
import { useI18n } from "@/providers/LanguageProvider";
import { requestOpenChat } from "@/lib/floating-ui-events";
import { playFeedback } from "@/lib/feedback";
import { appleSpringSnappy, appleSpringSoft, homeScrollViewport } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ChatAdStep = "idle" | "user" | "typing" | "reply" | "followUp" | "done";

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function PromoReveal({
  className,
  delay = 0,
  children,
  reducedMotion,
}: {
  className?: string;
  delay?: number;
  children: ReactNode;
  reducedMotion: boolean | null;
}) {
  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={homeScrollViewport}
      transition={{ ...appleSpringSoft, delay }}
    >
      {children}
    </motion.div>
  );
}

function TypingBubble({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={appleSpringSnappy}
      className="chat-promo-banner__bubble chat-promo-banner__bubble--assistant chat-promo-banner__bubble--typing"
      aria-hidden
    >
      <span className="sr-only">{label}</span>
      <span className="chat-promo-banner__typing-dots" aria-hidden>
        <span />
        <span />
        <span />
      </span>
    </motion.div>
  );
}

function useTypewriterText(text: string, enabled: boolean, speedMs = 22) {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);

  useEffect(() => {
    if (!enabled) {
      const timer = window.setTimeout(() => setDisplayed(text), 0);
      return () => window.clearTimeout(timer);
    }

    let index = 0;
    let timer = 0;
    const resetTimer = window.setTimeout(() => setDisplayed(""), 0);

    const tick = () => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index < text.length) {
        timer = window.setTimeout(tick, speedMs);
      }
    };

    timer = window.setTimeout(tick, 140);
    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(timer);
    };
  }, [enabled, speedMs, text]);

  return displayed;
}

function TypewriterBubble({
  text,
  active,
  soft = false,
}: {
  text: string;
  active: boolean;
  soft?: boolean;
}) {
  const displayed = useTypewriterText(text, active, soft ? 18 : 20);
  const writing = active && displayed.length < text.length;

  return (
    <div
      className={cn(
        "chat-promo-banner__bubble chat-promo-banner__bubble--assistant chat-promo-banner__bubble--writing",
        soft && "chat-promo-banner__bubble--soft",
        writing && "is-writing",
      )}
    >
      {displayed || "\u00a0"}
      {writing ? <span className="chat-promo-banner__caret" aria-hidden /> : null}
    </div>
  );
}

export function ChatPromoBanner({ className }: { className?: string }) {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState<ChatAdStep>(reducedMotion ? "done" : "idle");
  const banner = t.chat.banner;

  const title = asString(banner?.title, "Not sure which boat to pick?");
  const subline = asString(
    banner?.body,
    "Instant help comparing boats, fuel policy, and routes from New Port of Limenaria.",
  );
  const badge = asString(banner?.badge, "AI-powered");
  const userPrompt = asString(
    banner?.userPrompt,
    "Which boat fits 6 guests from Limenaria?",
  );
  const reply = asString(
    banner?.reply,
    "For 6 guests I would suggest Nikos or Nikoleta — 8 seats, safety briefing included.",
  );
  const followUp = asString(
    banner?.followUp,
    "I can also check availability for your dates.",
  );
  const typing = asString(banner?.typing, "Villy is typing…");
  const cta = asString(banner?.cta, "Chat with Villy");

  useEffect(() => {
    if (reducedMotion) {
      const timer = window.setTimeout(() => setStep("done"), 0);
      return () => window.clearTimeout(timer);
    }

    let cycleTimer = 0;
    let timers: number[] = [];

    const runCycle = () => {
      setStep("idle");
      timers = [
        window.setTimeout(() => setStep("user"), 300),
        window.setTimeout(() => setStep("typing"), 1_050),
        window.setTimeout(() => setStep("reply"), 2_050),
        window.setTimeout(() => setStep("followUp"), 4_850),
        window.setTimeout(() => setStep("done"), 6_600),
      ];
      cycleTimer = window.setTimeout(runCycle, 9_200);
    };

    runCycle();

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(cycleTimer);
    };
  }, [reducedMotion]);

  const openChat = useCallback(() => {
    playFeedback("tap", "light");
    requestOpenChat();
  }, []);

  const showUser = step !== "idle";
  const showTyping = step === "typing";
  const showReply = step === "reply" || step === "followUp" || step === "done";
  const showFollowUp = step === "followUp" || step === "done";
  const replyTyping = step === "reply";
  const followUpTyping = step === "followUp";

  const Root = reducedMotion ? "aside" : motion.aside;
  const rootProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24, scale: 0.98 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: homeScrollViewport,
        transition: appleSpringSoft,
      };

  return (
    <Root
      className={cn("chat-promo-banner chat-promo-banner--ad", className)}
      aria-label={title}
      {...rootProps}
    >
      <span className="chat-promo-banner__shimmer" aria-hidden />
      <span className="chat-promo-banner__glow" aria-hidden />
      <span className="chat-promo-banner__accent" aria-hidden />

      <PromoReveal className="chat-promo-banner__header" delay={0.06} reducedMotion={reducedMotion}>
        <VillyAvatar size="sm" showOnline className="chat-promo-banner__avatar shrink-0" />
        <div className="chat-promo-banner__identity min-w-0 flex-1">
          <p className="chat-promo-banner__title">{title}</p>
          <p className="chat-promo-banner__body">{subline}</p>
          <div className="chat-promo-banner__meta">
            <span className="chat-promo-banner__name">Villy</span>
            <span className="chat-promo-banner__badge">
              <Sparkles className="size-3 shrink-0" aria-hidden />
              {badge}
            </span>
          </div>
        </div>
      </PromoReveal>

      <PromoReveal
        className="chat-promo-banner__thread"
        delay={0.12}
        reducedMotion={reducedMotion}
      >
        <AnimatePresence mode="popLayout">
          {showUser ? (
            <motion.div
              key="user"
              initial={reducedMotion ? false : { opacity: 0, x: 12, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ ...appleSpringSnappy, delay: 0 }}
              className="chat-promo-banner__row chat-promo-banner__row--user"
            >
              <div className="chat-promo-banner__bubble chat-promo-banner__bubble--user">
                {userPrompt}
              </div>
            </motion.div>
          ) : null}

          {showTyping ? (
            <motion.div
              key="typing"
              className="chat-promo-banner__row chat-promo-banner__row--assistant"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TypingBubble label={typing} />
            </motion.div>
          ) : null}

          {showReply ? (
            <motion.div
              key="reply"
              initial={reducedMotion ? false : { opacity: 0, x: -12, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ ...appleSpringSnappy, delay: 0 }}
              className="chat-promo-banner__row chat-promo-banner__row--assistant"
            >
              <TypewriterBubble text={reply} active={replyTyping} />
            </motion.div>
          ) : null}

          {showFollowUp ? (
            <motion.div
              key="follow-up"
              initial={reducedMotion ? false : { opacity: 0, x: -12, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ ...appleSpringSnappy, delay: 0.06 }}
              className="chat-promo-banner__row chat-promo-banner__row--assistant"
            >
              <TypewriterBubble text={followUp} active={followUpTyping} soft />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </PromoReveal>

      <PromoReveal delay={0.18} reducedMotion={reducedMotion}>
        <button
          type="button"
          onClick={openChat}
          className={cn(
            "chat-promo-banner__cta tap-target",
            step === "done" && "chat-promo-banner__cta--pulse",
          )}
        >
          <MessageCircle className="size-4 shrink-0" aria-hidden />
          {cta}
        </button>
      </PromoReveal>
    </Root>
  );
}
