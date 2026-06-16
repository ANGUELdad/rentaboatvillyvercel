"use client";

import { MessageCircle } from "lucide-react";
import { VillyMarkIcon } from "@/components/brand/VillyMarkIcon";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { outer: "size-8", icon: "size-3.5", dot: "size-2.5 border-[1.5px]", img: 32, boat: "size-2" },
  md: { outer: "size-10", icon: "size-4", dot: "size-3 border-2", img: 40, boat: "size-2.5" },
  lg: { outer: "size-12", icon: "size-5", dot: "size-3 border-2", img: 48, boat: "size-3" },
  fab: { outer: "size-11 sm:size-12", icon: "size-5 sm:size-[22px]", dot: "size-2.5 border-[1.5px]", img: 44, boat: "size-2.5" },
} as const;

type VillyAvatarSize = keyof typeof SIZES;
type VillyAvatarVariant = "portrait" | "chat";

interface VillyAvatarProps {
  size?: VillyAvatarSize;
  variant?: VillyAvatarVariant;
  showOnline?: boolean;
  className?: string;
}

export function VillyAvatar({
  size = "md",
  variant = "portrait",
  showOnline = false,
  className,
}: VillyAvatarProps) {
  const s = SIZES[size];
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        variant === "chat"
          ? "bg-white shadow-sm ring-1 ring-brand-green/35"
          : "bg-gradient-to-br from-brand-green/30 to-brand-green/10 text-brand-green ring-1 ring-brand-green/25",
        s.outer,
        className,
      )}
    >
      {variant === "chat" ? (
        <MessageCircle
          className={cn("fill-brand-green/15 text-brand-green", s.icon)}
          strokeWidth={2.25}
        />
      ) : (
        <VillyMarkIcon className="villy-avatar__mark" />
      )}
      {showOnline && (
        <span
          className={cn(
            "ai-pulse-dot absolute -right-0.5 -bottom-0.5 rounded-full border-ocean-900 bg-brand-green",
            s.dot,
          )}
          aria-hidden
        />
      )}
    </span>
  );
}
