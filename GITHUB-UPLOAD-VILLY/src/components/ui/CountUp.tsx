"use client";

import { cn } from "@/lib/utils";
import { useCountUp, type UseCountUpOptions } from "@/hooks/useCountUp";

interface CountUpProps extends UseCountUpOptions {
  prefix?: string;
  suffix?: string;
  className?: string;
  as?: "span" | "p" | "strong";
}

export function CountUp({
  value,
  prefix = "",
  suffix = "",
  className,
  as: Tag = "span",
  ...opts
}: CountUpProps) {
  const { ref, formatted } = useCountUp({ value, ...opts });

  return (
    <Tag ref={ref as never} className={cn("tabular-nums", className)}>
      {prefix}
      {formatted}
      {suffix}
    </Tag>
  );
}
