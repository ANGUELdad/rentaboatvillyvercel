"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { postJson } from "@/lib/client-api";
import { Logo } from "@/components/layout/Logo";
import { HoneypotField } from "@/components/security/HoneypotField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [hp, setHp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError("");

    try {
      const result = await postJson("/api/admin/login", { password, _hp: hp });

      if (result.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(
          result.status === 503
            ? "Server not configured — contact administrator"
            : result.status === 429
              ? "Too many attempts — wait and try again"
              : "Invalid password",
        );
      }
    } catch {
      setError("Connection failed — try again");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ocean-950 px-6">
      <form
        onSubmit={handleSubmit}
        className="relative glass-panel w-full max-w-sm rounded-2xl p-8"
      >
        <HoneypotField value={hp} onChange={setHp} />
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <Logo linked={false} size="lg" />
          <h1 className="text-sm font-medium tracking-[0.15em] text-white uppercase">
            Admin Access
          </h1>
        </div>

        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 border-white/10 bg-white/5 text-white placeholder:text-white/30"
        />

        {error && (
          <p className="mb-4 text-xs text-red-400">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30"
        >
          {loading ? "Authenticating…" : "Enter"}
        </Button>
      </form>
    </div>
  );
}
