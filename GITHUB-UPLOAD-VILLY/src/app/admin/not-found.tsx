import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
        <div className="mb-6 flex justify-center">
          <Logo linked={false} size="md" />
        </div>
        <p className="text-xs tracking-[0.2em] text-cyan-400/70 uppercase">404</p>
        <h1 className="mt-3 text-lg font-light text-white">Admin page not found</h1>
        <p className="mt-2 text-sm text-white/50">
          That panel route does not exist. Return to the dashboard or sign in again.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/admin"
            className="rounded-xl bg-cyan-500/20 px-6 py-3 text-sm text-cyan-200 hover:bg-cyan-500/30"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/login"
            className="rounded-xl border border-white/10 px-6 py-3 text-sm text-white/60 hover:text-white"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
