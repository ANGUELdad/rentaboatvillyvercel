"use client";

import dynamic from "next/dynamic";

const PackageBuilderPrompt = dynamic(
  () =>
    import("@/components/package/PackageBuilderPrompt").then((m) => ({
      default: m.PackageBuilderPrompt,
    })),
  { ssr: false },
);

export function PackageBuilderPromptWrapper() {
  return <PackageBuilderPrompt />;
}
