"use client";

import { ArrowUpRight, Bookmark, Users } from "lucide-react";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import type { PublicBoat } from "@/types";

interface YachtListCardProps {
  boat: PublicBoat;
  index?: number;
}

export function YachtListCard({ boat }: YachtListCardProps) {
  return (
    <Link href={`/fleet/${boat.id}`} className="app-card group flex gap-4 p-3 sm:p-4">
      <div className="relative size-[88px] shrink-0 overflow-hidden rounded-2xl sm:size-[104px]">
        <SafeImage
          src={boat.image}
          alt={boat.name}
          fill
          sizes="104px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-ocean-950/55 text-white/70 backdrop-blur-sm">
          <Bookmark className="size-3.5" />
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="truncate text-sm font-semibold text-ds-text sm:text-base">
            {boat.name}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ds-text-secondary">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3 text-app-teal" />
              {boat.pax} guests
            </span>
          </p>
        </div>

        <div className="mt-2 flex items-end justify-end gap-2">
          <span className="text-[11px] font-medium text-app-teal">
            Request booking
          </span>
        </div>
      </div>

      <ArrowUpRight className="size-4 shrink-0 self-center text-ds-text-muted transition-colors group-hover:text-app-teal" />
    </Link>
  );
}
