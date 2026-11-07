"use client";

import React, { useState } from "react";

export interface VariantGroup {
  name: string; // e.g. "Size", "Color"
  options: string[]; // e.g. ["S", "M", "L"]
}

export interface VariantPickerProps {
  variants: VariantGroup[];
  onSelect?: (selected: Record<string, string>) => void;
}

export function VariantPicker({ variants, onSelect }: VariantPickerProps) {
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const v of variants) {
      if (v.options.length > 0) {
        initial[v.name] = v.options[0];
      }
    }
    return initial;
  });

  const handleSelect = (name: string, option: string) => {
    const updated = { ...selected, [name]: option };
    setSelected(updated);
    onSelect?.(updated);
  };

  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-4">
      {variants.map((group) => (
        <div key={group.name} className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            {group.name}: <span className="font-normal text-muted-foreground">{selected[group.name]}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {group.options.map((opt) => {
              const isSelected = selected[group.name] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(group.name, opt)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-input bg-background hover:bg-muted text-foreground"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

