"use client";

import Link from "next/link";
import { Flame, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { TrendBadge } from "@/components/ui/trend-badge";
import { getPositionLabel } from "@/lib/dashboard-utils";
import {
  getPreviousWeekRange,
  getWeekRangeFromReference,
  rankAcademyWeeklyRows,
  type AcademyWeeklyRow,
} from "@/lib/competition";
import { fetchAcademyWeekStats } from "@/lib/academy-weekly-stats";
import { supabase } from "@/lib/supabase";
import { getPlayerInitials } from "@/lib/player-utils";

interface AcademyWeeklyCompetitionProps {
  academyId: string;
}

export function AcademyWeeklyCompetition({ academyId }: AcademyWeeklyCompetitionProps) {
  const [rows, setRows] = useState<AcademyWeeklyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    const currentWeek = getWeekRangeFromReference();
    const previousWeek = getPreviousWeekRange();

    const [current, previous] = await Promise.all([
      fetchAcademyWeekStats(supabase, academyId, currentWeek.start, currentWeek.end),
      fetchAcademyWeekStats(supabase, academyId, previousWeek.start, previousWeek.end),
    ]);

    setRows(rankAcademyWeeklyRows(current, previous));
    setLoading(false);
  }, [academyId]);

  useEffect(() => {
    load();
  }, [load]);

  const rising = rows.filter(
    (player) => player.trend.direction === "up" || player.trend.direction === "new",
  );

  if (loading) {
    return (
      <div className="mf-card p-6 text-sm text-mf-text-secondary">
        Cargando marcador semanal del plantel...
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="mf-card border-dashed p-6">
        <p className="text-sm font-medium text-mf-text">Actividad semanal del plantel</p>
        <p className="mt-2 text-sm text-mf-text-secondary">
          Registra partidos esta semana para ver destacados internos por categoría.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="mf-section-kicker">Actividad semanal</p>
        <h2 className="mt-1 mf-section-title">Destacados del plantel</h2>
        <p className="mt-1 text-sm text-mf-text-secondary">
          Referencia interna por categoría — celebra participación, no presión.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="mf-card overflow-hidden">
          <div className="border-b border-mf-border-subtle px-5 py-4">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-mf-brand">
              <Trophy className="h-4 w-4" />
              Top plantel
            </div>
          </div>
          <div className="divide-y divide-mf-border-subtle">
            {rows.slice(0, 8).map((player) => (
              <div key={player.player_id} className="flex items-center gap-4 px-5 py-4">
                <span className="w-6 text-sm font-semibold tabular-nums text-mf-text-secondary">
                  {player.rank}
                </span>
                {player.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={player.photo_url}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-mf-border"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mf-brand-soft text-xs font-semibold text-mf-brand">
                    {getPlayerInitials(player.first_name, player.last_name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/j/${player.slug}`}
                    target="_blank"
                    className="truncate font-semibold text-mf-text hover:text-mf-brand"
                  >
                    {player.first_name} {player.last_name}
                  </Link>
                  <p className="text-xs text-mf-text-muted">
                    {getPositionLabel(player.position)} · {player.goals}G · {player.assists}A
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold tabular-nums text-mf-brand">
                    {Math.round(player.weekly_score)}
                  </p>
                  <TrendBadge trend={player.trend} compact />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mf-card p-5">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-mf-warning">
            <Flame className="h-4 w-4" />
            En racha
          </div>
          {rising.length === 0 ? (
            <p className="mt-4 text-sm text-mf-text-secondary">
              Sin subidas marcadas vs la semana anterior.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {rising.slice(0, 5).map((player) => (
                <div key={player.player_id} className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium text-mf-text">
                    {player.first_name} {player.last_name.charAt(0)}.
                  </p>
                  <TrendBadge trend={player.trend} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
