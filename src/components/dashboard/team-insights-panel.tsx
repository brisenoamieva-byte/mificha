"use client";

import Link from "next/link";
import { Crown, Medal } from "lucide-react";
import { PassportBar } from "@/components/ui/passport-bar";
import { MiniStatCard, PassportRing } from "@/components/ui/visual-stats";
import { getPositionLabel } from "@/lib/dashboard-utils";
import {
  computeTeamAverages,
  getAveragePassportScore,
} from "@/lib/stats-analytics";
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
  const passportAverage = getAveragePassportScore(
    players.map((player) => player.passport_score),
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
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mf-section-kicker">Rendimiento del plantel</p>
          <h2 className="mf-section-title mt-1 text-lg sm:text-xl">
            Panorama de temporada
          </h2>
          {seasonName ? (
            <p className="mt-1 text-sm text-mf-text-muted">{seasonName}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStatCard
          label="Passport promedio"
          value={passportAverage}
          hint="Índice general del plantel"
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

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="mf-card p-6">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-mf-warning" />
            <h3 className="mf-section-title">Ranking Passport</h3>
          </div>

          <div className="mt-5 space-y-3">
            {leaderboard.map((player, index) => (
              <Link
                key={player.id}
                href={`/j/${player.slug}`}
                target="_blank"
                className="group block rounded-md border border-transparent p-3 transition hover:border-mf-border hover:bg-mf-canvas"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold",
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
                    <p className="text-xs text-mf-text-muted">
                      {getPositionLabel(player.position)}
                    </p>
                  </div>
                  <span className="text-lg font-semibold tabular-nums text-mf-brand">
                    {player.passport_score}
                  </span>
                </div>
                <div className="mt-3">
                  <PassportBar score={player.passport_score} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mf-card p-6">
          <div className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-mf-brand" />
            <h3 className="mf-section-title">Destacados de temporada</h3>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
                    className="rounded-md border border-mf-border-subtle bg-mf-canvas p-4"
                  >
                    <p className="text-xs font-medium text-mf-text-secondary">
                      {labels[metric]}
                    </p>
                    {leaderPlayer ? (
                      <>
                        <p className="mt-2 text-sm font-medium text-mf-text">
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

          <div className="mt-6 flex items-center justify-center">
            <PassportRing score={passportAverage} label="AVG" size="lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
