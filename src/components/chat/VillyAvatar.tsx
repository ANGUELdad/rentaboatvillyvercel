"use client";

import { cn } from "@/lib/utils";

const LOGO_SRC = "/brand/villy-logo.svg";

const SIZES = {
  sm: { outer: "size-8", logo: "size-[62%]", dot: "size-2.5 border-[1.5px]", img: 32 },
  md: { outer: "size-10", logo: "size-[62%]", dot: "size-3 border-2", img: 40 },
  lg: { outer: "size-12", logo: "size-[62%]", dot: "size-3 border-2", img: 48 },
  fab: { outer: "size-11 sm:size-12", logo: "size-[62%]", dot: "size-2.5 border-[1.5px]", img: 44 },
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
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm",
        variant === "chat"
          ? "ring-1 ring-brand-green/35"
          : "ring-1 ring-brand-green/25",
        s.outer,
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG brand mark */}
      <img
        src={LOGO_SRC}
        alt=""
        width={s.img}
        height={s.img}
        className={cn("villy-avatar__mark object-contain", s.logo)}
        decoding="async"
      />
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
