"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  BOUTIQUE_COLORS,
  colorLabel,
  colorStyle,
  normalizeHex,
} from "@/lib/boutique-colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ColorPalettePicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [customHex, setCustomHex] = useState("#4A0E2E");
  const [customText, setCustomText] = useState("#4A0E2E");

  const selected = value.map((v) => normalizeHex(v) || v);

  function togglePreset(hex: string) {
    const h = hex.toUpperCase();
    if (selected.map((s) => s.toUpperCase()).includes(h)) {
      onChange(selected.filter((s) => s.toUpperCase() !== h));
    } else {
      onChange([...selected, h]);
    }
  }

  function addCustom() {
    const h = normalizeHex(customText) || normalizeHex(customHex);
    if (!h) {
      toast.error("Enter a valid hex colour like #4A0E2E");
      return;
    }
    if (selected.map((s) => s.toUpperCase()).includes(h)) {
      toast.message("Colour already selected");
      return;
    }
    onChange([...selected, h]);
    toast.success(`Added ${colorLabel(h)}`);
  }

  function remove(hex: string) {
    onChange(selected.filter((s) => s.toUpperCase() !== hex.toUpperCase()));
  }

  return (
    <div className="md:col-span-2 rounded-3xl border border-line bg-cream/40 p-4 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Dress colours
        </p>
        <p className="mt-1 text-xs text-muted">
          Tap boutique swatches or add an exact fabric hex. These show as circles
          on the product page.
        </p>
      </div>

<div className="grid grid-cols-7 sm:grid-cols-7 md:grid-cols-[repeat(14,minmax(0,1fr))] gap-2">
        {BOUTIQUE_COLORS.map((c) => {
          const active = selected
            .map((s) => s.toUpperCase())
            .includes(c.hex.toUpperCase());
          return (
            <button
              key={c.hex}
              type="button"
              title={c.name}
              onClick={() => togglePreset(c.hex)}
              className={cn(
                "relative h-9 w-9 rounded-full border-2 transition hover:scale-105",
                active ? "border-wine ring-2 ring-gold/50 scale-105" : "border-white shadow"
              )}
              style={{ background: c.hex }}
              aria-label={c.name}
              aria-pressed={active}
            >
              {active && (
                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-wine text-[9px] text-cream">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <label className="text-xs text-muted flex items-center gap-2">
          <span>Custom</span>
          <input
            type="color"
            value={normalizeHex(customHex) || "#4A0E2E"}
            onChange={(e) => {
              setCustomHex(e.target.value.toUpperCase());
              setCustomText(e.target.value.toUpperCase());
            }}
            className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-white p-1"
          />
        </label>
        <Input
          className="max-w-[140px] font-mono text-xs"
          value={customText}
          onChange={(e) => setCustomText(e.target.value.toUpperCase())}
          placeholder="#4A0E2E"
        />
        <Button type="button" variant="outline" size="sm" onClick={addCustom}>
          <Plus size={14} /> Add colour
        </Button>
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => remove(c)}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white pl-1.5 pr-2.5 py-1 text-xs text-wine hover:border-danger/40"
              title="Remove colour"
            >
              <span
                className="h-5 w-5 rounded-full border border-black/10"
                style={{ background: colorStyle(c) }}
              />
              {colorLabel(c)}
              <X size={12} className="text-muted" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-danger">Select at least one colour for the dress.</p>
      )}
    </div>
  );
}
