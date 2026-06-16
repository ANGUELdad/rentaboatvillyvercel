"use client";

import { useCallback, useEffect, useState } from "react";
import { getJson, putJson } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface JsonEditorProps {
  file: "boats" | "faq" | "legal" | "offers";
  title: string;
}

export function JsonEditor({ file, title }: JsonEditorProps) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const result = await getJson<unknown>(`/api/data/${file}`);
    if (result.ok) {
      setContent(JSON.stringify(result.data, null, 2));
    } else {
      setLoadError(result.error);
      setContent("");
    }
    setLoading(false);
  }, [file]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setSaveError("");
    try {
      const parsed: unknown = JSON.parse(content);
      const result = await putJson(`/api/data/${file}`, parsed);
      if (result.ok) {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        setStatus("error");
        setSaveError(result.error);
      }
    } catch {
      setStatus("error");
      setSaveError("Invalid JSON syntax — check brackets and commas.");
    }
  };

  if (loading) {
    return <p className="text-sm text-white/40">Loading {title}…</p>;
  }

  if (loadError) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <p className="text-sm text-red-400">Failed to load {title}: {loadError}</p>
        <Button
          type="button"
          onClick={() => void load()}
          className="mt-4 bg-white/10 text-white hover:bg-white/15"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-[0.15em] text-white uppercase">
          {title}
        </h2>
        <Button
          type="button"
          onClick={handleSave}
          className="bg-cyan-500/20 text-xs text-cyan-200 hover:bg-cyan-500/30"
        >
          Save
        </Button>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[320px] border-white/10 bg-black/30 font-mono text-xs text-white/80"
      />
      {status === "saved" && (
        <p className="mt-2 text-xs text-emerald-400">Saved successfully.</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">
          {saveError || "Save failed. Check JSON syntax and schema."}
        </p>
      )}
    </div>
  );
}
