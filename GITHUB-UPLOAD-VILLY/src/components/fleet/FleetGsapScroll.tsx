"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface FleetGsapScrollProps {
  children: ReactNode;
  enabled?: boolean;
}

export function FleetGsapScroll({
  children,
  enabled = true,
}: FleetGsapScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    let ctx: { revert: () => void } | undefined;

    (async () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduced) return;

      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>(".fleet-gsap-card");

        cards.forEach((card, index) => {
          gsap.fromTo(
            card,
            { y: 72, opacity: 0, scale: 0.9 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.85,
              ease: "power3.out",
              delay: index * 0.04,
              scrollTrigger: {
                trigger: card,
                start: "top 92%",
                toggleActions: "play none none reverse",
              },
            },
          );

          gsap.to(card, {
            y: -16,
            scale: 1.035,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.1,
            },
          });
        });
      }, ref);
    })();

    return () => ctx?.revert();
  }, [enabled]);

  return <div ref={ref}>{children}</div>;
}
