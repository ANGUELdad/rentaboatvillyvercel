"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Minus, Send, Volume2, VolumeX, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChatNotification } from "@/components/chat/ChatNotification";
import {
  HumanContactDialog,
  type HumanContactLabels,
} from "@/components/chat/HumanContactDialog";
import { VillyAvatar } from "@/components/chat/VillyAvatar";
import {
  buildStartMenuGroups,
  extractChatMenuTree,
  getMenuNode,
  menuThinkingDelayMs,
  PRIMARY_START_OPTION_IDS,
  type ChatMenuOption,
  type ChatMenuTree,
  type StartMenuGroupId,
} from "@/lib/chat/concierge-menu";
import {
  buildConciergeContext,
  type LocalizedFaqEntry,
} from "@/lib/chat/concierge-context";
import {
  respondToMessage,
  thinkingDelayMs,
} from "@/lib/chat/concierge-brain";
import { generateSessionRef, pickMenuMessage } from "@/lib/chat/concierge-dynamic";
import { useMobileViewport } from "@/hooks/useMobileViewport";
import { useConsentResolved } from "@/hooks/useConsentResolved";
import { useSfx } from "@/hooks/useSfx";
import { playFeedback } from "@/lib/feedback";
import {
  onChatRequestOpen,
  setChatNotificationVisible,
  setChatOpenVisible,
} from "@/lib/floating-ui-events";
import { appleSpring, appleSpringSnappy, staggerStep } from "@/lib/motion";
import { Z } from "@/lib/z-index";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import type { Boat, FAQ } from "@/types";

type ChatMode = "fab" | "notification" | "open";

const INTRO_KEY = "tbc-chat-intro-seen";
const OPENED_KEY = "tbc-chat-opened";
const NOTIFICATION_DELAY_HOME_MS = 6_000;
const NOTIFICATION_DELAY_OTHER_MS = 8_000;
const NOTIFICATION_DELAY_AFTER_CONSENT_MS = 1_500;

const LINK_ONLY_NODES = new Set(["book-cta", "fleet-cta", "guide-cta", "map-cta", "package-cta"]);
const HUMAN_NODE_ID = "human";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  link?: { href: string; label: string };
  links?: { href: string; label: string }[];
  simulateTypewriter?: boolean;
}

interface ConciergeChatProps {
  menuTree: ChatMenuTree;
  locale: Locale;
  boats?: Boat[];
  faq?: FAQ[];
  localizedFaq?: LocalizedFaqEntry[];
  labels?: {
    title: string;
    subtitle: string;
    aiName?: string;
    aiTagline?: string;
    aiStatus?: string;
    typingLabel?: string;
    notificationPreview?: string;
    notificationTitle?: string;
    peekAction?: string;
    timestampNow?: string;
    tapToReply?: string;
    dismiss?: string;
    emptyTitle?: string;
    emptyHint?: string;
    pickTopic?: string;
    moreTopics?: string;
    fewerTopics?: string;
    menuGroups?: Partial<Record<StartMenuGroupId, string>>;
    quickActionsAria?: string;
    minimize?: string;
    close?: string;
    enableSounds?: string;
    muteSounds?: string;
    openAssistant?: string;
    sessionRefLabel?: string;
    placeholder?: string;
    send?: string;
    humanContact?: HumanContactLabels;
  };
  enabled?: boolean;
  isHome?: boolean;
  fabClassName?: string;
  panelClassName?: string;
}

function TypingIndicator({
  label,
  reducedMotion,
}: {
  label?: string;
  reducedMotion: boolean | null;
}) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={appleSpringSnappy}
      className="message-row message-row--ai flex w-full gap-2.5"
      aria-live="polite"
      aria-label={label ?? "Typing"}
    >
      <VillyAvatar size="sm" className="mt-0.5 shrink-0" />
      <div className="message-row__content min-w-0 max-w-[85%] space-y-1">
        {label ? (
          <p className="ai-typing-label pl-0.5 text-[10px] font-medium text-ds-text-muted">
            {label}
          </p>
        ) : null}
        <div className="ai-typing flex items-center gap-1.5 rounded-2xl rounded-tl-md px-4 py-3">
          <span className="size-2 rounded-full bg-brand-green/70" />
          <span className="size-2 rounded-full bg-brand-green/55 [animation-delay:150ms]" />
          <span className="size-2 rounded-full bg-brand-green/40 [animation-delay:300ms]" />
        </div>
      </div>
    </motion.div>
  );
}

