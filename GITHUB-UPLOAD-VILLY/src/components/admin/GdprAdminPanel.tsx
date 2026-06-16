"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { patchJson } from "@/lib/client-api";
import type { ConsentRecord, GdprRequest } from "@/types";

interface GdprAdminPanelProps {
  consents: ConsentRecord[];
  requests: GdprRequest[];
}

export function GdprAdminPanel({ consents, requests }: GdprAdminPanelProps) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const updateStatus = async (id: string, status: GdprRequest["status"]) => {
    setUpdatingId(id);
    setError("");
    const result = await patchJson(`/api/admin/gdpr/${id}`, { status });
    setUpdatingId(null);
    if (result.ok) {
      router.refresh();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs text-red-300">
          {error}
        </p>
      )}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="mb-4 text-sm tracking-[0.15em] text-white uppercase">
          GDPR Requests ({requests.length})
        </h2>
        {requests.length === 0 ? (
          <p className="text-xs text-white/40">No requests yet.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-white">{req.email}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] uppercase ${
                      req.status === "pending"
                        ? "bg-amber-400/20 text-amber-300"
                        : req.status === "completed"
                          ? "bg-emerald-400/20 text-emerald-300"
                          : "bg-red-400/20 text-red-300"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <p className="mt-1 text-white/50">
                  {req.requestType} · {new Date(req.createdAt).toLocaleDateString()}
                </p>
                {req.message && (
                  <p className="mt-2 text-white/35">{req.message}</p>
                )}
                {req.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={updatingId === req.id}
                      onClick={() => updateStatus(req.id, "completed")}
                      className="rounded-lg bg-emerald-500/20 px-3 py-1 text-[9px] text-emerald-300 uppercase hover:bg-emerald-500/30 disabled:opacity-50"
                    >
                      {updatingId === req.id ? "Saving…" : "Mark completed"}
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === req.id}
                      onClick={() => updateStatus(req.id, "rejected")}
                      className="rounded-lg bg-red-500/20 px-3 py-1 text-[9px] text-red-300 uppercase hover:bg-red-500/30 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <h2 className="mb-4 text-sm tracking-[0.15em] text-white uppercase">
          Cookie Consent Audit Log
        </h2>
        <p className="mb-4 text-xs text-white/40">
          IP addresses stored as SHA-256 hashes for GDPR compliance.
        </p>
        {consents.length === 0 ? (
          <p className="text-xs text-white/40">No consent logs yet.</p>
        ) : (
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {consents.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-[10px] text-white/50"
              >
                <span>{new Date(c.createdAt).toLocaleString()}</span>
                <span>
                  A:{c.analytics ? "✓" : "✗"} M:{c.marketing ? "✓" : "✗"}
                </span>
                <span className="font-mono text-white/30">
                  {c.ipHash ?? "no-ip"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
