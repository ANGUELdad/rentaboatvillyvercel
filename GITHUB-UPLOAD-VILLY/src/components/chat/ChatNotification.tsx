"use client";

import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { VillyAvatar } from "@/components/chat/VillyAvatar";
import { playFeedback } from "@/lib/feedback";
import { appleSpring, appleSpringSnappy } from "@/lib/motion";
import { Z } from "@/lib/z-index";
import { cn } from "@/lib/utils";

const AUTO_DISMISS_MS = 14_000;

interface ChatNotificationProps {
  visible: boolean;
  title: string;
  timestamp: string;
  preview: string;
  tapToReply: string;
  dismissLabel?: string;
  onOpen: () => void;
  onDismiss: () => void;
  className?: string;
  mobile?: boolean;
}

export function ChatNotification({
  visible,
  title,
  timestamp,
  preview,
  tapToReply,
  dismissLabel = "Dismiss",
  onOpen,
  onDismiss,
  className,
  mobile = false,
}: ChatNotificationProps) {
  const reducedMotion = useReducedMotion();
  const dragY = useMotionValue(0);
  const dismissedRef = useRef(false);
  const dragControls = useDragControls();

  const handleDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    onDismiss();
  }, [onDismiss]);

  const handleOpen = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    playFeedback("open", "light");
    onOpen();
  }, [onOpen]);

  useEffect(() => {
    if (!visible) {
      dismissedRef.current = false;
      dragY.set(0);
      return;
    }

    const timer = window.setTimeout(handleDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [visible, handleDismiss, dragY]);

  if (!visible) return null;

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
      animate={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.99 }}
      transition={
        reducedMotion
          ? { duration: 0.22 }
          : { y: appleSpring, opacity: { duration: 0.28 } }
      }
      style={{ zIndex: Z.chatToast, y: dragY }}
      drag={!reducedMotion ? "y" : false}
      dragControls={dragControls}
      dragConstraints={{ top: 0, bottom: 80 }}
      dragElastic={0.1}
      onDragEnd={(_, info) => {
        if (info.offset.y > 40 || info.velocity.y > 320) handleDismiss();
        else animate(dragY, 0, appleSpringSnappy);
      }}
      className={cn(
        "panel-fit pointer-events-auto fixed max-w-[min(280px,calc(100%-2rem))]",
        mobile
          ? "inset-x-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:inset-x-auto sm:right-6"
          : "right-4 left-auto sm:right-6",
        !mobile && "bottom-[calc(1.5rem+3.5rem+0.65rem+env(safe-area-inset-bottom,0px))]",
        mobile && "sm:bottom-[calc(1.5rem+3.5rem+0.65rem+env(safe-area-inset-bottom,0px))]",
        className,
      )}
    >
      <div className="ai-chat-notification ai-notification-ios ai-notification-ios--quiet relative w-full max-w-full min-w-0 overflow-hidden rounded-xl text-left">
        <button
          type="button"
          data-sfx-skip
          onClick={handleOpen}
          className="absolute inset-0 z-0 cursor-pointer rounded-xl border-0 bg-transparent p-0"
          aria-label={`${title}. ${preview}`}
        />
        <div className="flex min-w-0 items-center gap-2.5 p-3">
          <VillyAvatar size="sm" showOnline className="shrink-0" />
          <div className="relative z-[1] min-w-0 flex-1">
            <div className="flex min-w-0 items-baseline justify-between gap-2">
              <p className="min-w-0 truncate text-[13px] font-semibold text-ds-text">
                {title}
              </p>
              <span className="shrink-0 text-[10px] tabular-nums text-ds-text-muted">
                {timestamp}
              </span>
            </div>
            <p className="mt-0.5 line-clamp-1 text-[12px] leading-snug text-ds-text-secondary">
              {preview}
            </p>
            <p className="mt-1 truncate text-[11px] text-ds-text-muted">{tapToReply}</p>
          </div>
          <button
            type="button"
            data-sfx-skip
            onClick={(e) => {
              e.stopPropagation();
              playFeedback("dismiss", "light");
              handleDismiss();
            }}
            className="tap-target relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-lg text-ds-text-muted hover:bg-ds-surface/60 hover:text-ds-text"
            aria-label={dismissLabel}
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
