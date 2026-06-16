"use client";

import { type ReactNode, forwardRef, useImperativeHandle, useRef } from "react";
import { useHorizontalSnapScroll } from "@/hooks/useHorizontalSnapScroll";
import { cn } from "@/lib/utils";

type ScrollImageRowProps = {
  children: ReactNode;
  className?: string;
  onSnap?: (index: number) => void;
  snapFeedback?: boolean;
  fadeEdges?: boolean;
};

export const ScrollImageRow = forwardRef<HTMLDivElement, ScrollImageRowProps>(
  function ScrollImageRow(
    { children, className, onSnap, snapFeedback = false, fadeEdges = true },
    forwardedRef,
  ) {
    const innerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(forwardedRef, () => innerRef.current as HTMLDivElement);

    useHorizontalSnapScroll(innerRef, { onSnap, feedback: snapFeedback });

    return (
      <div className={cn(fadeEdges && "scroll-filmstrip-mask", "relative min-w-0 max-w-full w-full")}>
        <div
          ref={innerRef}
          className={cn("scroll-row scroll-row-snap", className)}
        >
          {children}
        </div>
      </div>
    );
  },
);
