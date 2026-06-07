"use client";

import Link from "next/link";
import { Crown, Flame, Trophy } from "lucide-react";
import { useMemo } from "react";
import { TrendBadge } from "@/components/ui/trend-badge";
import { getPositionLabel } from "@/lib/dashboard-utils";
import type { RankedWeeklyPerformance } from "@/lib/competition";
import { locationMatches } from "@/lib/mexico-locations";
import { matchesCategoryFilter, parseCategoryFilter } from "@/lib/player-category";
import { getPlayerInitials } from "@/lib/player-utils";

interface WeeklyCompetitionPanelsProps {
  ranked: RankedWeeklyPerformance[];
  rising: RankedWeeklyPerformance[];
  leaderboard: RankedWeeklyPerformance[];
  weekLabel: string;
  state: string;
  city: string;
  categoryFilter: string;
}

function filterRanked(
  ranked: RankedWeeklyPerformance[],
  state: string,
  city: string,
  categoryFilter: string,
) {
  const category = parseCategoryFilter(categoryFilter);

  return ranked.filter((player) => {
    if (state && !locationMatches(player.academy_state, state)) return false;
    if (city && !locationMatches(player.academy_city, city)) return false;
    if (!matchesCategoryFilter(player.birth_date, category)) return false;
    return true;
  });
}

function RankAvatar({
  player,
}: {
  player: RankedWeeklyPerformance;
}) {
  if (player.photo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={player.photo_url}
        alt=""
        className="h-11 w-11 rounded-full object-cover ring-1 ring-mf-border"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-mf-brand-soft text-xs font-semibold text-mf-brand">
      {getPlayerInitials(player.first_name, player.last_name)}
    </div>
  );
}

export function WeeklyCompetitionPanels({
  ranked,
  rising,
  leaderboard,
  weekLabel,
  state,
  city,
  categoryFilter,
}: WeeklyCompetitionPanelsProps) {
  const filteredRanked = useMemo(
    () => filterRanked(ranked, state, city, categoryFilter),
    [ranked, state, city, categoryFilter],
  );

  const filteredLeaderboard = useMemo(
    () => filterRanked(leaderboard, state, city, categoryFilter).slice(0, 10),
    [leaderboard, state, city, categoryFilter],
  );

  const filteredRising = useMemo(() => {
    const ids = new Set(filteredRanked.map((player) => player.player_id));
    return rising
      .filter((player) => ids.has(player.player_id))
      .slice(0, 6);
  }, [rising, filteredRanked]);

  if (filteredRanked.length === 0) {
    return (
      <div className="mf-card border-dashed p-8 text-center text-sm text-mf-text-secondary">
        Aún no hay partidos esta semana para armar el marcador competitivo.
        Cuando las academias registren resultados, verás quién sube y quién lidera.
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <section className="mf-card overflow-hidden">
        <div className="border-b border-mf-border-subtle px-5 py-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-mf-brand-soft px-3 py-1 text-xs font-semibold text-mf-brand">
            <Trophy className="h-3.5 w-3.5" />
            Marcador de la semana
          </div>
          <h2 className="mt-3 mf-section-title">Top 10 · {weekLabel}</h2>
          <p className="mt-1 text-sm text-mf-text-secondary">
            Puntos = goles×5 + asistencias×3 + bonus por minutos jugados.
          </p>
        </div>

        <div className="divide-y divide-mf-border-subtle">
          {filteredLeaderboard.map((player) => (
            <Link
              key={player.player_id}
              href={`/j/${player.slug}`}
              className="flex items-center gap-4 px-5 py-4 transition hover:bg-mf-canvas"
            >
              <span
                className={
                  player.rank === 1
                    ? "inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700"
                    : "inline-flex h-8 w-8 items-center justify-center text-sm font-semibold tabular-nums text-mf-text-secondary"
                }
              >
                {player.rank === 1 ? <Crown className="h-4 w-4" /> : player.rank}
              </span>
              <RankAvatar player={player} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-mf-text">
                  {player.first_name} {player.last_name}
                </p>
                <p className="text-xs text-mf-text-muted">
                  {getPositionLabel(player.position)} · {player.goals}G ·{" "}
                  {player.assists}A · {player.academy_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold tabular-nums text-mf-brand">
                  {Math.round(player.weekly_score)}
                </p>
                <TrendBadge trend={player.trend} compact />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mf-card p-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-mf-warning-soft px-3 py-1 text-xs font-semibold text-mf-warning">
          <Flame className="h-3.5 w-3.5" />
          En tendencia
        </div>
        <h2 className="mt-3 mf-section-title">Subiendo esta semana</h2>
        <p className="mt-1 text-sm text-mf-text-secondary">
          Jugadores con mayor salto vs la semana anterior.
        </p>

        {filteredRising.length === 0 ? (
          <p className="mt-6 text-sm text-mf-text-secondary">
            Nadie con momentum fuerte todavía. Vuelve después del próximo fin de semana.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {filteredRising.map((player) => (
              <Link
                key={player.player_id}
                href={`/j/${player.slug}`}
                className="flex items-center gap-3 rounded-lg border border-mf-border-subtle px-3 py-3 transition hover:border-mf-brand/30 hover:bg-mf-canvas"
              >
                <RankAvatar player={player} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-mf-text">
                    {player.first_name} {player.last_name}
                  </p>
                  <p className="text-xs text-mf-text-muted">
                    {Math.round(player.weekly_score)} pts esta semana
                  </p>
                </div>
                <TrendBadge trend={player.trend} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
