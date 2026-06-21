import { FICHA_COPY, computeSeasonSummary, type SeasonSummary } from "@/lib/ficha-content";
import type { PlayerSeasonStat } from "@/types/database";
import { cn } from "@/lib/utils";

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="ficha-stat px-2 py-2 text-center">
      <p className="text-base font-semibold tabular-nums leading-none text-mf-text sm:text-lg">
        {value}
      </p>
      <p className="mt-1 text-[9px] font-medium leading-tight text-mf-text-muted">{label}</p>
    </div>
  );
}

interface FichaSeasonBlockProps {
  stats: Pick<
    PlayerSeasonStat,
    | "total_matches"
    | "total_goals"
    | "total_assists"
    | "total_minutes"
    | "total_yellow_cards"
    | "total_red_cards"
  > | null;
  summary?: SeasonSummary;
  className?: string;
  compact?: boolean;
}

export function FichaSeasonBlock({
  stats,
  summary: summaryProp,
  className,
  compact = false,
}: FichaSeasonBlockProps) {
  const summary = summaryProp ?? computeSeasonSummary(stats);

  if (summary.matches === 0 && summary.minutes === 0) {
    return null;
  }

  return (
    <section className={cn("border-b border-mf-border-subtle px-4 py-3 sm:px-5", className)}>
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
        {FICHA_COPY.seasonTitle}
      </p>
      {!compact ? (
        <p className="mt-0.5 text-[10px] leading-4 text-mf-text-muted">{FICHA_COPY.seasonHint}</p>
      ) : null}

      <div className="ficha-stats-row mt-2 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-mf-border-subtle bg-mf-border-subtle sm:grid-cols-6">
        <StatCell label="Partidos" value={summary.matches} />
        <StatCell label="Goles" value={summary.goals} />
        <StatCell label="Asistencias" value={summary.assists} />
        <StatCell label="Minutos" value={summary.minutes} />
        <StatCell label="Amarillas" value={summary.yellowCards} />
        <StatCell label="Rojas" value={summary.redCards} />
      </div>

      <p className="mt-2 text-[10px] tabular-nums text-mf-text-secondary">
        Promedio {summary.avgMinutesPerMatch} min/partido
        {summary.goalsPer90 > 0 || summary.assistsPer90 > 0 ? (
          <>
            {" · "}
            {summary.goalsPer90} G/90
            {summary.assistsPer90 > 0 ? ` · ${summary.assistsPer90} A/90` : null}
          </>
        ) : null}
      </p>
    </section>
  );
}
