"use client";

import { type CSSProperties, type ReactNode } from "react";
import { useScrollParallax } from "@/hooks/useScrollParallax";
import { cn } from "@/lib/utils";

type ParallaxLayerProps = {
  children: ReactNode;
  className?: string;
  intensity?: number;
  style?: CSSProperties;
};

export function ParallaxLayer({
  children,
  className,
  intensity = 0.1,
  style,
}: ParallaxLayerProps) {
  const { ref, style: parallaxStyle } = useScrollParallax<HTMLDivElement>({
    intensity,
  });

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{ ...parallaxStyle, ...style }}
    >
      {children}
    </div>
  );
}
