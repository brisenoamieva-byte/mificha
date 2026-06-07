import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  badge?: {
    label: string;
    active: boolean;
  };
}

export function MetricCard({ title, value, icon: Icon, badge }: MetricCardProps) {
  return (
    <div className="mf-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.8125rem] font-medium text-mf-text-secondary">{title}</p>
          {badge ? (
            <span
              className={cn(
                "mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                badge.active
                  ? "bg-mf-success-soft text-mf-success"
                  : "bg-mf-canvas text-mf-text-secondary",
              )}
            >
              {badge.label}
            </span>
          ) : (
            <p className="mt-2 text-[1.75rem] font-semibold tabular-nums tracking-[-0.02em] text-mf-text">
              {value}
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-mf-brand-soft text-mf-brand">
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
    </div>
  );
}
