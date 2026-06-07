import { getPassportBarClass } from "@/lib/player-utils";
import { cn } from "@/lib/utils";

interface PassportBarProps {
  score: number;
  className?: string;
}

export function PassportBar({ score, className }: PassportBarProps) {
  const width = Math.min(Math.max(score, 0), 100);

  return (
    <div className={cn("flex min-w-[88px] items-center gap-2", className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-all", getPassportBarClass(score))}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs font-semibold text-slate-700">
        {score}
      </span>
    </div>
  );
}
