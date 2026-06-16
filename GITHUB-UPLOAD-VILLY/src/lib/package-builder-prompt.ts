const DISMISS_KEY = "tbc-pb-prompt-dismissed-at";
const SESSION_COUNT_KEY = "tbc-pb-prompt-session-count";

export const PB_PROMPT_MIN_DELAY_MS = 45_000;
export const PB_PROMPT_MAX_DELAY_MS = 180_000;
export const PB_PROMPT_DISMISS_MS = 24 * 60 * 60 * 1000;
export const PB_PROMPT_MAX_SESSION_SHOWS = 2;

function isBoatDetailPath(pathname: string) {
  return pathname.startsWith("/fleet/") && pathname !== "/fleet";
}

/** Package-builder promo disabled — no price calculator popups anywhere. */
export function isPackageBuilderPromptEligible(_pathname: string): boolean {
  return false;
}

/** Pages with a fixed bottom action bar — raise prompt above it on mobile */
export function packageBuilderPromptHasStickyBar(pathname: string): boolean {
  return isBoatDetailPath(pathname);
}

export function randomPromptDelayMs(): number {
  return (
    PB_PROMPT_MIN_DELAY_MS +
    Math.floor(Math.random() * (PB_PROMPT_MAX_DELAY_MS - PB_PROMPT_MIN_DELAY_MS))
  );
}

export function isPackageBuilderPromptDismissed(): boolean {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (!Number.isFinite(dismissedAt)) return false;
  return Date.now() - dismissedAt < PB_PROMPT_DISMISS_MS;
}

export function getPackageBuilderPromptSessionShows(): number {
  if (typeof window === "undefined") return PB_PROMPT_MAX_SESSION_SHOWS;
  const raw = sessionStorage.getItem(SESSION_COUNT_KEY);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function recordPackageBuilderPromptShown(): void {
  if (typeof window === "undefined") return;
  const next = getPackageBuilderPromptSessionShows() + 1;
  sessionStorage.setItem(SESSION_COUNT_KEY, String(next));
}

export function dismissPackageBuilderPrompt(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISMISS_KEY, String(Date.now()));
}

export function canShowPackageBuilderPrompt(): boolean {
  if (isPackageBuilderPromptDismissed()) return false;
  return getPackageBuilderPromptSessionShows() < PB_PROMPT_MAX_SESSION_SHOWS;
}
