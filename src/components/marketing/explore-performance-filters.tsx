"use client";

import {
  GphScoreFilterSelect,
  gphScoreFilterValueFromPerformance,
  performancePatchFromGphScoreFilter,
} from "@/components/marketing/gph-score-filter-select";
import {
  RATE_SAMPLE_MIN_MINUTES,
  type DirectoryPerformanceFilter,
} from "@/lib/public-directory";
import { CURRENT_SEASON_LABEL } from "@/lib/marketing-season";
import { cn } from "@/lib/utils";

export const DEFAULT_PERFORMANCE_FILTER: DirectoryPerformanceFilter = {
  minMinutes: 0,
  minGoals: 0,
  minAssists: 0,
  minMatches: 0,
  minContributions: 0,
  minGoalsPer90: 0,
  minAssistsPer90: 0,
  requireGph: false,
  minGphScore: 0,
  requireVideo: false,
};

type ExplorePerformanceFiltersProps = {
  value: DirectoryPerformanceFilter;
  onChange: (next: DirectoryPerformanceFilter) => void;
  className?: string;
  /** Estilo sobre fondo oscuro (home). */
  tone?: "light" | "dark";
};

function parseMin(raw: string, decimals = 0) {
  if (!raw.trim()) return 0;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (decimals <= 0) return Math.min(Math.round(n), 99999);
  const factor = 10 ** decimals;
  return Math.min(Math.round(n * factor) / factor, 99999);
}

function MinNumberField({
  label,
  value,
  onChange,
  inputClass,
  placeholder,
  step = 1,
  decimals = 0,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  inputClass: string;
  placeholder: string;
  step?: number;
  decimals?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-mf-text-secondary">
        {label}
      </span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step={step}
        value={value > 0 ? value : ""}
        placeholder={placeholder}
        onChange={(event) => onChange(parseMin(event.target.value, decimals))}
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
        Rendimiento · {CURRENT_SEASON_LABEL}. Escribe el mínimo; vacío = sin filtro.
        Sin stats cuenta como 0. Goles/90 y asistencias/90 requieren al menos{" "}
        {RATE_SAMPLE_MIN_MINUTES} minutos.
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <MinNumberField
          label="Mín. minutos"
          value={value.minMinutes ?? 0}
          onChange={(minMinutes) => patch({ minMinutes })}
          inputClass={inputClass}
          placeholder="Ej. 120"
        />
        <MinNumberField
          label="Mín. partidos"
          value={value.minMatches ?? 0}
          onChange={(minMatches) => patch({ minMatches })}
          inputClass={inputClass}
          placeholder="Ej. 5"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <MinNumberField
          label="Mín. goles"
          value={value.minGoals ?? 0}
          onChange={(minGoals) => patch({ minGoals })}
          inputClass={inputClass}
          placeholder="Ej. 2"
        />
        <MinNumberField
          label="Mín. asistencias"
          value={value.minAssists ?? 0}
          onChange={(minAssists) => patch({ minAssists })}
          inputClass={inputClass}
          placeholder="Ej. 1"
        />
        <MinNumberField
          label="Mín. contribuciones (G+A)"
          value={value.minContributions ?? 0}
          onChange={(minContributions) => patch({ minContributions })}
          inputClass={inputClass}
          placeholder="Ej. 3"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <MinNumberField
          label="Mín. goles / 90'"
          value={value.minGoalsPer90 ?? 0}
          onChange={(minGoalsPer90) => patch({ minGoalsPer90 })}
          inputClass={inputClass}
          placeholder="Ej. 0.4"
          step={0.1}
          decimals={2}
        />
        <MinNumberField
          label="Mín. asistencias / 90'"
          value={value.minAssistsPer90 ?? 0}
          onChange={(minAssistsPer90) => patch({ minAssistsPer90 })}
          inputClass={inputClass}
          placeholder="Ej. 0.3"
          step={0.1}
          decimals={2}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <GphScoreFilterSelect
          value={gphScoreFilterValueFromPerformance(value)}
          onChange={(next) => patch(performancePatchFromGphScoreFilter(next))}
          selectClassName={inputClass}
        />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-mf-text-secondary">
            Video
          </span>
          <label
            className={cn(
              "inline-flex h-[42px] w-full items-center gap-2 rounded-lg border px-3 text-sm",
              dark
                ? "border-white/20 bg-white/95 text-mf-text"
                : "border-mf-border bg-white text-mf-text-secondary",
            )}
          >
            <input
              type="checkbox"
              checked={Boolean(value.requireVideo)}
              onChange={(event) => patch({ requireVideo: event.target.checked })}
              className="h-4 w-4 rounded border-mf-border text-mf-gph focus:ring-mf-gph"
            />
            Solo con video
          </label>
        </label>
      </div>
    </div>
  );
}
