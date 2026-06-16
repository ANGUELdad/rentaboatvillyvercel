"use client";

import { motion } from "framer-motion";

export function HeroWaves() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] h-20 overflow-hidden opacity-70 sm:h-28 lg:h-32"
    >
      <motion.svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute bottom-0 h-full w-[200%] max-w-none -translate-x-1/4 text-black/55"
        animate={{ x: ["-25%", "-5%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        <path
          fill="currentColor"
          d="M0,64 C240,100 480,20 720,56 C960,92 1200,36 1440,72 L1440,120 L0,120 Z"
        />
      </motion.svg>
      <motion.svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute bottom-0 h-[70%] w-[200%] max-w-none text-brand-green/20"
        animate={{ x: ["-5%", "-25%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        <path
          fill="currentColor"
          d="M0,80 C360,40 720,100 1080,60 C1260,44 1380,72 1440,80 L1440,120 L0,120 Z"
        />
      </motion.svg>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ocean-950 to-transparent" />
    </div>
  );
}