function useTypewriterText(
  text: string,
  enabled: boolean,
  onTick?: () => void,
  onComplete?: () => void,
): string {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      onComplete?.();
      return;
    }

    setDisplayed("");
    let index = 0;
    let timer = 0;

    const tick = () => {
      index += 1;
      setDisplayed(text.slice(0, index));
      onTick?.();
      if (index < text.length) {
        timer = window.setTimeout(tick, 14 + Math.floor(Math.random() * 10));
        return;
      }
      onComplete?.();
    };

    timer = window.setTimeout(tick, 180);
    return () => window.clearTimeout(timer);
  }, [text, enabled, onTick, onComplete]);

  return displayed;
}

function AssistantBubble({
  msg,
  index,
  reducedMotion,
  onNavigate,
  onTypewriterTick,
  onTypewriterComplete,
}: {
  msg: Message;
  index: number;
  reducedMotion: boolean | null;
  onNavigate: () => void;
  onTypewriterTick?: () => void;
  onTypewriterComplete?: () => void;
}) {
  const simulate = Boolean(msg.simulateTypewriter && !reducedMotion);
  const displayedText = useTypewriterText(
    msg.text,
    simulate,
    onTypewriterTick,
    onTypewriterComplete,
  );
  const isTyping = simulate && displayedText.length < msg.text.length;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...appleSpringSnappy, delay: index * staggerStep }}
      className="message-row message-row--ai flex w-full gap-2.5"
    >
      <VillyAvatar size="sm" className="mt-0.5 shrink-0" />
      <div className="message-row__content min-w-0 max-w-[85%] space-y-1.5">
        <div
          className={cn(
            "chat-bubble bubble-ai ai-bubble-assistant card-text",
            isTyping && "ai-bubble-assistant--typing",
          )}
        >
          {displayedText}
          {isTyping ? (
            <span className="ai-bubble-caret" aria-hidden>
              |
            </span>
          ) : null}
        </div>
        {!isTyping ? (
          <p className="chat-bubble-timestamp pl-0.5">{msg.timestamp}</p>
        ) : null}
        {msg.links?.length ? (
          <div className="flex flex-wrap gap-2 pt-0.5">
            {msg.links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={onNavigate}
                className="ai-chat-action tap-target"
              >
                {l.label}
                <span aria-hidden> →</span>
              </Link>
            ))}
          </div>
        ) : msg.link ? (
          <Link href={msg.link.href} onClick={onNavigate} className="ai-chat-action tap-target">
            {msg.link.label}
            <span aria-hidden> →</span>
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}

function replyToMessage(
  msg: Omit<Message, "id" | "timestamp">,
  timestamp: string,
): Message {
  return { ...msg, id: `${Date.now()}-ai`, timestamp };
}

