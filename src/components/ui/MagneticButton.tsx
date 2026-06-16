"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  magnetic?: boolean;
} & Omit<ComponentPropsWithoutRef<"button">, "children"> &
  Omit<ComponentPropsWithoutRef<typeof Link>, "children">;

export function MagneticButton({
  children,
  className,
  href,
  magnetic = true,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const coarsePointer = useCoarsePointer();
  const enableMagnetic = magnetic && !reduceMotion && !coarsePointer;

  const handleMove = (e: React.MouseEvent) => {
    if (!enableMagnetic || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
  };

  const handleLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "";
  };

  const classes = cn("cta-magnetic inline-flex", className);

  const inner = (
    <motion.div
      ref={ref}
      className={classes}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      {children}
    </motion.div>
  );

  if (href) {
    const { href: _hrefDup, ...linkProps } = rest as ComponentPropsWithoutRef<
      typeof Link
    >;
    return (
      <Link href={href} {...linkProps}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" {...(rest as ComponentPropsWithoutRef<"button">)}>
      {inner}
    </button>
  );
}
