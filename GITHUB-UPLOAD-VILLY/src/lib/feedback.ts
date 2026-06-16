import { hapticSuccess, tapLight, tapMedium } from "@/lib/haptics";
import { playSfx, type SfxName } from "@/lib/sfx";

export function playFeedback(
  name: SfxName,
  haptic: "light" | "medium" | "success" | "none" = "light",
) {
  playSfx(name);
  if (haptic === "light") tapLight();
  else if (haptic === "medium") tapMedium();
  else if (haptic === "success") hapticSuccess();
}