export function ConciergeChat({
  menuTree,
  locale,
  boats = [],
  faq = [],
  localizedFaq = [],
  labels = {
    title: "Rent A Boat Villy",
    subtitle: "Marina assistant",
    aiName: "Villy",
    aiTagline: "Boat rental · New Port of Limenaria",
    aiStatus: "Available · New Port of Limenaria",
    typingLabel: "Villy is typing…",
    notificationPreview: "Questions about boats, dates, or availability?",
    timestampNow: "Just now",
    tapToReply: "Tap to chat",
    dismiss: "Dismiss",
    emptyTitle: "Hello, I am Villy",
    emptyHint: "Please choose a quick reply below",
    pickTopic: "Quick replies",
    moreTopics: "More topics",
    fewerTopics: "Fewer topics",
    quickActionsAria: "Topics",
    minimize: "Minimize",
    close: "Close chat",
    enableSounds: "Enable sounds",
    muteSounds: "Mute sounds",
    openAssistant: "Chat with Villy",
    placeholder: "Ask about boats, beaches, booking…",
    send: "Send message",
  },
  enabled = true,
  isHome = false,
  fabClassName,
  panelClassName,
}: ConciergeChatProps) {
  const pathname = usePathname();
  const isMobileSheet = useMobileViewport();
  const [portalReady, setPortalReady] = useState(false);
  const consentResolved = useConsentResolved();
  const reducedMotion = useReducedMotion();
  const { muted, toggleMute } = useSfx();
  const [mode, setMode] = useState<ChatMode>("fab");
  const [introSeen, setIntroSeen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [menuOptions, setMenuOptions] = useState<ChatMenuOption[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState("start");
  const [thinking, setThinking] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [humanContactOpen, setHumanContactOpen] = useState(false);
  const [sessionRef, setSessionRef] = useState("");
  const [startMenuExpanded, setStartMenuExpanded] = useState(false);
  const [openGroupId, setOpenGroupId] = useState<StartMenuGroupId | null>(null);
  const [greetingTypingDone, setGreetingTypingDone] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathnameOnOpen = useRef<string | null>(null);
  const notificationShown = useRef(false);
  const sendingRef = useRef(false);
  const introTimerRef = useRef<number | null>(null);

  const context = useMemo(
    () => buildConciergeContext(boats, faq, localizedFaq),
    [boats, faq, localizedFaq],
  );

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }, [reducedMotion]);

  const closeChat = useCallback(() => {
    setHumanContactOpen(false);
    setMode("fab");
    playFeedback("dismiss", "light");
  }, []);

  const resetToStart = useCallback(() => {
    const nowLabel = labels.timestampNow ?? "Just now";
    const startNode = getMenuNode(menuTree, "start");

    if (!startNode?.options?.length) {
      setGreetingTypingDone(true);
      setMessages([
        {
          id: "start-greeting",
          role: "assistant",
          text:
            labels.emptyTitle ??
            "Hello, I am Villy. Please type your question about boats, booking, or the marina.",
          timestamp: nowLabel,
        },
      ]);
      setCurrentNodeId("start");
      setMenuOptions([]);
      setSuggestions([]);
      setThinking(false);
      return;
    }

    setGreetingTypingDone(reducedMotion === true);
    setMessages([
      {
        id: "start-greeting",
        role: "assistant",
        text: pickMenuMessage("start", locale, startNode.message),
        timestamp: nowLabel,
        simulateTypewriter: true,
      },
    ]);
    setCurrentNodeId("start");
    setMenuOptions(startNode.options ?? []);
    setSuggestions([]);
    setThinking(false);
  }, [menuTree, locale, labels.timestampNow, labels.emptyTitle, reducedMotion]);

  const openWithIntro = useCallback(() => {
    if (introTimerRef.current !== null) {
      window.clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }

    setThinking(true);
    setMessages([]);
    setMenuOptions([]);
    setSuggestions([]);
    setInputValue("");

    introTimerRef.current = window.setTimeout(() => {
      introTimerRef.current = null;
      resetToStart();
    }, 850 + Math.floor(Math.random() * 350));
  }, [resetToStart]);

  const pushAssistantNode = useCallback(
    (nodeId: string, resetHistory = false) => {
      const node = getMenuNode(menuTree, nodeId);
      if (!node) {
        setThinking(false);
        return;
      }

      const assistantMsg: Message = {
        id: `${Date.now()}-ai`,
        role: "assistant",
        text: pickMenuMessage(nodeId, locale, node.message),
        timestamp: labels.timestampNow ?? "Just now",
        link: node.link,
        links: node.links,
      };

      if (resetHistory || nodeId === "start") {
        setMessages([assistantMsg]);
      } else {
        setMessages((prev) => [...prev, assistantMsg]);
      }
      setCurrentNodeId(nodeId);
      setMenuOptions(node.options ?? []);
      setSuggestions([]);
      setThinking(false);

      if (LINK_ONLY_NODES.has(nodeId) && node.link) {
        /* link-only CTA — user taps in-bubble link to navigate + close */
      }
    },
    [menuTree, locale, labels.timestampNow],
  );

  const pushBrainReply = useCallback(
    (text: string) => {
      if (thinking || sendingRef.current) return;
      sendingRef.current = true;
      const nowLabel = labels.timestampNow ?? "Just now";

      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-user`, role: "user", text, timestamp: nowLabel },
      ]);
      setMenuOptions([]);
      setSuggestions([]);
      setThinking(true);
      playFeedback("tap", "light");

      window.setTimeout(() => {
        const reply = respondToMessage(text, locale, context);
        setMessages((prev) => [
          ...prev,
          replyToMessage(
            {
              role: "assistant",
              text: reply.text,
              link: reply.link,
              links: reply.links,
            },
            nowLabel,
          ),
        ]);
        setSuggestions(reply.suggestions ?? []);
        setThinking(false);
        sendingRef.current = false;
      }, thinkingDelayMs());
    },
    [thinking, locale, context, labels.timestampNow],
  );

  const selectOption = useCallback(
    (option: ChatMenuOption) => {
      if (thinking || sendingRef.current) return;
      sendingRef.current = true;
      const nowLabel = labels.timestampNow ?? "Just now";

      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-user`, role: "user", text: option.label, timestamp: nowLabel },
      ]);
      setMenuOptions([]);
      setSuggestions([]);
      setThinking(true);
      playFeedback("tap", "light");

      const resetHistory = option.next === "start";
      const nextNode = getMenuNode(menuTree, option.next);

      window.setTimeout(() => {
        if (option.next === HUMAN_NODE_ID) {
          const humanNode = getMenuNode(menuTree, HUMAN_NODE_ID);
          const assistantMsg: Message = {
            id: `${Date.now()}-ai`,
            role: "assistant",
            text:
              humanNode?.message ??
              labels.humanContact?.subtitle ??
              "Pick WhatsApp, Viber, or email to reach our marina team.",
            timestamp: nowLabel,
          };
          setMessages((prev) => [...prev, assistantMsg]);
          setCurrentNodeId(HUMAN_NODE_ID);
          setMenuOptions(humanNode?.options ?? []);
          setThinking(false);
          setHumanContactOpen(true);
          sendingRef.current = false;
          return;
        }

        if (!nextNode) {
          setThinking(false);
          sendingRef.current = false;
          return;
        }

        if (LINK_ONLY_NODES.has(option.next) && nextNode.link) {
          pushAssistantNode(option.next, resetHistory);
          sendingRef.current = false;
          return;
        }
        pushAssistantNode(option.next, resetHistory);
        sendingRef.current = false;
      }, menuThinkingDelayMs());
    },
    [thinking, pushAssistantNode, menuTree, labels.timestampNow, labels.humanContact],
  );

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || thinking || sendingRef.current) return;
    setInputValue("");
    pushBrainReply(trimmed);
  }, [inputValue, thinking, pushBrainReply]);

  useEffect(() => {
    setIntroSeen(!!sessionStorage.getItem(INTRO_KEY));
    setHasOpened(!!sessionStorage.getItem(OPENED_KEY));
    setStorageReady(true);
  }, []);

  const markIntroSeen = useCallback(() => {
    sessionStorage.setItem(INTRO_KEY, "1");
    setIntroSeen(true);
  }, []);

  const dismissNotification = useCallback(() => {
    markIntroSeen();
    setMode("fab");
    playFeedback("dismiss", "light");
  }, [markIntroSeen]);

  const openChat = useCallback(() => {
    markIntroSeen();
    sessionStorage.setItem(OPENED_KEY, "1");
    setHasOpened(true);
    setSessionRef(generateSessionRef());
    pathnameOnOpen.current = pathname;
    setMode("open");
    playFeedback("open", "medium");
  }, [markIntroSeen, pathname]);

  useEffect(() => {
    if (mode !== "open") return;
    openWithIntro();
  }, [mode, locale, openWithIntro]);

  useEffect(() => {
    return () => {
      if (introTimerRef.current !== null) {
        window.clearTimeout(introTimerRef.current);
        introTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return onChatRequestOpen(openChat);
  }, [openChat]);

  useEffect(() => {
    if (mode !== "open") return;
    if (pathnameOnOpen.current !== null && pathname !== pathnameOnOpen.current) {
      closeChat();
    }
  }, [pathname, mode, closeChat]);

  useEffect(() => {
    setChatNotificationVisible(mode === "notification");
    setChatOpenVisible(mode === "open");
    return () => {
      setChatNotificationVisible(false);
      setChatOpenVisible(false);
    };
  }, [mode]);

  useEffect(() => {
    if (!enabled || !storageReady || introSeen || notificationShown.current || !consentResolved) {
      return;
    }

    const showNotification = () => {
      if (notificationShown.current || introSeen) return;
      notificationShown.current = true;
      setMode("notification");
    };

    const baseDelay = isHome ? NOTIFICATION_DELAY_HOME_MS : NOTIFICATION_DELAY_OTHER_MS;
    const timer = window.setTimeout(showNotification, baseDelay + NOTIFICATION_DELAY_AFTER_CONSENT_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, storageReady, isHome, introSeen, consentResolved, isMobileSheet]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    setStartMenuExpanded(false);
    setOpenGroupId(null);
  }, [currentNodeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking, menuOptions, suggestions, startMenuExpanded, openGroupId, scrollToBottom]);

  const startMenuGroups =
    currentNodeId === "start" ? buildStartMenuGroups(menuOptions) : null;

  const primaryStartOptions = useMemo(() => {
    if (currentNodeId !== "start") return [];
    const byId = new Map(menuOptions.map((option) => [option.id, option]));
    return PRIMARY_START_OPTION_IDS.map((id) => byId.get(id)).filter(
      (option): option is ChatMenuOption => !!option,
    );
  }, [currentNodeId, menuOptions]);

  const secondaryStartGroups = useMemo(() => {
    if (!startMenuGroups) return null;
    const primaryIds = new Set<string>(PRIMARY_START_OPTION_IDS);
    return startMenuGroups
      .map((group) => ({
        ...group,
        options: group.options.filter((option) => !primaryIds.has(option.id)),
      }))
      .filter((group) => group.options.length > 0);
  }, [startMenuGroups]);

  useEffect(() => {
    if (mode !== "open" || !isMobileSheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mode, isMobileSheet]);

  useEffect(() => {
    if (mode !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeChat();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, closeChat]);

  const showFab = mode === "fab" || mode === "notification";
  const showFabBadge = showFab && !hasOpened;
  const handleGreetingTypewriterComplete = useCallback(() => {
    setGreetingTypingDone(true);
  }, []);

  const showPromptBar =
    mode === "open" && !thinking && greetingTypingDone && menuOptions.length > 0;
  const showSuggestions =
    mode === "open" && !thinking && suggestions.length > 0 && menuOptions.length === 0;
  let promptIndex = 0;

  if (!enabled) return null;

  return (
    <>
      <AnimatePresence>
        {mode === "notification" && (
          <ChatNotification
            visible
            mobile={isMobileSheet}
            title={labels.notificationTitle ?? labels.aiName ?? "Villy"}
            timestamp={labels.timestampNow ?? "now"}
            preview={labels.notificationPreview ?? "Questions about boats or booking?"}
            tapToReply={labels.peekAction ?? labels.tapToReply ?? "Tap to chat"}
            dismissLabel={labels.dismiss}
            onOpen={openChat}
            onDismiss={dismissNotification}
          />
        )}
      </AnimatePresence>

      {portalReady &&
        createPortal(
          <AnimatePresence>
            {mode === "open" && (
              <>
                <motion.div
                  key="ai-chat-scrim"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ai-chat-scrim fixed inset-0 touch-none"
                  style={{ zIndex: Z.chatScrim }}
                  onClick={closeChat}
                  onPointerDown={(e) => e.target === e.currentTarget && closeChat()}
                  aria-hidden
                />
                <motion.div
                  key="ai-chat-panel"
                  ref={panelRef}
                  initial={
                    isMobileSheet
                      ? { y: "100%" }
                      : reducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 16, scale: 0.98 }
                  }
                  animate={
                    isMobileSheet
                      ? { y: 0 }
                      : reducedMotion
                        ? { opacity: 1 }
                        : { opacity: 1, y: 0, scale: 1 }
                  }
                  exit={
                    isMobileSheet
                      ? { y: "100%" }
                      : reducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 12, scale: 0.98 }
                  }
                  transition={appleSpring}
                  style={{ zIndex: Z.chatPanel }}
                  className={cn(
                    "ai-chat-panel chat-application-wrapper fixed flex flex-col overflow-hidden",
                    isMobileSheet
                      ? "ai-chat-panel--sheet inset-x-0 bottom-0 top-auto h-auto w-full max-w-full rounded-t-[1.35rem] rounded-b-none border-b-0 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-16px_48px_rgba(0,17,51,0.18)]"
                      : "bottom-[max(6rem,calc(1.5rem+env(safe-area-inset-bottom,0px)))] right-[max(1.5rem,env(safe-area-inset-right,0px))] top-[max(4.5rem,env(safe-area-inset-top,0px))] left-auto h-auto w-[min(400px,calc(100vw-3rem-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px)))] max-w-[400px] min-h-0 rounded-2xl",
                    panelClassName,
                  )}
                  role="dialog"
                  aria-modal="true"
                  aria-label={labels.title}
                >
                  <header className="ai-chat-header flex shrink-0 flex-col border-b">
                    {isMobileSheet ? (
                      <button
                        type="button"
                        className="ai-chat-grabber tap-target"
                        onClick={closeChat}
                        aria-label={labels.close}
                        data-sfx-skip
                      />
                    ) : null}
                    <div className="flex min-w-0 items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
                      <VillyAvatar size="md" showOnline className="ai-chat-header-avatar shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="min-w-0 truncate text-sm font-semibold leading-snug text-ds-text">
                          {labels.aiName ?? "Villy"}
                        </p>
                        <p className="mt-0.5 min-w-0 truncate text-[11px] leading-snug text-ds-text-secondary">
                          {labels.aiTagline ?? "Boat rental · Limenaria"}
                        </p>
                        {sessionRef && !isMobileSheet ? (
                          <p className="mt-0.5 text-[10px] text-ds-text-muted">
                            {labels.sessionRefLabel ?? "Ref"} {sessionRef}
                          </p>
                        ) : null}
                      </div>
                      <div className="ai-chat-header__actions flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          onClick={toggleMute}
                          data-sfx-skip
                          className={cn(
                            "tap-target flex size-10 shrink-0 items-center justify-center rounded-lg text-ds-text-secondary hover:bg-ds-surface-hover hover:text-ds-text",
                            isMobileSheet && "hidden",
                          )}
                          aria-label={muted ? labels.enableSounds : labels.muteSounds}
                          aria-pressed={!muted}
                        >
                          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={closeChat}
                          data-sfx-skip
                          className="tap-target hidden size-10 shrink-0 items-center justify-center rounded-lg text-ds-text-secondary hover:bg-ds-surface-hover hover:text-ds-text sm:flex"
                          aria-label={labels.minimize}
                        >
                          <Minus className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={closeChat}
                          data-sfx-skip
                          className="tap-target flex size-11 shrink-0 items-center justify-center rounded-lg bg-ds-surface/80 text-ds-text hover:bg-ds-surface-hover"
                          aria-label={labels.close}
                        >
                          <X className="size-5" strokeWidth={2.25} />
                        </button>
                      </div>
                    </div>
                  </header>

              <div
                ref={scrollRef}
                className="message-feed ai-chat-body min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth"
                role="log"
                aria-live="polite"
                aria-relevant="additions"
              >
                {messages.map((msg, i) =>
                  msg.role === "user" ? (
                    <motion.div
                      key={msg.id}
                      initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ ...appleSpringSnappy, delay: i * staggerStep }}
                      className="message-row message-row--user flex w-full justify-end"
                    >
                      <div className="message-row__content message-row__content--user min-w-0 max-w-[85%] space-y-1">
                        <div className="chat-bubble bubble-user ai-bubble-user card-text">
                          {msg.text}
                        </div>
                        <p className="chat-bubble-timestamp chat-bubble-timestamp--user">
                          {msg.timestamp}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <AssistantBubble
                      key={msg.id}
                      msg={msg}
                      index={i}
                      reducedMotion={reducedMotion}
                      onNavigate={closeChat}
                      onTypewriterTick={scrollToBottom}
                      onTypewriterComplete={
                        msg.id === "start-greeting" ? handleGreetingTypewriterComplete : undefined
                      }
                    />
                  ),
                )}

                {thinking && (
                  <TypingIndicator label={labels.typingLabel} reducedMotion={reducedMotion} />
                )}
              </div>

              {showSuggestions && (
                <div className="ai-chat-chips ai-chat-chips--scroll shrink-0 border-t border-ds-border/60 px-3 py-2">
                  <p className="ai-chat-prompts__label mb-1.5">{labels.pickTopic}</p>
                  <div
                    className="ai-chat-prompts__grid ai-chat-prompts__grid--scroll"
                    role="group"
                    aria-label={labels.quickActionsAria}
                  >
                    {suggestions.slice(0, 6).map((suggestion, i) => (
                      <motion.button
                        key={`${suggestion}-${i}`}
                        type="button"
                        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...appleSpringSnappy, delay: i * staggerStep }}
                        onClick={() => pushBrainReply(suggestion)}
                        className="ai-chat-chip ai-chat-chip--pill ai-chat-prompt-btn tap-target"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {showPromptBar && (
                <div
                  className={cn(
                    "input-container input-container--compact ai-chat-prompts ai-chat-prompts--menu shrink-0 border-t border-ds-border/60",
                    startMenuExpanded && "ai-chat-prompts--expanded",
                  )}
                >
                  <div className="ai-chat-prompts__scroll">
                    <p className="ai-chat-prompts__label">
                      {labels.pickTopic ?? labels.quickActionsAria ?? "Choose a topic"}
                    </p>
                    {startMenuGroups ? (
                      <>
                        <div
                          className="ai-chat-prompts__grid ai-chat-prompts__grid--primary"
                          role="group"
                          aria-label={labels.quickActionsAria ?? "Topics"}
                        >
                          {primaryStartOptions.map((option, i) => {
                            const index = promptIndex;
                            promptIndex += 1;
                            return (
                              <motion.button
                                key={`${option.id}-${option.next}`}
                                type="button"
                                initial={
                                  reducedMotion ? false : { opacity: 0, y: 10, scale: 0.96 }
                                }
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                  ...appleSpringSnappy,
                                  delay: index * staggerStep,
                                }}
                                onClick={() => selectOption(option)}
                                className="ai-chat-prompt-btn ai-chat-chip ai-chat-chip--pill tap-target"
                              >
                                {option.label}
                              </motion.button>
                            );
                          })}
                        </div>

                        {secondaryStartGroups && secondaryStartGroups.length > 0 ? (
                          <>
                            <button
                              type="button"
                              className="ai-chat-prompt-btn ai-chat-prompt-btn--more tap-target"
                              aria-expanded={startMenuExpanded}
                              onClick={() => {
                                if (startMenuExpanded) {
                                  setStartMenuExpanded(false);
                                  setOpenGroupId(null);
                                  return;
                                }
                                setStartMenuExpanded(true);
                              }}
                            >
                              {startMenuExpanded
                                ? (labels.fewerTopics ?? "Fewer topics")
                                : (labels.moreTopics ?? "More topics")}
                            </button>

                            {startMenuExpanded ? (
                              <div
                                className="ai-chat-prompts__groups ai-chat-prompts__groups--accordion"
                                role="group"
                                aria-label={labels.quickActionsAria ?? "Topics"}
                              >
                                {secondaryStartGroups.map((group) => (
                                  <section key={group.id} className="ai-chat-prompts__group">
                                    <button
                                      type="button"
                                      id={`chat-group-${group.id}`}
                                      className="ai-chat-prompts__group-toggle tap-target"
                                      aria-expanded={openGroupId === group.id}
                                      aria-controls={`chat-group-panel-${group.id}`}
                                      onClick={() =>
                                        setOpenGroupId((current) =>
                                          current === group.id ? null : group.id,
                                        )
                                      }
                                    >
                                      <span>{labels.menuGroups?.[group.id] ?? group.id}</span>
                                      <ChevronDown
                                        className={cn(
                                          "ai-chat-prompts__group-chevron size-3.5 shrink-0",
                                          openGroupId === group.id && "is-open",
                                        )}
                                        aria-hidden
                                      />
                                    </button>
                                    {openGroupId === group.id ? (
                                      <div
                                        id={`chat-group-panel-${group.id}`}
                                        className="ai-chat-prompts__grid ai-chat-prompts__grid--nested"
                                      >
                                        {group.options.map((option) => {
                                          const index = promptIndex;
                                          promptIndex += 1;
                                          return (
                                            <motion.button
                                              key={`${option.id}-${option.next}`}
                                              type="button"
                                              initial={
                                                reducedMotion
                                                  ? false
                                                  : { opacity: 0, y: 8, scale: 0.98 }
                                              }
                                              animate={{ opacity: 1, y: 0, scale: 1 }}
                                              transition={{
                                                ...appleSpringSnappy,
                                                delay: index * staggerStep,
                                              }}
                                              onClick={() => selectOption(option)}
                                              className="ai-chat-prompt-btn ai-chat-chip ai-chat-chip--pill tap-target"
                                            >
                                              {option.label}
                                            </motion.button>
                                          );
                                        })}
                                      </div>
                                    ) : null}
                                  </section>
                                ))}
                              </div>
                            ) : null}
                          </>
                        ) : null}
                      </>
                    ) : (
                      <div
                        className="ai-chat-prompts__grid ai-chat-prompts__grid--two-col"
                        role="group"
                        aria-label={labels.quickActionsAria ?? "Topics"}
                      >
                        {menuOptions.map((option, i) => (
                          <motion.button
                            key={`${option.id}-${option.next}`}
                            type="button"
                            initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                              ...appleSpringSnappy,
                              delay: i * staggerStep,
                            }}
                            onClick={() => selectOption(option)}
                            className="ai-chat-prompt-btn ai-chat-chip ai-chat-chip--pill tap-target"
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="ai-input-wrap input-container shrink-0 border-t px-3 py-2.5">
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={labels.placeholder}
                    className="ai-chat-input min-h-11 min-w-0 flex-1 rounded-xl border-0 bg-transparent px-3 py-2 text-ds-text outline-none placeholder:text-ds-text-muted focus:ring-2 focus:ring-brand-green/30"
                    aria-label={labels.placeholder}
                    disabled={thinking}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || thinking}
                    className="tap-target flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-green text-white transition-opacity disabled:opacity-40"
                    aria-label={labels.send}
                  >
                    <Send className="size-4" />
                  </button>
                </form>
              </div>

              {labels.humanContact ? (
                <HumanContactDialog
                  open={humanContactOpen}
                  labels={labels.humanContact}
                  onClose={() => setHumanContactOpen(false)}
                  onChannelOpen={closeChat}
                />
              ) : null}
            </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}

      {showFab && (
        <motion.button
          type="button"
          data-sfx-skip
          onClick={openChat}
          initial={reducedMotion ? false : { scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={appleSpringSnappy}
          style={{ zIndex: Z.chatFab }}
          className={cn(
            "ai-chat-fab tap-target fixed flex items-center justify-center overflow-visible rounded-full p-0 active:scale-95",
            showFabBadge && "ai-fab-badge--hint",
            fabClassName,
          )}
          aria-label={
            showFabBadge ? `${labels.openAssistant}, new message` : labels.openAssistant
          }
        >
          <VillyAvatar size="fab" variant="chat" showOnline />
          {showFabBadge && <span className="ai-fab-badge" aria-hidden />}
        </motion.button>
      )}
    </>
  );
}

export { extractChatMenuTree };
