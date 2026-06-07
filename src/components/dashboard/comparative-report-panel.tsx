"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { ComparisonBar } from "@/components/ui/visual-stats";
import { getPositionLabel } from "@/lib/dashboard-utils";
import {
  COMPARISON_METRICS,
  computeTeamAverages,
  getComparisonInsights,
  getMaxMetricValue,
} from "@/lib/stats-analytics";
import { cn } from "@/lib/utils";
import type { Player, PlayerSeasonStat } from "@/types/database";

interface ComparativeReportPanelProps {
  players: Player[];
  seasonStats: PlayerSeasonStat[];
  selectedPlayerId: string;
  onSelectPlayer: (playerId: string) => void;
  seasonName?: string;
}

export function ComparativeReportPanel({
  players,
  seasonStats,
  selectedPlayerId,
  onSelectPlayer,
  seasonName,
}: ComparativeReportPanelProps) {
  const selectedPlayer = players.find((player) => player.id === selectedPlayerId);
  const insights = getComparisonInsights(seasonStats, selectedPlayerId);
  const teamAverages = computeTeamAverages(seasonStats);

  if (!selectedPlayer || seasonStats.length === 0) {
    return (
      <div className="mf-card border-dashed px-6 py-12 text-center">
        <TrendingUp className="mx-auto h-8 w-8 text-mf-text-muted" />
        <p className="mt-3 text-sm font-medium text-mf-text-secondary">
          Captura partidos para generar comparativas visuales del plantel.
        </p>
      </div>
    );
  }

  const positiveMetrics = insights.filter(
    (item) =>
      item.metric !== "total_yellow_cards" &&
      item.metric !== "total_red_cards" &&
      item.delta > 0,
  ).length;

  return (
    <section className="mf-card overflow-hidden">
      <div className="border-b border-mf-border-subtle px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mf-section-kicker">Reporte comparativo</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-mf-text">
              {selectedPlayer.first_name} vs plantel
            </h2>
            {seasonName ? (
              <p className="mt-1 text-sm text-mf-text-muted">{seasonName}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-mf-border-subtle bg-mf-canvas px-4 py-3">
            <PlayerAvatar
              firstName={selectedPlayer.first_name}
              lastName={selectedPlayer.last_name}
              photoUrl={selectedPlayer.photo_url}
              size="md"
            />
            <div>
              <p className="font-medium text-mf-text">
                {selectedPlayer.first_name} {selectedPlayer.last_name}
              </p>
              <p className="text-sm text-mf-text-secondary">
                {getPositionLabel(selectedPlayer.position)} · Passport{" "}
                {selectedPlayer.passport_score}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-mf-border-subtle px-5 py-4 sm:px-6">
        <p className="mb-3 text-sm font-medium text-mf-text-secondary">
          Selecciona jugador
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {players.map((player) => {
            const active = player.id === selectedPlayerId;

            return (
              <button
                key={player.id}
                type="button"
                onClick={() => onSelectPlayer(player.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition",
                  active
                    ? "border-mf-brand bg-mf-brand-soft text-mf-brand"
                    : "border-mf-border bg-mf-surface text-mf-text-secondary hover:border-mf-brand/30 hover:text-mf-text",
                )}
              >
                <PlayerAvatar
                  firstName={player.first_name}
                  lastName={player.last_name}
                  photoUrl={player.photo_url}
                  size="sm"
                />
                {player.first_name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-px border-b border-mf-border-subtle bg-mf-border-subtle sm:grid-cols-3">
        <div className="bg-mf-surface px-5 py-4 text-center">
          <p className="text-xs font-medium text-mf-text-secondary">Sobre promedio</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-mf-success">
            {positiveMetrics}
          </p>
        </div>
        <div className="bg-mf-surface px-5 py-4 text-center">
          <p className="text-xs font-medium text-mf-text-secondary">Promedio goles</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-mf-brand">
            {teamAverages.total_goals}
          </p>
        </div>
        <div className="bg-mf-surface px-5 py-4 text-center">
          <p className="text-xs font-medium text-mf-text-secondary">Mejor ranking</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-mf-text">
            #{Math.min(...insights.map((item) => item.rank))}
          </p>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {COMPARISON_METRICS.map(({ key, label }) => {
          const insight = insights.find((item) => item.metric === key);
          if (!insight) return null;

          const invert =
            key === "total_yellow_cards" || key === "total_red_cards";

          return (
            <ComparisonBar
              key={key}
              label={label}
              playerValue={insight.playerValue}
              teamAverage={insight.teamAverage}
              maxValue={getMaxMetricValue(seasonStats, key)}
              rank={insight.rank}
              totalPlayers={insight.totalPlayers}
              delta={insight.delta}
              invertColors={invert}
              accentClassName={
                invert
                  ? insight.playerValue <= insight.teamAverage
                    ? "bg-mf-success"
                    : "bg-mf-warning"
                  : "bg-mf-brand"
              }
            />
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-mf-border-subtle bg-mf-canvas px-5 py-4 sm:px-6">
        <p className="text-sm text-mf-text-secondary">
          Base visual del reporte que reciben los padres.
        </p>
        <Link
          href={`/j/${selectedPlayer.slug}`}
          target="_blank"
          className="text-sm font-semibold text-mf-brand hover:underline"
        >
          Ver ficha pública →
        </Link>
      </div>
    </section>
  );
}
