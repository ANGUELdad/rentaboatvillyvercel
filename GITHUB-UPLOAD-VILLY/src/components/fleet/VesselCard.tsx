"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { SafeImage } from "@/components/SafeImage";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/LanguageProvider";
import type { PublicBoat } from "@/types";

interface VesselCardProps {
  boat: PublicBoat;
  featured?: boolean;
  showPricing?: boolean;
  className?: string;
}

export function VesselCard({
  boat,
  featured = false,
  showPricing = false,
  className,
}: VesselCardProps) {
  const { t } = useI18n();
  const c = t.conversion?.fleet ?? {};
  const sourceFields = useMemo(
    () => ({
      name: boat.name,
      tagline: boat.tagline ?? "",
      description: boat.longDescription ?? boat.description ?? "",
    }),
    [boat.name, boat.tagline, boat.longDescription, boat.description],
  );
  const localized = useTranslatedContent(sourceFields, "card_desc");
  const guests =
    c.guestsCount?.replace("{count}", String(boat.pax)) ??
    `${boat.pax} guests`;

  const metaParts = [guests].filter(Boolean);

  const metaLine = metaParts.join(" · ");

  return (
    <article className={cn("vessel-card", className)}>
      <Link
        href={`/fleet/${boat.id}`}
        className="vessel-card__link tap-target group"
      >
        <div className="vessel-card__media">
          <SafeImage
            src={boat.image}
            alt={localized.name}
            fill
            sizes="(max-width: 639px) 120px, (max-width: 1023px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {(boat.featured || featured) && (
            <span className="vessel-card__badge">
              {c.mostPopular ?? "Popular"}
            </span>
          )}
        </div>

        <div className="vessel-card__content">
          <div className="vessel-card__copy">
            <h3 className="vessel-card__name">{localized.name}</h3>
            {localized.tagline && (
              <p className="vessel-card__tagline">{localized.tagline}</p>
            )}
            {localized.description && (
              <p className="vessel-card__description">{localized.description}</p>
            )}
            <p className="vessel-card__meta">{metaLine}</p>
            <div className="vessel-card__chips" aria-hidden>
              {metaParts.map((part) => (
                <span key={part}>{part}</span>
              ))}
            </div>
          </div>

        </div>
      </Link>

      <Link
        href={`/package?boat=${boat.id}`}
        className="vessel-card__book btn-app-primary ui-btn-label tap-target"
      >
        {t.packageBuilder?.requestCta ?? t.package?.cta ?? t.hero.cta}
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </article>
  );
}
