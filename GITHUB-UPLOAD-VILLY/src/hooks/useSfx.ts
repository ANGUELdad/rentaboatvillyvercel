"use client";

import { useCallback } from "react";
import { playFeedback } from "@/lib/feedback";
import { isFeedbackMuted, setFeedbackMuted } from "@/lib/feedback-prefs";
import { playSfx, type SfxName } from "@/lib/sfx";
import { useSyncExternalStore } from "react";

function subscribeMute(onChange: () => void) {
  window.addEventListener("tbc-feedback-mute-change", onChange);
  return () => window.removeEventListener("tbc-feedback-mute-change", onChange);
}

function getMuteSnapshot() {
  return isFeedbackMuted();
}

export function useSfx() {
  const muted = useSyncExternalStore(subscribeMute, getMuteSnapshot, () => true);

  const play = useCallback((name: SfxName) => playSfx(name), []);
  const feedback = useCallback(
    (
      name: SfxName,
      haptic: "light" | "medium" | "success" | "none" = "light",
    ) => playFeedback(name, haptic),
    [],
  );
  const toggleMute = useCallback(() => setFeedbackMuted(!isFeedbackMuted()), []);

  return { play, feedback, muted, toggleMute, setMuted: setFeedbackMuted };
}
