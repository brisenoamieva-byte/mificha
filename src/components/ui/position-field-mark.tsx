import { getPositionLabel } from "@/lib/dashboard-utils";
import { POSITION_FIELD_ZONES } from "@/lib/player-visual-profile";
import type { PlayerPosition } from "@/types/database";
import { cn } from "@/lib/utils";

interface PositionFieldMarkProps {
  primary: PlayerPosition;
  secondary?: PlayerPosition | null;
  className?: string;
  compact?: boolean;
}

export function PositionFieldMark({
  primary,
  secondary,
  className,
  compact = false,
}: PositionFieldMarkProps) {
  const marks = [
    { position: primary, tone: "primary" as const },
    ...(secondary && secondary !== primary
      ? [{ position: secondary, tone: "secondary" as const }]
      : []),
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-emerald-700/30 bg-gradient-to-b from-emerald-600/90 to-emerald-700",
          compact ? "aspect-[4/5] max-w-[140px]" : "aspect-[4/5] max-w-[180px]",
        )}
      >
        <div className="absolute inset-x-4 top-1/2 h-px bg-white/25" aria-hidden />
        <div className="absolute inset-x-8 top-1/2 h-12 -translate-y-1/2 rounded-full border border-white/20" aria-hidden />
        <div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-white/20" aria-hidden />
        <div className="absolute inset-x-3 bottom-3 top-3 rounded-lg border border-white/15" aria-hidden />

        {marks.map((mark) => {
          const zone = POSITION_FIELD_ZONES[mark.position];
          return (
            <div
              key={`${mark.position}-${mark.tone}`}
              className={cn(
                "absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-bold text-white shadow-md",
                compact ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs",
                mark.tone === "primary"
                  ? "border-white bg-[#1B4F8C]"
                  : "border-amber-200 bg-amber-500",
              )}
              style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
              title={getPositionLabel(mark.position)}
            >
              {zone.label}
            </div>
          );
        })}
      </div>

      <div className="space-y-1 text-xs text-slate-600">
        <p>
          <span className="font-semibold text-slate-800">Principal:</span>{" "}
          {getPositionLabel(primary)}
        </p>
        {secondary && secondary !== primary ? (
          <p>
            <span className="font-semibold text-slate-800">Alternativa:</span>{" "}
            {getPositionLabel(secondary)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
