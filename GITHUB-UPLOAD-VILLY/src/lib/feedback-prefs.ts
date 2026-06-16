import { readConsentFromDocument } from "@/lib/cookie-utils";

const MUTE_KEY = "tbc-sfx-muted";

export function isFeedbackMuted(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return true;
  }
}

export function setFeedbackMuted(muted: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (muted) localStorage.setItem(MUTE_KEY, "1");
    else localStorage.removeItem(MUTE_KEY);
    window.dispatchEvent(new CustomEvent("tbc-feedback-mute-change"));
  } catch {
    /* ignore */
  }
}

export function canPlayFeedback(): boolean {
  if (typeof window === "undefined") return false;
  if (isFeedbackMuted()) return false;
  if (!readConsentFromDocument()) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}
