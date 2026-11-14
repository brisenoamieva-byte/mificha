"use client";

import type { DirectoryPerformanceFilter } from "@/lib/public-directory";
import { cn } from "@/lib/utils";

export const GPH_SCORE_FILTER_OPTIONS = [
  { value: "all", label: "Cualquier evaluación GPH", requireGph: false, minGphScore: 0 },
  { value: "any", label: "Con evaluación GPH", requireGph: true, minGphScore: 0 },
  { value: "3", label: "GPH · 3.0 o más", requireGph: true, minGphScore: 3 },
  { value: "3.5", label: "GPH · 3.5 o más", requireGph: true, minGphScore: 3.5 },
  { value: "4", label: "GPH · 4.0 o más", requireGph: true, minGphScore: 4 },
  { value: "4.5", label: "GPH · 4.5 o más", requireGph: true, minGphScore: 4.5 },
] as const;

export type GphScoreFilterValue = (typeof GPH_SCORE_FILTER_OPTIONS)[number]["value"];

export function gphScoreFilterValueFromPerformance(
  performance: Pick<DirectoryPerformanceFilter, "requireGph" | "minGphScore">,
): GphScoreFilterValue {
  const min = performance.minGphScore ?? 0;
  if (min >= 4.5) return "4.5";
  if (min >= 4) return "4";
  if (min >= 3.5) return "3.5";
  if (min >= 3) return "3";
  if (performance.requireGph || min > 0) return "any";
  return "all";
}

export function performancePatchFromGphScoreFilter(
  value: GphScoreFilterValue,
): Pick<DirectoryPerformanceFilter, "requireGph" | "minGphScore"> {
  const option =
    GPH_SCORE_FILTER_OPTIONS.find((item) => item.value === value) ??
    GPH_SCORE_FILTER_OPTIONS[0];
  return {
    requireGph: option.requireGph,
    minGphScore: option.minGphScore,
  };
}

export function GphScoreFilterSelect({
  value,
  onChange,
  className,
  hideLabel = false,
  selectClassName,
}: {
  value: GphScoreFilterValue;
  onChange: (next: GphScoreFilterValue) => void;
  className?: string;
  hideLabel?: boolean;
  selectClassName?: string;
}) {
  return (
    <label className={cn("block", className)}>
      {hideLabel ? (
        <span className="sr-only">Calificación GPH</span>
      ) : (
        <span className="mb-1 block text-xs font-medium text-mf-text-secondary">
          Calificación GPH
        </span>
      )}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as GphScoreFilterValue)}
        className={cn("mf-input", selectClassName)}
      >
        {GPH_SCORE_FILTER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
