"use client";

import type { DirectoryPerformanceFilter } from "@/lib/public-directory";
import { CURRENT_SEASON_LABEL } from "@/lib/marketing-season";
import { cn } from "@/lib/utils";

export const DEFAULT_PERFORMANCE_FILTER: DirectoryPerformanceFilter = {
  minMinutes: 0,
  minGoals: 0,
  minAssists: 0,
  minMatches: 0,
  requireGph: false,
  requireVideo: false,
};

type ExplorePerformanceFiltersProps = {
  value: DirectoryPerformanceFilter;
  onChange: (next: DirectoryPerformanceFilter) => void;
  className?: string;
  /** Estilo sobre fondo oscuro (home). */
  tone?: "light" | "dark";
};

function parseMin(raw: string) {
  if (!raw.trim()) return 0;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n), 99999);
}

function MinNumberField({
  label,
  value,
  onChange,
  inputClass,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  inputClass: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-mf-text-secondary">
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={value > 0 ? value : ""}
        placeholder={placeholder}
        onChange={(event) => onChange(parseMin(event.target.value))}
        className={inputClass}
      />
    </label>
  );
}

export function ExplorePerformanceFilters({
  value,
  onChange,
  className,
  tone = "light",
}: ExplorePerformanceFiltersProps) {
  const dark = tone === "dark";
  const inputClass = dark
    ? "mf-input border-white/20 bg-white/95 text-mf-text"
    : "mf-input";

  function patch(partial: Partial<DirectoryPerformanceFilter>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p
        className={cn(
          "text-xs leading-5",
          dark ? "text-white/65" : "text-mf-text-muted",
        )}
      >
        Rendimiento · {CURRENT_SEASON_LABEL}. Escribe el mínimo que quieras; vacío =
        sin filtro. Sin stats cuenta como 0.
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        <MinNumberField
          label="Mín. minutos"
          value={value.minMinutes ?? 0}
          onChange={(minMinutes) => patch({ minMinutes })}
          inputClass={inputClass}
          placeholder="Ej. 120"
        />
        <MinNumberField
          label="Mín. goles"
          value={value.minGoals ?? 0}
          onChange={(minGoals) => patch({ minGoals })}
          inputClass={inputClass}
          placeholder="Ej. 2"
        />
        <MinNumberField
          label="Mín. partidos"
          value={value.minMatches ?? 0}
          onChange={(minMatches) => patch({ minMatches })}
          inputClass={inputClass}
          placeholder="Ej. 5"
        />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <label
          className={cn(
            "inline-flex items-center gap-2 text-sm",
            dark ? "text-white/85" : "text-mf-text-secondary",
          )}
        >
          <input
            type="checkbox"
            checked={Boolean(value.requireGph)}
            onChange={(event) => patch({ requireGph: event.target.checked })}
            className="h-4 w-4 rounded border-mf-border text-mf-gph focus:ring-mf-gph"
          />
          Con evaluación GPH
        </label>
        <label
          className={cn(
            "inline-flex items-center gap-2 text-sm",
            dark ? "text-white/85" : "text-mf-text-secondary",
          )}
        >
          <input
            type="checkbox"
            checked={Boolean(value.requireVideo)}
            onChange={(event) => patch({ requireVideo: event.target.checked })}
            className="h-4 w-4 rounded border-mf-border text-mf-gph focus:ring-mf-gph"
          />
          Con video
        </label>
      </div>
    </div>
  );
}
