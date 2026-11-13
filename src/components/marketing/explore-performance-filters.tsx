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

const MINUTES_OPTIONS = [
  { value: 0, label: "Cualquier minutos" },
  { value: 90, label: "Mín. 90 min" },
  { value: 300, label: "Mín. 300 min" },
  { value: 500, label: "Mín. 500 min" },
] as const;

const GOALS_OPTIONS = [
  { value: 0, label: "Cualquier goles" },
  { value: 1, label: "Mín. 1 gol" },
  { value: 3, label: "Mín. 3 goles" },
  { value: 5, label: "Mín. 5 goles" },
] as const;

const MATCHES_OPTIONS = [
  { value: 0, label: "Cualquier partidos" },
  { value: 3, label: "Mín. 3 PJ" },
  { value: 5, label: "Mín. 5 PJ" },
  { value: 10, label: "Mín. 10 PJ" },
] as const;

type ExplorePerformanceFiltersProps = {
  value: DirectoryPerformanceFilter;
  onChange: (next: DirectoryPerformanceFilter) => void;
  className?: string;
  /** Estilo sobre fondo oscuro (home). */
  tone?: "light" | "dark";
};

export function ExplorePerformanceFilters({
  value,
  onChange,
  className,
  tone = "light",
}: ExplorePerformanceFiltersProps) {
  const dark = tone === "dark";
  const selectClass = dark
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
        Rendimiento · {CURRENT_SEASON_LABEL}. Sin stats cuenta como 0.
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="block">
          <span className="sr-only">Minutos jugados</span>
          <select
            value={value.minMinutes ?? 0}
            onChange={(event) => patch({ minMinutes: Number(event.target.value) })}
            className={selectClass}
          >
            {MINUTES_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Goles</span>
          <select
            value={value.minGoals ?? 0}
            onChange={(event) => patch({ minGoals: Number(event.target.value) })}
            className={selectClass}
          >
            {GOALS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Partidos</span>
          <select
            value={value.minMatches ?? 0}
            onChange={(event) => patch({ minMatches: Number(event.target.value) })}
            className={selectClass}
          >
            {MATCHES_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
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
