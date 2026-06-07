import { ArrowDown, ArrowUp, Sparkles } from "lucide-react";
import type { PerformanceTrend } from "@/lib/competition";
import { getTrendLabel } from "@/lib/competition";
import { cn } from "@/lib/utils";

interface TrendBadgeProps {
  trend: PerformanceTrend;
  className?: string;
  compact?: boolean;
}

export function TrendBadge({ trend, className, compact = false }: TrendBadgeProps) {
  const label = getTrendLabel(trend);

  if (trend.direction === "stable" && compact) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        trend.direction === "up" && "bg-mf-success-soft text-mf-success",
        trend.direction === "down" && "bg-mf-danger-soft text-mf-danger",
        trend.direction === "new" && "bg-mf-brand-soft text-mf-brand",
        trend.direction === "stable" && "bg-mf-canvas text-mf-text-muted",
        className,
      )}
    >
      {trend.direction === "up" ? (
        <ArrowUp className="h-3 w-3" />
      ) : null}
      {trend.direction === "down" ? (
        <ArrowDown className="h-3 w-3" />
      ) : null}
      {trend.direction === "new" ? (
        <Sparkles className="h-3 w-3" />
      ) : null}
      {label}
    </span>
  );
}
