"use client";

import { Clock, HelpCircle, Ship, Sparkles } from "lucide-react";
import { BoatMatchmaker } from "@/components/matchmaker/BoatMatchmaker";
import { MatchmakerAside } from "@/components/matchmaker/MatchmakerAside";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/providers/LanguageProvider";
import type { PublicBoat, MatchmakerData } from "@/types";

export function MatchmakerPageShell({
  boats,
  matchmaker,
}: {
  boats: PublicBoat[];
  matchmaker: MatchmakerData;
}) {
  const { t } = useI18n();
  const m = t.matchmaker;

  return (
    <PageShell
      accent="emerald"
      eyebrow={m.eyebrow}
      title={m.title}
      subtitle={m.subtitle}
      heroImages={boats.map((boat) => boat.image)}
      visualBadge="Match"
      visualBadgeIcon={Sparkles}
      stats={[
        {
          value: m.statBoats?.replace("{count}", String(boats.length)) ?? String(boats.length),
          label: m.fleetTitle ?? "From our fleet",
          icon: Ship,
        },
        {
          value: m.statQuestions ?? "3 questions",
          label: m.stepsTitle ?? "How it works",
          icon: HelpCircle,
        },
        {
          value: m.statTime ?? "~2 minutes",
          label: (m as typeof m & { statTimeLabel?: string }).statTimeLabel ?? "Takes only",
          icon: Clock,
        },
      ]}
    >
      <div className="matchmaker-studio__layout">
        <BoatMatchmaker matchmaker={matchmaker} boats={boats} embedded />
        <MatchmakerAside boats={boats} />
      </div>
    </PageShell>
  );
}
