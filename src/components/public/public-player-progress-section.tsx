"use client";

import { Flame, TrendingUp } from "lucide-react";
import {
  AreaTrendChart,
  MatchTimeline,
  MetricPulseCard,
} from "@/components/ui/performance-charts";
import { computeConsecutiveMatchStreak, getStreakLabel } from "@/lib/match-streak";
import {
  buildTrendSeries,
  getResultTone,
  getSeasonCaptureProgress,
  type MatchPerformanceRow,
  type PerformanceHighlights,
} from "@/lib/performance-analytics";

interface PublicPlayerProgressSectionProps {
  seasonName: string | null;
  progress: MatchPerformanceRow[];
  highlights: PerformanceHighlights;
}

export function PublicPlayerProgressSection({
  seasonName,
  progress,
  highlights,
}: PublicPlayerProgressSectionProps) {
  if (progress.length === 0) {
    return (
      <section className="border-t border-slate-100 px-6 py-8 sm:px-10">
        <h2 className="text-lg font-semibold text-slate-900">
          Evolución partido a partido
        </h2>
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <TrendingUp className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm text-slate-600">
            Cuando se capture el primer partido de{" "}
            {seasonName ? seasonName.toLowerCase() : "la temporada"}, aquí verás la
            progresión juego tras juego.
          </p>
        </div>
      </section>
    );
  }

  const goalsTrend = buildTrendSeries(progress, "goals");
  const assistsTrend = buildTrendSeries(progress, "assists");
  const contributionTrend = buildTrendSeries(progress, "contributions");
  const matchStreak = computeConsecutiveMatchStreak(progress.map((row) => row.matchDate));
  const streakLabel = getStreakLabel(matchStreak);
  const seasonCapture = getSeasonCaptureProgress(progress.length);

  const timelineRows = progress.map((row) => ({
    matchId: row.matchId,
    matchDate: row.matchDate,
    opponent: row.opponent,
    goals: row.goals,
    assists: row.assists,
    minutes: row.minutes,
    result: getResultTone(row.result),
  }));

  return (
    <section className="border-t border-slate-100 px-6 py-8 sm:px-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mf-accent-dark">
            Progreso en vivo
          </p>
          <h2 className="text-lg font-semibold text-slate-900">
            Evolución partido a partido
          </h2>
          {seasonName ? (
            <p className="mt-1 text-sm text-slate-500">{seasonName}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-mf-accent-soft px-3 py-1.5 text-sm font-semibold text-mf-accent-dark">
            <Flame className="h-4 w-4" />
            +{highlights.recentForm} G+A últimos 3
          </div>
          {streakLabel ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-800">
              <Flame className="h-4 w-4" />
              Racha: {streakLabel}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-slate-800">Progreso de temporada</span>
          <span className="text-slate-600">{seasonCapture.label}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#1B4F8C] to-emerald-500 transition-all"
            style={{ width: `${seasonCapture.percent}%` }}
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-mf-brand/10 bg-gradient-to-br from-[#0a1f3d] via-[#0f2d52] to-[#134271] p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mf-accent-bright">
          Contribución acumulada
        </p>
        <AreaTrendChart
          values={contributionTrend.map((point) => point.cumulative)}
          labels={[
            contributionTrend[0]?.label ?? "Inicio",
            contributionTrend[contributionTrend.length - 1]?.label ?? "Hoy",
          ]}
          className="mt-4"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MetricPulseCard
          label="Goles"
          value={goalsTrend.at(-1)?.cumulative ?? 0}
          sparklineValues={goalsTrend.map((point) => point.matchValue)}
          tone="accent"
        />
        <MetricPulseCard
          label="Asistencias"
          value={assistsTrend.at(-1)?.cumulative ?? 0}
          sparklineValues={assistsTrend.map((point) => point.matchValue)}
          tone="brand"
        />
        <MetricPulseCard
          label="Contribución"
          value={highlights.totalContributions}
          deltaLabel={
            highlights.lastMatch
              ? `Último: +${highlights.lastMatch.goals + highlights.lastMatch.assists} vs ${highlights.lastMatch.opponent}`
              : undefined
          }
          sparklineValues={contributionTrend.map((point) => point.matchValue)}
          tone="accent"
        />
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-900">Partido a partido</h3>
        <div className="mt-4">
          <MatchTimeline rows={timelineRows} />
        </div>
      </div>
    </section>
  );
}
