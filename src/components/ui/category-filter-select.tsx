"use client";

import {
  buildCategoryFilterOptions,
  type CategoryFilterOption,
} from "@/lib/player-category";
import { cn } from "@/lib/utils";

interface CategoryFilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  birthDates: string[];
  className?: string;
  selectClassName?: string;
  label?: string;
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
}: CategoryFilterSelectProps) {
  const options = buildCategoryFilterOptions(birthDates);

  return (
    <label className={cn("block", className)}>
      <span className="text-sm font-medium text-mf-text">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn("mf-input mt-2", selectClassName)}
      >
        {renderOptions(options)}
      </select>
    </label>
  );
}
