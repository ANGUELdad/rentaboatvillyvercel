"use client";

import { useEffect } from "react";
import { RouteErrorContent } from "@/components/errors/RouteErrorContent";
import { SiteErrorChrome } from "@/components/errors/SiteErrorChrome";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <SiteErrorChrome>
      <RouteErrorContent reset={reset} />
    </SiteErrorChrome>
  );
}
