"use client";

import { cn } from "@/lib/utils";
import {
  DETAILED_MINUTE_PRESETS,
  MINUTE_ROLE_PRESETS,
} from "@/lib/match-capture";

interface QuickGoalPickerProps {
  label: string;
  value: number;
  max?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function QuickGoalPicker({
  label,
  value,
  max = 3,
  disabled = false,
  onChange,
}: QuickGoalPickerProps) {
  const options = Array.from({ length: max + 1 }, (_, index) => index);

  return (
    <div className={cn(disabled && "opacity-40")}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option)}
            className={cn(
              "min-w-[2.5rem] rounded-xl border-2 px-3 py-2 text-sm font-bold transition",
              value === option
                ? "border-[#1B4F8C] bg-[#1B4F8C] text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

const MINUTE_PRESETS = DETAILED_MINUTE_PRESETS;

export function MinuteRolePresets({
  value,
  disabled = false,
  onChange,
  className,
}: {
  value: number;
  disabled?: boolean;
  onChange: (minutes: number) => void;
  className?: string;
}) {
  return (
    <div className={cn(disabled && "opacity-40", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Minutos jugados
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {MINUTE_ROLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(preset.minutes)}
            className={cn(
              "rounded-xl border-2 px-3 py-2 text-sm font-semibold transition",
              value === preset.minutes
                ? "border-mf-accent-dark bg-mf-accent-soft text-mf-accent-dark"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface MinuteQuickInputProps {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

const DETAILED_MINUTES = DETAILED_MINUTE_PRESETS;

export function MinuteQuickInput({
  value,
  disabled = false,
  onChange,
}: MinuteQuickInputProps) {
  return (
    <div className={cn(disabled && "opacity-40")}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Minutos
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {DETAILED_MINUTES.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            onClick={() => onChange(preset)}
            className={cn(
              "rounded-xl border-2 px-3 py-2 text-sm font-semibold transition",
              value === preset
                ? "border-[#1B4F8C] bg-[#1B4F8C]/10 text-[#1B4F8C]"
                : "border-slate-200 bg-white text-slate-700",
            )}
          >
            {preset}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(20)}
          className={cn(
            "rounded-xl border-2 px-3 py-2 text-sm font-semibold transition",
            value === 20
              ? "border-[#1B4F8C] bg-[#1B4F8C]/10 text-[#1B4F8C]"
              : "border-slate-200 bg-white text-slate-700",
          )}
        >
          20
        </button>
      </div>
      <input
        type="number"
        min={0}
        max={120}
        disabled={disabled}
        value={value || ""}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        placeholder="Min"
        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-center text-lg font-semibold disabled:bg-slate-50"
      />
    </div>
  );
}
