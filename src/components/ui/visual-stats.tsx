"use client";

import { cn } from "@/lib/utils";

interface ComparisonBarProps {
  label: string;
  playerValue: number;
  teamAverage: number;
  maxValue: number;
  rank?: number;
  totalPlayers?: number;
  delta?: number;
  invertColors?: boolean;
  accentClassName?: string;
}

export function ComparisonBar({
  label,
  playerValue,
  teamAverage,
  maxValue,
  rank,
  totalPlayers,
  delta,
  invertColors = false,
  accentClassName = "bg-mf-brand",
}: ComparisonBarProps) {
  const playerWidth = Math.min(100, (playerValue / maxValue) * 100);
  const averageWidth = Math.min(100, (teamAverage / maxValue) * 100);
  const isAbove = invertColors ? playerValue < teamAverage : playerValue > teamAverage;
  const isBelow = invertColors ? playerValue > teamAverage : playerValue < teamAverage;

  return (
    <div className="mf-card p-4 transition hover:border-mf-brand/25">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-mf-text">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-mf-brand">
            {playerValue}
          </p>
        </div>
        <div className="text-right">
          {typeof rank === "number" && typeof totalPlayers === "number" ? (
            <span className="inline-flex rounded-full bg-mf-canvas px-2.5 py-1 text-xs font-semibold text-mf-text-secondary">
              #{rank} de {totalPlayers}
            </span>
          ) : null}
          {typeof delta === "number" ? (
            <p
              className={cn(
                "mt-2 text-xs font-medium",
                isAbove && "text-mf-success",
                isBelow && "text-mf-warning",
                !isAbove && !isBelow && "text-mf-text-muted",
              )}
            >
              {delta > 0 ? "+" : ""}
              {delta} vs promedio ({teamAverage})
            </p>
          ) : null}
        </div>
      </div>

      <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-mf-brand-soft">
        <div
          className="absolute inset-y-0 rounded-full bg-black/10"
          style={{ width: `${averageWidth}%` }}
        />
        <div
          className={cn("absolute inset-y-0 rounded-full", accentClassName)}
          style={{ width: `${playerWidth}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-mf-text-muted">
        <span>Jugador</span>
        <span>Promedio plantel</span>
      </div>
    </div>
  );
}

interface PassportRingProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const ringSizes = {
  sm: { box: "h-16 w-16", text: "text-lg", label: "text-[10px]" },
  md: { box: "h-24 w-24", text: "text-3xl", label: "text-xs" },
  lg: { box: "h-32 w-32", text: "text-4xl", label: "text-sm" },
};

export function PassportRing({
  score,
  label = "Passport",
  size = "md",
}: PassportRingProps) {
  const clamped = Math.min(Math.max(score, 0), 100);
  const styles = ringSizes[size];
  const strokeColor =
    clamped < 50 ? "#b24020" : clamped <= 70 ? "#915907" : "#057642";

  return (
    <div className={cn("relative flex items-center justify-center", styles.box)}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#ebebeb" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * 264} 264`}
        />
      </svg>
      <div className="text-center">
        <p className={cn("font-semibold tabular-nums text-mf-text", styles.text)}>
          {clamped}
        </p>
        <p className={cn("font-medium text-mf-text-muted", styles.label)}>{label}</p>
      </div>
    </div>
  );
}

interface MiniStatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "blue" | "green" | "amber" | "slate";
}

const toneClasses = {
  blue: "text-mf-brand",
  green: "text-mf-success",
  amber: "text-mf-warning",
  slate: "text-mf-text",
};

export function MiniStatCard({
  label,
  value,
  hint,
  tone = "blue",
}: MiniStatCardProps) {
  return (
    <div className="mf-card p-4">
      <p className="text-xs font-medium text-mf-text-secondary">{label}</p>
      <p className={cn("mt-2 text-[1.75rem] font-semibold tabular-nums tracking-[-0.02em]", toneClasses[tone])}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-mf-text-muted">{hint}</p> : null}
    </div>
  );
}
