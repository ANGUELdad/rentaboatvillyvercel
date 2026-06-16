"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { appleSpringSnappy } from "@/lib/motion";
import { cn } from "@/lib/utils";

type MotionPressProps = HTMLMotionProps<"div"> & {
  hoverScale?: number;
  tapScale?: number;
};

export function MotionPress({
  children,
  className,
  hoverScale = 1.02,
  tapScale = 0.97,
  ...props
}: MotionPressProps) {
  return (
    <motion.div
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      transition={appleSpringSnappy}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
