"use client";

import { useEffect, useState } from "react";
import {
  formatMeasure,
  isPartialMeasureInput,
  parseMeasureInput,
} from "@/lib/gph-field-protocol";
import { cn } from "@/lib/utils";

interface MeasureFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  unit?: string;
  integer?: boolean;
  min?: number;
  max?: number;
  className?: string;
}

export function MeasureField({
  label,
  value,
  onChange,
  unit,
  integer = false,
  min = 0,
  max,
  className,
}: MeasureFieldProps) {
  const [text, setText] = useState(value == null ? "" : formatMeasure(value, integer));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setText(value == null ? "" : formatMeasure(value, integer));
    }
  }, [value, integer, focused]);

  function commit(raw: string) {
    if (!raw.trim()) {
      onChange(null);
      setText("");
      return;
    }
    if (isPartialMeasureInput(raw)) return;
    let parsed = parseMeasureInput(raw);
    if (parsed == null) return;
    if (integer) parsed = Math.round(parsed);
    if (min != null && parsed < min) parsed = min;
    if (max != null && parsed > max) parsed = max;
    onChange(parsed);
    setText(formatMeasure(parsed, integer));
  }

  return (
    <label className={cn("text-[11px] font-medium text-mf-text-muted", className)}>
      {label}
      {unit ? <span className="font-normal"> · {unit}</span> : null}
      <input
        type="text"
        inputMode={integer ? "numeric" : "decimal"}
        autoComplete="off"
        enterKeyHint="next"
        value={text}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          commit(text);
        }}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw !== "" && !/^[-0-9.,\s]*$/.test(raw)) return;
          setText(raw);
          if (!raw.trim()) {
            onChange(null);
            return;
          }
          if (isPartialMeasureInput(raw)) return;
          let parsed = parseMeasureInput(raw);
          if (parsed == null) return;
          if (integer) parsed = Math.round(parsed);
          if (min != null && parsed < min) return;
          if (max != null && parsed > max) return;
          onChange(parsed);
        }}
        className="mf-input mt-1 px-2 tabular-nums"
      />
    </label>
  );
}
