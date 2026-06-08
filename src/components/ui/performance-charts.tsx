"use client";

import { cn } from "@/lib/utils";
import { buildAreaPath, buildSparklinePath } from "@/lib/performance-analytics";

interface SparklineProps {
  values: number[];
  className?: string;
  strokeClassName?: string;
  width?: number;
  height?: number;
}

export function Sparkline({
  values,
  className,
  strokeClassName = "stroke-mf-accent",
  width = 128,
  height = 40,
}: SparklineProps) {
  const path = buildSparklinePath(values, width, height);

  if (!path) {
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={cn("w-full", className)}
        aria-hidden
      >
        <line
          x1={4}
          y1={height / 2}
          x2={width - 4}
          y2={height / 2}
          className="stroke-mf-border"
          strokeWidth={2}
          strokeDasharray="4 4"
        />
      </svg>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("w-full", className)} aria-hidden>
      <path
        d={path}
        fill="none"
        className={cn(strokeClassName, "stroke-[2.5]")}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface AreaTrendChartProps {
  values: number[];
  labels?: string[];
  className?: string;
  height?: number;
}

export function AreaTrendChart({
  values,
  labels = [],
  className,
  height = 88,
}: AreaTrendChartProps) {
  const width = 280;
  const { line, area } = buildAreaPath(values, width, height);

  if (!line) {
    return (
      <div
        className={cn(
          "flex h-[88px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/10 text-xs text-white/45",
          className,
        )}
      >
        Captura partidos para ver la curva
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="mf-trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(52,211,153,0.35)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0)" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#mf-trend-fill)" />
        <path
          d={line}
          fill="none"
          className="stroke-mf-accent"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {labels.length > 0 ? (
        <div className="mt-2 flex justify-between text-[10px] font-medium text-white/40">
          <span>{labels[0]}</span>
          <span>{labels[labels.length - 1]}</span>
        </div>
      ) : null}
    </div>
  );
}

interface MetricPulseCardProps {
  label: string;
  value: string | number;
  hint?: string;
  sparklineValues?: number[];
  deltaLabel?: string;
  tone?: "brand" | "accent" | "amber";
  className?: string;
}

const toneStyles = {
  brand: {
    value: "text-mf-brand",
    spark: "stroke-mf-brand",
    glow: "from-mf-brand/10 to-transparent",
  },
  accent: {
    value: "text-mf-accent-dark",
    spark: "stroke-mf-accent-dark",
    glow: "from-mf-accent/15 to-transparent",
  },
  amber: {
    value: "text-mf-warning",
    spark: "stroke-amber-500",
    glow: "from-amber-400/15 to-transparent",
  },
};

export function MetricPulseCard({
  label,
  value,
  hint,
  sparklineValues = [],
  deltaLabel,
  tone = "accent",
  className,
}: MetricPulseCardProps) {
  const styles = toneStyles[tone];

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-mf-border bg-mf-surface p-4 transition hover:border-mf-accent/30 hover:shadow-[var(--mf-shadow)]",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition group-hover:opacity-100",
          styles.glow,
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 text-[1.75rem] font-semibold tabular-nums tracking-[-0.03em]",
              styles.value,
            )}
          >
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-mf-text-secondary">{hint}</p>
          ) : null}
          {deltaLabel ? (
            <p className="mt-2 text-xs font-semibold text-mf-accent-dark">
              {deltaLabel}
            </p>
          ) : null}
        </div>
        <div className="w-24 shrink-0 pt-1">
          <Sparkline values={sparklineValues} strokeClassName={styles.spark} />
        </div>
      </div>
    </article>
  );
}

interface MatchTimelineProps {
  rows: Array<{
    matchId: string;
    matchDate: string;
    opponent: string;
    goals: number;
    assists: number;
    minutes: number;
    result: "win" | "draw" | "loss" | "neutral";
  }>;
  selectedMatchId?: string | null;
  onSelect?: (matchId: string) => void;
}

const resultStyles = {
  win: "border-mf-accent/30 bg-mf-accent-soft/50",
  draw: "border-amber-200 bg-amber-50/80",
  loss: "border-red-200 bg-red-50/70",
  neutral: "border-mf-border bg-mf-canvas",
};

export function MatchTimeline({
  rows,
  selectedMatchId,
  onSelect,
}: MatchTimelineProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-mf-border px-6 py-10 text-center text-sm text-mf-text-secondary">
        Aún no hay partidos capturados para este jugador en la temporada.
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {rows.map((row, index) => {
        const active = row.matchId === selectedMatchId;
        const contribution = row.goals + row.assists;
        const intensity = Math.min(100, contribution * 35 + row.minutes * 0.4);

        return (
          <li key={row.matchId}>
            <button
              type="button"
              onClick={() => onSelect?.(row.matchId)}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition",
                resultStyles[row.result],
                active && "ring-2 ring-mf-accent/40",
                onSelect && "hover:scale-[1.01] hover:shadow-sm",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-mf-text-muted">
                    J{index + 1} ·{" "}
                    {new Date(`${row.matchDate}T12:00:00`).toLocaleDateString(
                      "es-MX",
                      { day: "numeric", month: "short" },
                    )}
                  </p>
                  <p className="mt-1 font-semibold text-mf-text">vs {row.opponent}</p>
                  <p className="mt-1 text-sm text-mf-text-secondary">
                    {row.goals}G · {row.assists}A · {row.minutes} min
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold tabular-nums text-mf-accent-dark">
                    +{contribution}
                  </p>
                  <p className="text-[11px] text-mf-text-muted">contrib.</p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-mf-brand to-mf-accent transition-all duration-700"
                  style={{ width: `${Math.max(8, intensity)}%` }}
                />
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
