"use client";

import {
  buildCategoryFilterOptions,
  type CategoryFilterOption,
} from "@/lib/player-category";
import { cn } from "@/lib/utils";

interface CategoryFilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  birthDates: Array<string | null | undefined>;
  className?: string;
  selectClassName?: string;
  label?: string;
  hint?: string;
  includeAll?: boolean;
  /** Compacto en buscadores: sin etiqueta visible. */
  hideLabel?: boolean;
}

function renderOptions(options: CategoryFilterOption[]) {
  const ageOptions = options.filter((option) => option.group === "age");
  const generationOptions = options.filter((option) => option.group === "generation");
  const baseOptions = options.filter((option) => !option.group);

  return (
    <>
      {baseOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {ageOptions.length > 0 ? (
        <optgroup label="Por categoría (edad)">
          {ageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ) : null}
      {generationOptions.length > 0 ? (
        <optgroup label="Por generación">
          {generationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ) : null}
    </>
  );
}

export function CategoryFilterSelect({
  value,
  onChange,
  birthDates,
  className,
  selectClassName,
  label = "Categoría / generación",
  hint,
  includeAll = true,
  hideLabel = false,
}: CategoryFilterSelectProps) {
  const options = buildCategoryFilterOptions(birthDates, { includeAll });

  return (
    <label className={cn("block", className)}>
      <span className={hideLabel ? "sr-only" : "text-sm font-medium text-mf-text"}>
        {label || "Categoría / generación"}
      </span>
      {!hideLabel && hint ? (
        <span className="mt-1 block text-xs leading-5 text-mf-text-muted">{hint}</span>
      ) : null}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn("mf-input", !hideLabel && "mt-2", selectClassName)}
      >
        {renderOptions(options)}
      </select>
    </label>
  );
}
