import { Users } from "lucide-react";
import {
  getCategoryFilterLabel,
  getPlayerAge,
  getPlayerGeneration,
  getSubCategoryLabel,
} from "@/lib/player-category";
import { cn } from "@/lib/utils";

interface PlayerCategoryBadgeProps {
  birthDate: string;
  className?: string;
  compact?: boolean;
}

export function PlayerCategoryBadge({
  birthDate,
  className,
  compact = false,
}: PlayerCategoryBadgeProps) {
  const age = getPlayerAge(birthDate);
  const generation = getPlayerGeneration(birthDate);

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex rounded-full bg-mf-brand-soft px-2 py-0.5 text-[11px] font-semibold text-mf-brand",
          className,
        )}
      >
        {getSubCategoryLabel(age)}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-mf-brand-soft px-2.5 py-1 text-xs font-semibold text-mf-brand",
        className,
      )}
    >
      <Users className="h-3.5 w-3.5" />
      {getSubCategoryLabel(age)} · Gen. {generation}
    </span>
  );
}

export function CategoryFilterSummary({
  categoryValue,
}: {
  categoryValue: string;
}) {
  const label = getCategoryFilterLabel(
    categoryValue === "all"
      ? { kind: "all" }
      : categoryValue.startsWith("age:")
        ? { kind: "age", age: Number(categoryValue.slice(4)) }
        : categoryValue.startsWith("gen:")
          ? { kind: "generation", year: Number(categoryValue.slice(4)) }
          : { kind: "all" },
  );

  if (!label) return null;

  return (
    <span className="inline-flex rounded-full bg-mf-canvas px-3 py-1 text-xs font-medium text-mf-text-secondary ring-1 ring-mf-border">
      {label}
    </span>
  );
}
