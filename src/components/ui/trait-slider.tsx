"use client";

import { cn } from "@/lib/utils";

interface TraitSliderProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
}

export function TraitSlider({ label, value, onChange, className }: TraitSliderProps) {
  const display = value ?? 5;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="tabular-nums text-sm font-semibold text-[#1B4F8C]">
          {value ?? "—"}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={display}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer accent-[#1B4F8C]"
      />
      <div className="flex justify-between text-[10px] font-medium uppercase tracking-wide text-slate-400">
        <span>1</span>
        <span>10</span>
      </div>
    </div>
  );
}
