"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getJson, putJson } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GalleryData, GalleryItem } from "@/types";

export function GalleryEditor() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getJson<GalleryData>("/api/data/gallery");
    if (result.ok && Array.isArray(result.data.items)) {
      setItems(result.data.items);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    const result = await putJson("/api/data/gallery", { items });
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

  if (loading) return <p className="text-sm text-white/40">Loading gallery…</p>;

  return (
    <div className="glass-panel space-y-4 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">Gallery</h2>
          <p className="text-xs text-white/45">Drag to reorder homepage gallery items.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setItems([
              ...items,
              {
                id: `gal-${Date.now()}`,
                type: "image",
                aspect: "16:9",
                src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
                alt: "New image",
                caption: "Caption",
              },
            ])
          }
          className="gap-2"
        >
          <Plus className="size-4" />
          Add item
        </Button>
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            draggable
            onDragStart={() => setDragId(item.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(item.id)}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <GripVertical className="size-4 cursor-grab text-white/30" />
              <span className="text-sm text-white/70">{item.id}</span>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                className="ml-auto text-red-300/70"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                value={item.src}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((i) =>
                      i.id === item.id ? { ...i, src: e.target.value } : i,
                    ),
                  )
                }
                placeholder="Image or video URL"
                className="border-white/10 bg-black/20 text-white sm:col-span-2"
              />
              <Input
                value={item.alt}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((i) =>
                      i.id === item.id ? { ...i, alt: e.target.value } : i,
                    ),
                  )
                }
                placeholder="Alt text"
                className="border-white/10 bg-black/20 text-white"
              />
              <Input
                value={item.caption ?? ""}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((i) =>
                      i.id === item.id ? { ...i, caption: e.target.value } : i,
                    ),
                  )
                }
                placeholder="Caption"
                className="border-white/10 bg-black/20 text-white"
              />
              <select
                value={item.type}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((i) =>
                      i.id === item.id
                        ? { ...i, type: e.target.value as GalleryItem["type"] }
                        : i,
                    ),
                  )
                }
                className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <select
                value={item.aspect}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((i) =>
                      i.id === item.id
                        ? { ...i, aspect: e.target.value as GalleryItem["aspect"] }
                        : i,
                    ),
                  )
                }
                className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
              >
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
              </select>
            </div>
          </li>
        ))}
      </ul>

      <Button type="button" onClick={save} className="glow-button text-white">
        {status === "saved" ? "Gallery saved ✓" : "Save gallery"}
      </Button>
    </div>
  );
}
