"use client";

import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getJson, putJson } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Boat } from "@/types";

function emptyBoat(): Boat {
  return {
    id: `boat-${Date.now()}`,
    name: "New Boat",
    pax: 4,
    hp: 30,
    pricePerHour: 20,
    currency: "€",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    description: "Description here",
    featured: false,
  };
}

export function FleetVisualEditor() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getJson<Boat[]>("/api/data/boats");
    if (result.ok && Array.isArray(result.data)) {
      setBoats(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateBoat = (id: string, patch: Partial<Boat>) => {
    setBoats((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
  };

  const save = async () => {
    const result = await putJson("/api/data/boats", boats);
    setStatus(result.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2000);
  };

  if (loading) {
    return <p className="text-sm text-white/40">Loading fleet…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">Fleet editor</h2>
          <p className="text-xs text-white/45">Edit boats visually — no JSON required.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setBoats((prev) => [...prev, emptyBoat()])}
          className="gap-2"
        >
          <Plus className="size-4" />
          Add boat
        </Button>
      </div>

      {boats.map((boat) => (
        <div
          key={boat.id}
          className="glass-panel space-y-3 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">{boat.name}</h3>
            <button
              type="button"
              onClick={() =>
                setBoats((prev) => prev.filter((b) => b.id !== boat.id))
              }
              className="text-red-300/70 hover:text-red-300"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-white/50 uppercase">Name</Label>
              <Input
                value={boat.name}
                onChange={(e) => updateBoat(boat.id, { name: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-white/50 uppercase">ID (slug)</Label>
              <Input
                value={boat.id}
                onChange={(e) => updateBoat(boat.id, { id: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-white/50 uppercase">Price / hour</Label>
              <Input
                type="number"
                value={boat.pricePerHour}
                onChange={(e) =>
                  updateBoat(boat.id, { pricePerHour: Number(e.target.value) })
                }
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-white/50 uppercase">Guests (pax)</Label>
              <Input
                type="number"
                value={boat.pax}
                onChange={(e) => updateBoat(boat.id, { pax: Number(e.target.value) })}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-[10px] text-white/50 uppercase">Image URL</Label>
              <Input
                value={boat.image}
                onChange={(e) => updateBoat(boat.id, { image: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-[10px] text-white/50 uppercase">Description</Label>
              <Textarea
                value={boat.description}
                onChange={(e) =>
                  updateBoat(boat.id, { description: e.target.value })
                }
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-white/60">
            <input
              type="checkbox"
              checked={boat.featured}
              onChange={(e) =>
                updateBoat(boat.id, { featured: e.target.checked })
              }
            />
            Featured on homepage
          </label>
        </div>
      ))}

      <Button type="button" onClick={save} className="glow-button text-white">
        {status === "saved" ? "Fleet saved ✓" : "Save fleet"}
      </Button>
    </div>
  );
}
