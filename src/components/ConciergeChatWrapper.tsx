"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { ConciergeChat, extractChatMenuTree } from "./ConciergeChat";
import type { HumanContactLabels } from "@/components/chat/HumanContactDialog";
import { getEnglishDictionary } from "@/lib/i18n/dictionary";
import type { ChatMenuTree } from "@/lib/chat/concierge-menu";
import { useI18n } from "@/providers/LanguageProvider";
import type { Boat, FAQ } from "@/types";
import type { LocalizedFaqEntry } from "@/lib/chat/concierge-context";

function isBoatDetailPath(pathname: string) {
  return pathname.startsWith("/fleet/") && pathname !== "/fleet";
}

function hasMobileStickyBar(pathname: string) {
  return pathname === "/map" || isBoatDetailPath(pathname);
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function asHumanContactLabels(value: unknown): HumanContactLabels | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const title = asString(record.title, "");
  const subtitle = asString(record.subtitle, "");
  if (!title && !subtitle) return undefined;
  return {
    title: title || "Talk to our team",
    subtitle: subtitle || "Choose WhatsApp, Viber, or email.",
    whatsapp: asString(record.whatsapp, "WhatsApp"),
    viber: asString(record.viber, "Viber"),
    email: asString(record.email, "Email"),
    close: asString(record.close, "Close"),
    prefill: asString(record.prefill, ""),
    emailSubject: asString(record.emailSubject, ""),
  };
}

function asMenuGroupLabels(
  value: unknown,
): Partial<Record<"bookBoat" | "ourBoats" | "goodToKnow" | "contact", string>> {
  if (!value || typeof value !== "object") return {};
  const record = value as Record<string, unknown>;
  return {
    bookBoat: asString(record.bookBoat, "Book a boat"),
    ourBoats: asString(record.ourBoats, "Our boats"),
    goodToKnow: asString(record.goodToKnow, "Good to know"),
    contact: asString(record.contact, "Contact"),
  };
}

function extractLocalizedFaq(faqSection: unknown): LocalizedFaqEntry[] {
  if (!faqSection || typeof faqSection !== "object") return [];
  const items = (faqSection as { items?: unknown }).items;
  if (!Array.isArray(items)) return [];
  return items
    .filter((item): item is { q: string; a: string } => {
      return !!item && typeof item === "object" && "q" in item && "a" in item;
    })
    .map((item) => ({ q: String(item.q), a: String(item.a) }));
}

function buildLocalizedMenuTree(
  chat: Record<string, unknown>,
  linkLabels: Parameters<typeof extractChatMenuTree>[1],
): ChatMenuTree {
  const tree = extractChatMenuTree(chat, linkLabels);
  if (tree.start?.options?.length) return tree;

  const englishChat = getEnglishDictionary().chat as Record<string, unknown>;
  return extractChatMenuTree(englishChat, linkLabels);
}

interface ConciergeChatWrapperProps {
  boats: Boat[];
  faq: FAQ[];
}

export function ConciergeChatWrapper({ boats, faq }: ConciergeChatWrapperProps) {
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const c = t.chat;
  const onBoatDetail = isBoatDetailPath(pathname);
  const stickyBarPage = hasMobileStickyBar(pathname);
  const isHome = pathname === "/";

  const localizedFaq = useMemo(() => extractLocalizedFaq(t.faq), [t.faq]);

  const menuTree = useMemo(
    () =>
      buildLocalizedMenuTree(c as Record<string, unknown>, {
        linkBook: asString(c.linkBook, "Open booking"),
        linkFleet: asString(c.linkFleet, "Browse fleet"),
        linkGuide: asString(c.linkGuide, "Island guide"),
        linkMap: asString(c.linkMap, "Open map"),
        linkPackage: asString(c.linkPackage, "Browse fleet"),
      }),
    [c],
  );

  return (
    <ConciergeChat
      menuTree={menuTree}
      locale={locale}
      boats={boats}
      faq={faq}
      localizedFaq={localizedFaq}
      labels={{
        title: asString(c.subtitle, "Rent A Boat Villy"),
        subtitle: asString(c.title, "Marina assistant"),
        aiName: asString(c.aiName, "Villy"),
        aiTagline: asString(c.aiTagline, "Boat rental · New Port of Limenaria"),
        aiStatus: asString(c.aiStatus, "Available · New Port of Limenaria"),
        typingLabel: asString(c.typingLabel, "Villy is typing…"),
        notificationPreview: asString(
          c.notificationPreview,
          "Questions about boats, dates, or availability?",
        ),
        notificationTitle: asString(c.notificationTitle, "Villy · Marina assistant"),
        peekAction: asString(c.peekAction, "Tap to chat"),
        timestampNow: asString(c.timestampNow, "now"),
        tapToReply: asString(c.tapToReply, "Tap to chat"),
        dismiss: asString(c.dismiss, "Dismiss"),
        emptyTitle: asString(c.emptyTitle, "Hello, I am Villy"),
        emptyHint: asString(c.emptyHint, "Please choose a quick reply below"),
        pickTopic: asString(c.pickTopic, "Quick replies"),
        moreTopics: asString(c.moreTopics, "More topics"),
        fewerTopics: asString(c.fewerTopics, "Fewer topics"),
        menuGroups: asMenuGroupLabels(c.menuGroups),
        quickActionsAria: asString(c.quickActionsAria, "Topics"),
        minimize: asString(c.minimize, "Minimize"),
        close: asString(c.close, "Close chat"),
        enableSounds: asString(c.enableSounds, "Enable sounds"),
        muteSounds: asString(c.muteSounds, "Mute sounds"),
        openAssistant: asString(c.openAssistant, "Chat with Villy"),
        sessionRefLabel: asString(c.sessionRefLabel, "Ref"),
        placeholder: asString(c.placeholder, "Ask about boats, beaches, booking…"),
        send: asString(c.send, "Send message"),
        humanContact: asHumanContactLabels(c.humanContact),
      }}
      enabled
      isHome={isHome && !onBoatDetail}
      fabClassName={stickyBarPage ? "ai-chat-fab--raised" : undefined}
      panelClassName={
        stickyBarPage
          ? "max-lg:bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] max-lg:max-h-[min(68dvh,calc(100dvh-5.5rem-1rem-env(safe-area-inset-top,0px)))] lg:bottom-24"
          : undefined
      }
    />
  );
}
