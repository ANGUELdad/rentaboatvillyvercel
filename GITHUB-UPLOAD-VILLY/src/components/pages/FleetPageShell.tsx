"use client";

import { FleetCatalog } from "@/components/fleet/FleetCatalog";
import { FleetShowcase } from "@/components/fleet/FleetShowcase";
import type { PublicBoat } from "@/types";

export function FleetPageShell({ boats }: { boats: PublicBoat[] }) {
  return (
    <div className="fleet-page">
      <FleetShowcase boats={boats} variant="page" />
      <div className="fleet-page__body">
        <FleetCatalog boats={boats} showIntro={false} />
      </div>
    </div>
  );
}
