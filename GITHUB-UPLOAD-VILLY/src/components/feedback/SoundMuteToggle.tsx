"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSfx } from "@/hooks/useSfx";
import { useI18n } from "@/providers/LanguageProvider";

export function SoundMuteToggle({ className = "" }: { className?: string }) {
  const { muted, toggleMute } = useSfx();
  const { t } = useI18n();
  const label =
    (t.common as Record<string, string> | undefined)?.soundEffects ??
    (muted ? "Enable UI sounds" : "Mute UI sounds");

  return (
    <button
      type="button"
      data-sfx-skip
      onClick={toggleMute}
      className={`tap-target inline-flex min-h-[40px] items-center gap-2 rounded-lg px-2 text-sm text-ds-text-secondary transition-colors hover:bg-ds-surface/40 hover:text-ds-text ${className}`}
      aria-label={label}
      aria-pressed={!muted}
    >
      {muted ? <VolumeX className="size-4 shrink-0" /> : <Volume2 className="size-4 shrink-0" />}
      <span>{muted ? "Sounds off" : "Sounds on"}</span>
    </button>
  );
}
