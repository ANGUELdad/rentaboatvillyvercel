"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Mail, MessageCircle, Phone, X } from "lucide-react";
import { buildHumanContactChannels } from "@/lib/contact-links";
import { playFeedback } from "@/lib/feedback";
import { appleSpringSnappy } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface HumanContactLabels {
  title: string;
  subtitle: string;
  whatsapp: string;
  viber: string;
  email: string;
  close: string;
  prefill?: string;
  emailSubject?: string;
}

interface HumanContactDialogProps {
  open: boolean;
  labels: HumanContactLabels;
  onClose: () => void;
  onChannelOpen?: () => void;
}

function ChannelButton({
  href,
  external,
  className,
  children,
  onOpen,
}: {
  href: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
  onOpen?: () => void;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={() => {
        playFeedback("navigate", "medium");
        onOpen?.();
      }}
      className={cn("human-contact-dialog__channel tap-target", className)}
    >
      {children}
    </a>
  );
}

export function HumanContactDialog({
  open,
  labels,
  onClose,
  onChannelOpen,
}: HumanContactDialogProps) {
  const reducedMotion = useReducedMotion();
  const channels = buildHumanContactChannels(labels.prefill, labels.emailSubject);

  const whatsapp = channels.filter((c) => c.id.startsWith("whatsapp"));
  const viber = channels.filter((c) => c.id.startsWith("viber"));
  const email = channels.find((c) => c.id === "email");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="human-contact-dialog__scrim"
          role="presentation"
          onClick={onClose}
        >
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            transition={appleSpringSnappy}
            role="dialog"
            aria-modal="true"
            aria-labelledby="human-contact-title"
            className="human-contact-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="human-contact-dialog__head">
              <div className="min-w-0 flex-1">
                <h3 id="human-contact-title" className="human-contact-dialog__title">
                  {labels.title}
                </h3>
                <p className="human-contact-dialog__subtitle">{labels.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                data-sfx-skip
                className="human-contact-dialog__close tap-target"
                aria-label={labels.close}
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div className="human-contact-dialog__sections">
              <section className="human-contact-dialog__section">
                <p className="human-contact-dialog__section-label">
                  <MessageCircle className="size-3.5 text-[#25D366]" aria-hidden />
                  {labels.whatsapp}
                </p>
                <div className="human-contact-dialog__list">
                  {whatsapp.map((channel) => (
                    <ChannelButton
                      key={channel.id}
                      href={channel.href}
                      external={channel.external}
                      className="human-contact-dialog__channel--whatsapp"
                      onOpen={onChannelOpen}
                    >
                      <Phone className="size-4 shrink-0 opacity-80" aria-hidden />
                      <span>{channel.label}</span>
                    </ChannelButton>
                  ))}
                </div>
              </section>

              <section className="human-contact-dialog__section">
                <p className="human-contact-dialog__section-label">
                  <MessageCircle className="size-3.5 text-[#7360F2]" aria-hidden />
                  {labels.viber}
                </p>
                <div className="human-contact-dialog__list">
                  {viber.map((channel) => (
                    <ChannelButton
                      key={channel.id}
                      href={channel.href}
                      external={channel.external}
                      className="human-contact-dialog__channel--viber"
                      onOpen={onChannelOpen}
                    >
                      <Phone className="size-4 shrink-0 opacity-80" aria-hidden />
                      <span>{channel.label}</span>
                    </ChannelButton>
                  ))}
                </div>
              </section>

              {email ? (
                <section className="human-contact-dialog__section">
                  <p className="human-contact-dialog__section-label">
                    <Mail className="size-3.5 text-summer-coral" aria-hidden />
                    {labels.email}
                  </p>
                  <div className="human-contact-dialog__list">
                    <ChannelButton
                      href={email.href}
                      className="human-contact-dialog__channel--email"
                      onOpen={onChannelOpen}
                    >
                      <Mail className="size-4 shrink-0 opacity-80" aria-hidden />
                      <span className="truncate">{email.label}</span>
                    </ChannelButton>
                  </div>
                </section>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
