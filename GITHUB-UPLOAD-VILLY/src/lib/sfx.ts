import { canPlayFeedback } from "@/lib/feedback-prefs";

export type SfxName =
  | "tap"
  | "notify"
  | "success"
  | "open"
  | "select"
  | "dismiss"
  | "scroll-snap"
  | "navigate"
  | "hover"
  | "step"
  | "carousel"
  | "whoosh"
  | "error";

const SFX_NAMES: SfxName[] = [
  "tap",
  "notify",
  "success",
  "open",
  "select",
  "dismiss",
  "scroll-snap",
  "navigate",
  "hover",
  "step",
  "carousel",
  "whoosh",
  "error",
];

export function isSfxName(value: string): value is SfxName {
  return (SFX_NAMES as string[]).includes(value);
}

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!canPlayFeedback()) return null;
  if (!ctx) {
    const Ctx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  attack = 0.008,
  decay = 0.12,
) {
  const audio = getCtx();
  if (!audio) return;

  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, audio.currentTime);
  gain.gain.linearRampToValueAtTime(volume, audio.currentTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + decay);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime);
  osc.stop(audio.currentTime + duration);
}

function chime(frequencies: number[], volume: number) {
  frequencies.forEach((f, i) => {
    setTimeout(() => tone(f, 0.14, "sine", volume * 0.85, 0.006, 0.1), i * 55);
  });
}

const VOLUME = 0.055;

export function playSfx(name: SfxName) {
  if (!canPlayFeedback()) return;

  switch (name) {
    case "tap":
      tone(620, 0.055, "sine", VOLUME * 0.92, 0.005, 0.058);
      break;
    case "select":
      tone(880, 0.06, "sine", VOLUME, 0.004, 0.065);
      setTimeout(() => tone(1100, 0.045, "sine", VOLUME * 0.55, 0.003, 0.05), 28);
      break;
    case "dismiss":
      tone(680, 0.055, "sine", VOLUME * 0.72, 0.004, 0.055);
      break;
    case "scroll-snap":
      tone(920, 0.04, "sine", VOLUME * 0.6, 0.003, 0.042);
      break;
    case "open":
      tone(580, 0.085, "sine", VOLUME * 0.95, 0.006, 0.085);
      setTimeout(() => tone(880, 0.075, "sine", VOLUME * 0.75, 0.004, 0.075), 38);
      break;
    case "notify":
      chime([740, 932], VOLUME * 1.05);
      break;
    case "success":
      chime([494, 622, 784], VOLUME * 1.15);
      break;
    case "navigate":
      tone(380, 0.095, "sine", VOLUME * 0.42, 0.012, 0.11);
      setTimeout(() => tone(520, 0.075, "sine", VOLUME * 0.28, 0.006, 0.095), 32);
      break;
    case "whoosh":
      tone(260, 0.12, "sine", VOLUME * 0.38, 0.018, 0.14);
      setTimeout(() => tone(420, 0.1, "sine", VOLUME * 0.22, 0.01, 0.12), 42);
      setTimeout(() => tone(320, 0.08, "sine", VOLUME * 0.14, 0.005, 0.1), 78);
      break;
    case "step":
      tone(720, 0.065, "sine", VOLUME * 0.82, 0.005, 0.075);
      setTimeout(() => tone(920, 0.055, "sine", VOLUME * 0.62, 0.004, 0.065), 38);
      break;
    case "carousel":
      tone(680, 0.045, "sine", VOLUME * 0.48, 0.004, 0.05);
      break;
    case "hover":
      tone(1180, 0.03, "sine", VOLUME * 0.22, 0.003, 0.032);
      break;
    case "error":
      tone(320, 0.085, "triangle", VOLUME * 0.68, 0.006, 0.095);
      setTimeout(() => tone(260, 0.1, "triangle", VOLUME * 0.52, 0.005, 0.11), 52);
      break;
  }
}
