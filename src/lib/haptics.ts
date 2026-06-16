import { canPlayFeedback } from "@/lib/feedback-prefs";

function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  if (!canPlayFeedback()) return;

  const isMobile =
    window.matchMedia("(max-width: 639px)").matches ||
    window.matchMedia("(pointer: coarse)").matches;
  if (!isMobile) return;

  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}

export function tapLight() {
  vibrate(10);
}

export function tapMedium() {
  vibrate([15, 10, 15]);
}

export function hapticSuccess() {
  vibrate([12, 40, 20]);
}
