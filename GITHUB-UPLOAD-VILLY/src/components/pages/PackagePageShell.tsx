"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/providers/LanguageProvider";
import type { PublicBoat } from "@/types";

function PackageLoading() {
  const { t } = useI18n();
  const pkg = t.package ?? {};
  const builder = t.packageBuilder ?? {};
  const label = pkg.loading ?? builder.loading ?? "Loading rental prices…";

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-ds-text-muted">
      {label}
    </div>
  );
}

const PackageBuilder = dynamic(
  () =>
    import("@/components/package/PackageBuilder").then((m) => m.PackageBuilder),
  {
    ssr: false,
    loading: () => <PackageLoading />,
  },
);

export function PackagePageShell({ boats }: { boats: PublicBoat[] }) {
  const { t } = useI18n();
  const pkg = t.package ?? {};
  const builder = t.packageBuilder ?? {};

  return (
    <PageShell
      accent="gold"
      eyebrow={pkg.eyebrow ?? builder.eyebrow ?? "Boat rental"}
      title={pkg.title ?? builder.title ?? "Request pricing"}
      subtitle={pkg.subtitle ?? builder.subtitle}
    >
      <Suspense fallback={<PackageLoading />}>
        <PackageBuilder boats={boats} />
      </Suspense>
    </PageShell>
  );
}
