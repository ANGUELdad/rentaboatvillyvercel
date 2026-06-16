"use client";

import { motion, useReducedMotion } from "framer-motion";

const orbs = [
  { size: 280, x: "12%", y: "18%", color: "bg-brand-green/15", delay: 0 },
  { size: 200, x: "78%", y: "22%", color: "bg-brand-orange/12", delay: 1.2 },
  { size: 160, x: "65%", y: "55%", color: "bg-summer-gold/10", delay: 0.6 },
];

export function HeroOrbs() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[4] overflow-hidden">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[48px] ${orb.color}`}
          style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y }}
          animate={{ y: [0, -18, 0], x: [0, i % 2 ? 12 : -12, 0], scale: [1, 1.08, 1] }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: orb.delay,
          }}
        />
      ))}
    </div>
  );
}
