"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getJson, putJson } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NavData, NavItem } from "@/types";

const LABEL_KEYS = [
  "fleet",
  "routes",
  "guide",
  "experiences",
  "reviews",
  "blog",
  "booking",
  "faq",
] as const;

export function MenuEditor() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getJson<NavData>("/api/data/nav");
    if (result.ok && Array.isArray(result.data.items)) {
      setItems(result.data.items);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    const result = await putJson("/api/data/nav", { items });
    setStatus(result.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2000);
  };

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = items.findIndex((i) => i.id === dragId);
    const to = items.findIndex((i) => i.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setDragId(null);
  };

  const addItem = () => {
    const id = `nav-${Date.now()}`;
    setItems([
      ...items,
      {
        id,
        href: "/",
        labelKey: "fleet",
        enabled: true,
      },
    ]);
  };

  if (loading) {
    return <p className="text-sm text-white/40">Loading menu…</p>;
  }

  return (
    <div className="glass-panel space-y-4 rounded-2xl p-6">
      <div>
        <h2 className="text-lg font-medium text-white">Site menu</h2>
        <p className="mt-1 text-xs text-white/45">
          Drag to reorder. Toggle visibility without touching code.
        </p>
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            draggable
            onDragStart={() => setDragId(item.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(item.id)}
            className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:flex-nowrap"
          >
            <GripVertical className="size-4 shrink-0 cursor-grab text-white/30" />
            <Input
              value={item.href}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id ? { ...i, href: e.target.value } : i,
                  ),
                )
              }
              className="min-w-[120px] flex-1 border-white/10 bg-black/20 text-sm text-white"
              placeholder="/path"
            />
            <select
              value={item.labelKey}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id ? { ...i, labelKey: e.target.value } : i,
                  ),
                )
              }
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            >
              {LABEL_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((i) =>
                      i.id === item.id ? { ...i, enabled: e.target.checked } : i,
                    ),
                  )
                }
              />
              Show
            </label>
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
              className="rounded-lg p-2 text-red-300/70 hover:bg-red-400/10"
              aria-label="Remove item"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={addItem} className="gap-2">
          <Plus className="size-4" />
          Add link
        </Button>
        <Button type="button" onClick={save} className="glow-button text-white">
          {status === "saved" ? "Saved ✓" : "Save menu"}
        </Button>
      </div>
    </div>
  );
}
