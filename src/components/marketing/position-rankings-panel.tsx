"use client";

import Link from "next/link";
import { BarChart3, Crown } from "lucide-react";
import { useMemo } from "react";
import { CategoryRequiredNotice } from "@/components/ui/category-required-notice";
import { TrendBadge } from "@/components/ui/trend-badge";
import type { RankedWeeklyPerformance } from "@/lib/ideal-xi";
import {
  buildWeeklyRankingsByPosition,
  filterWeeklyForRankings,
  getRankingScopeLabel,
  POSITION_RANKING_LABELS,
  POSITION_RANKING_ORDER,
} from "@/lib/position-rankings";
import { getPlayerInitials } from "@/lib/player-utils";
import { isCompetitionCategoryFilter } from "@/lib/player-category";
import type { PlayerPosition } from "@/types/database";

interface PositionRankingsPanelProps {
  rankedPerformances: RankedWeeklyPerformance[];
  weekLabel: string;
  state: string;
  city: string;
  categoryFilter?: string;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Crown className="h-3.5 w-3.5" />
      </span>
    );
  }

  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-mf-canvas text-xs font-semibold tabular-nums text-mf-text-secondary">
      {rank}
    </span>
  );
}

function PlayerAvatar({
  photoUrl,
  firstName,
  lastName,
}: {
  photoUrl: string | null;
  firstName: string;
  lastName: string;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt=""
        className="h-10 w-10 rounded-full object-cover ring-1 ring-mf-border"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mf-brand-soft text-xs font-semibold text-mf-brand">
      {getPlayerInitials(firstName, lastName)}
    </div>
  );
}

function WeeklyRankingRow({
  rank,
  player,
}: {
  rank: number;
  player: RankedWeeklyPerformance;
}) {
  return (
    <Link
      href={`/fut/j/${player.slug}`}
      className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-mf-canvas"
    >
      <RankBadge rank={rank} />
      <PlayerAvatar
        photoUrl={player.photo_url}
        firstName={player.first_name}
        lastName={player.last_name}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-mf-text">
          {player.first_name} {player.last_name}
        </p>
        <p className="truncate text-xs text-mf-text-muted">
          {player.goals}G · {player.assists}A · {player.academy_name}
        </p>
      </div>
      <div className="text-right">
        <p className="text-base font-semibold tabular-nums text-mf-brand">
          {Math.round(player.weekly_score)}
        </p>
        <TrendBadge trend={player.trend} compact className="mt-0.5" />
      </div>
    </Link>
  );
}

function PositionRankingCard({
  position,
  weeklyPlayers,
}: {
  position: PlayerPosition;
  weeklyPlayers: RankedWeeklyPerformance[];
}) {
  const meta = POSITION_RANKING_LABELS[position];

  return (
    <article className="mf-card flex flex-col overflow-hidden">
      <div className="border-b border-mf-border-subtle px-4 py-3">
        <div className="flex items-center gap-2">
          <span aria-hidden>{meta.emoji}</span>
          <h3 className="text-sm font-semibold text-mf-text">{meta.title}</h3>
        </div>
      </div>

      <div className="flex-1 p-2">
        {weeklyPlayers.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-mf-text-secondary">
            Sin actividad esta semana
          </p>
        ) : (
          weeklyPlayers.map((player, index) => (
            <WeeklyRankingRow
              key={player.player_id}
              rank={index + 1}
              player={player}
            />
          ))
        )}
      </div>
    </article>
  );
}

export function PositionRankingsPanel({
  rankedPerformances,
  weekLabel,
  state,
  city,
  categoryFilter = "all",
}: PositionRankingsPanelProps) {
  const scopeLabel = getRankingScopeLabel(state, city, categoryFilter);

  const weeklyRankings = useMemo(() => {
    const filtered = filterWeeklyForRankings(
      rankedPerformances,
      state,
      city,
      categoryFilter,
    );
    return buildWeeklyRankingsByPosition(filtered);
  }, [rankedPerformances, state, city, categoryFilter]);

  const hasAnyRankings = POSITION_RANKING_ORDER.some(
    (position) => weeklyRankings[position].length > 0,
  );

  if (!isCompetitionCategoryFilter(categoryFilter)) {
    return (
      <section id="rankings" className="scroll-mt-24 space-y-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-mf-brand-soft px-3 py-1 text-xs font-semibold text-mf-brand">
            <BarChart3 className="h-3.5 w-3.5" />
            Rankings por posición
          </div>
          <h2 className="mt-3 mf-section-title">Top por posición</h2>
        </div>
        <CategoryRequiredNotice title="Las referencias por posición son por categoría" />
      </section>
    );
  }

  return (
    <section id="rankings" className="scroll-mt-24 space-y-5">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-mf-brand-soft px-3 py-1 text-xs font-semibold text-mf-brand">
          <BarChart3 className="h-3.5 w-3.5" />
          Rankings por posición
        </div>
        <h2 className="mt-3 mf-section-title">
          Referencia por posición · {scopeLabel}
        </h2>
        <p className="mt-2 text-sm text-mf-text-secondary">
          Actividad de la semana {weekLabel} por posición — goles, asistencias y minutos
          registrados.
        </p>
      </div>

      {!hasAnyRankings ? (
        <div className="mf-card border-dashed p-8 text-center text-sm text-mf-text-secondary">
          Aún no hay partidos registrados esta semana para armar rankings por posición.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {POSITION_RANKING_ORDER.map((position) => (
            <PositionRankingCard
              key={position}
              position={position}
              weeklyPlayers={weeklyRankings[position]}
            />
          ))}
        </div>
      )}
    </section>
  );
}
