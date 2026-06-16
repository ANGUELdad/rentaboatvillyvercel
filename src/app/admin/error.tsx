"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/layout/Logo";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[admin-error]", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
        <div className="mb-6 flex justify-center">
          <Logo linked={false} size="md" />
        </div>
        <p className="text-xs tracking-[0.2em] text-red-400/80 uppercase">
          Admin error
        </p>
        <h1 className="mt-3 text-lg font-light text-white">Panel failed to load</h1>
        <p className="mt-2 max-w-md text-sm text-white/50">
          Database or configuration issue. Check server logs and environment
          variables.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-cyan-500/20 px-6 py-3 text-sm text-cyan-200 hover:bg-cyan-500/30"
          >
            Retry
          </button>
          <Link
            href="/admin/login"
            className="rounded-xl border border-white/10 px-6 py-3 text-sm text-white/60 hover:text-white"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
