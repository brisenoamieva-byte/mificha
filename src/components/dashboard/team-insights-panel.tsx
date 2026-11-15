"use client";

import Link from "next/link";
import { Crown, Medal } from "lucide-react";
import { PassportBar } from "@/components/ui/passport-bar";
import { ProgressTierBadge } from "@/components/ui/passport-score-display";
import { MiniStatCard, PassportRing } from "@/components/ui/visual-stats";
import { getPositionLabel } from "@/lib/dashboard-utils";
import { getPassportTier } from "@/lib/passport-score";
import { computeTeamAverages } from "@/lib/stats-analytics";
import { cn } from "@/lib/utils";
import type { Player, PlayerSeasonStat } from "@/types/database";

interface TeamInsightsPanelProps {
  players: Player[];
  seasonStats: PlayerSeasonStat[];
  seasonName?: string;
}

export function TeamInsightsPanel({
  players,
  seasonStats,
  seasonName,
}: TeamInsightsPanelProps) {
  const progressAverage =
    players.length === 0
      ? 0
      : Math.round(
          players.reduce((sum, player) => sum + player.passport_score, 0) /
            players.length,
        );

  const leaderboard = [...players]
    .sort((a, b) => b.passport_score - a.passport_score)
    .slice(0, 5);

  const topScorer = [...seasonStats].sort(
    (a, b) => b.total_goals - a.total_goals,
  )[0];
  const topScorerPlayer = players.find(
    (player) => player.id === topScorer?.player_id,
  );

  const teamAverages = computeTeamAverages(seasonStats);
  const totalGoals = seasonStats.reduce((sum, item) => sum + item.total_goals, 0);
  const totalMatches = seasonStats.reduce(
    (sum, item) => sum + item.total_matches,
    0,
  );

  if (players.length === 0) return null;

  return (
    <section className="min-w-0 space-y-6">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="mf-section-kicker">Rendimiento del plantel</p>
          <h2 className="mf-section-title mt-1 text-lg sm:text-xl">
            Panorama de temporada
          </h2>
          {seasonName ? (
            <p className="mt-1 truncate text-sm text-mf-text-muted">{seasonName}</p>
          ) : null}
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <MiniStatCard
          label="Progreso del plantel"
          value={getPassportTier(progressAverage).label}
          hint="Etapa promedio de completitud y participación"
        />
        <MiniStatCard
          label="Goles totales"
          value={totalGoals}
          hint={`Promedio ${teamAverages.total_goals} por jugador`}
          tone="green"
        />
        <MiniStatCard
          label="Partidos jugados"
          value={totalMatches}
          hint={`Promedio ${teamAverages.total_matches} por jugador`}
          tone="amber"
        />
        <MiniStatCard
          label="Top scorer"
          value={topScorerPlayer ? topScorer?.total_goals ?? 0 : "—"}
          hint={
            topScorerPlayer
              ? `${topScorerPlayer.first_name} ${topScorerPlayer.last_name}`
              : "Sin stats aún"
          }
          tone="slate"
        />
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-6">
        <div className="mf-card min-w-0 overflow-hidden p-4 sm:p-6">
          <div className="flex min-w-0 items-center gap-2">
            <Crown className="h-5 w-5 shrink-0 text-mf-warning" />
            <h3 className="mf-section-title min-w-0 truncate">Progreso del plantel</h3>
          </div>

          <div className="mt-5 space-y-3">
            {leaderboard.map((player, index) => (
              <Link
                key={player.id}
                href={`/fut/j/${player.slug}`}
                target="_blank"
                className="group block min-w-0 rounded-md border border-transparent p-2.5 transition hover:border-mf-border hover:bg-mf-canvas sm:p-3"
              >
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                      index === 0
                        ? "bg-mf-warning-soft text-mf-warning"
                        : "bg-mf-canvas text-mf-text-secondary",
                    )}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-mf-text group-hover:text-mf-brand">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="truncate text-xs text-mf-text-muted">
                      {getPositionLabel(player.position)}
                    </p>
                  </div>
                  <ProgressTierBadge
                    score={player.passport_score}
                    className="max-w-[5.75rem] shrink-0 truncate sm:max-w-none"
                  />
                </div>
                <div className="mt-3 min-w-0">
                  <PassportBar score={player.passport_score} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mf-card min-w-0 overflow-hidden p-4 sm:p-6">
          <div className="flex min-w-0 items-center gap-2">
            <Medal className="h-5 w-5 shrink-0 text-mf-brand" />
            <h3 className="mf-section-title min-w-0 truncate">Destacados de temporada</h3>
          </div>

          <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
            {["total_goals", "total_assists", "total_matches", "total_minutes"].map(
              (metric) => {
                const typedMetric = metric as keyof PlayerSeasonStat;
                const leader = [...seasonStats].sort(
                  (a, b) =>
                    Number(b[typedMetric] ?? 0) - Number(a[typedMetric] ?? 0),
                )[0];
                const leaderPlayer = players.find(
                  (player) => player.id === leader?.player_id,
                );

                const labels: Record<string, string> = {
                  total_goals: "Goleador",
                  total_assists: "Asistencias",
                  total_matches: "Partidos",
                  total_minutes: "Minutos",
                };

                return (
                  <div
                    key={metric}
                    className="min-w-0 rounded-md border border-mf-border-subtle bg-mf-canvas p-3 sm:p-4"
                  >
                    <p className="text-xs font-medium text-mf-text-secondary">
                      {labels[metric]}
                    </p>
                    {leaderPlayer ? (
                      <>
                        <p className="mt-2 truncate text-sm font-medium text-mf-text">
                          {leaderPlayer.first_name} {leaderPlayer.last_name}
                        </p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums text-mf-brand">
                          {leader?.[typedMetric] ?? 0}
                        </p>
                      </>
                    ) : (
                      <p className="mt-4 text-sm text-mf-text-muted">Sin datos</p>
                    )}
                  </div>
                );
              },
            )}
          </div>

          <div className="mt-6 flex w-full justify-center">
            <PassportRing score={progressAverage} size="md" />
          </div>
        </div>
      </div>
    </section>
  );
}
