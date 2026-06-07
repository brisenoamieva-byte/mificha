import { getPositionBadgeClass, positionOptions } from "@/lib/player-utils";
import { cn } from "@/lib/utils";
import type { PlayerPosition } from "@/types/database";

interface PositionBadgeProps {
  position: PlayerPosition;
  className?: string;
}

export function PositionBadge({ position, className }: PositionBadgeProps) {
  const label =
    positionOptions.find((option) => option.value === position)?.label ??
    position;

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        getPositionBadgeClass(position),
        className,
      )}
    >
      {label}
    </span>
  );
}
