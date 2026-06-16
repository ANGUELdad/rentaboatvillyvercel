"use client";

import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { Card3D } from "@/components/ui/Card3D";
import { SafeImage } from "./SafeImage";
import type { PublicBoat } from "@/types";

interface BoatCardProps {
  boat: PublicBoat;
  index?: number;
  size?: "default" | "large" | "compact";
  /** GSAP ScrollTrigger handles reveal + float when true */
  gsapReveal?: boolean;
}

const SIZES = {
  compact: { w: "w-[min(68vw,240px)]", h: "h-[220px]" },
  default: { w: "w-[min(78vw,300px)]", h: "h-[320px]" },
  large: { w: "w-[min(85vw,380px)]", h: "h-[400px]" },
};

export function BoatCard({
  boat,
  index = 0,
  size = "default",
  gsapReveal = false,
}: BoatCardProps) {
  const s = SIZES[size];
  const isCompact = size === "compact";
  const showAmenities = !isCompact && (boat.amenities?.length ?? 0) > 0;

  const card = (
    <article
      className={`group glass-card relative overflow-hidden rounded-2xl border border-white/10 transition-shadow duration-300 hover:border-summer-turquoise/30 ${s.h} ${isCompact ? "" : "hover:shadow-[0_20px_50px_rgba(46,232,214,0.15)]"}`}
    >
      <div className="absolute inset-0">
        <SafeImage
          src={boat.image}
          alt={boat.name}
          fill
          sizes={isCompact ? "240px" : size === "large" ? "380px" : "300px"}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-ocean-950/50 to-transparent" />
      </div>

      {boat.tagline && !isCompact && (
        <span className="absolute top-3 left-3 rounded-lg border border-summer-gold/30 bg-ocean-950/70 px-2 py-1 text-[8px] tracking-[0.2em] text-summer-gold uppercase backdrop-blur-md">
          {boat.tagline}
        </span>
      )}

      <div className={`absolute inset-x-0 bottom-0 ${isCompact ? "p-3" : "p-4"}`}>
        <h3
          className={`font-medium tracking-[0.1em] text-white uppercase ${
            isCompact ? "text-xs" : size === "large" ? "text-base" : "text-sm"
          }`}
        >
          {boat.name}
        </h3>
        <div className={`flex items-center gap-2 text-white/50 ${isCompact ? "mt-0.5 text-[9px]" : "mt-1 text-[10px]"}`}>
          <span className="flex items-center gap-0.5">
            <Users className={isCompact ? "size-2.5" : "size-3"} />
            {boat.pax} guests
          </span>
        </div>

        {showAmenities && (
          <div className="mt-2 flex flex-wrap gap-1">
            {boat.amenities!.slice(0, 2).map((a) => (
              <span
                key={a.id}
                className="rounded-md bg-white/8 px-1.5 py-0.5 text-[8px] text-white/55"
              >
                ✓ {a.label}
              </span>
            ))}
          </div>
        )}

        <div className={`flex items-center justify-between ${isCompact ? "mt-1.5" : "mt-3"}`}>
          {!isCompact && (
            <span className="flex items-center gap-1 text-[9px] tracking-[0.15em] text-white/50 uppercase opacity-0 transition-opacity group-hover:opacity-100">
              Details <ArrowRight className="size-3" />
            </span>
          )}
        </div>
      </div>
    </article>
  );

  return (
    <motion.div
      initial={gsapReveal ? false : { opacity: 0, y: 24 }}
      whileInView={gsapReveal ? undefined : { opacity: 1, y: 0 }}
      viewport={gsapReveal ? undefined : { once: true }}
      transition={
        gsapReveal ? undefined : { delay: index * 0.06, duration: 0.4 }
      }
      className={`shrink-0 ${s.w} ${gsapReveal ? "fleet-gsap-card" : ""}`}
    >
      <Link href={`/fleet/${boat.id}`} className="block">
        {isCompact ? card : <Card3D intensity={size === "large" ? 10 : 8}>{card}</Card3D>}
      </Link>
    </motion.div>
  );
}
