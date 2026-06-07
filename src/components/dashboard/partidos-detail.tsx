"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MatchScheduleCard } from "@/components/marketing/match-schedule-card";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { Skeleton } from "@/components/dashboard/skeletons";
import {
  formatKickoffDateTime,
  getMatchResultLabel,
  getMatchStatusLabel,
  isCompletedMatch,
} from "@/lib/match-utils";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Match, MatchResult, MatchStat, Player } from "@/types/database";

function resultBadgeClass(result: MatchResult | null) {
  if (!result) return "bg-emerald-100 text-emerald-700";
  if (result === "win") return "bg-green-100 text-green-700";
  if (result === "draw") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-700";
}

interface PartidosDetailProps {
  matchId: string;
}

export function PartidosDetail({ matchId }: PartidosDetailProps) {
  const [match, setMatch] = useState<Match | null>(null);
  const [stats, setStats] = useState<(MatchStat & { players: Player })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDetail = useCallback(async () => {
    setLoading(true);

    const { data: matchData } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    const { data: statsData } = await supabase
      .from("match_stats")
      .select("*, players(*)")
      .eq("match_id", matchId)
      .order("goals", { ascending: false });

    setMatch(matchData);
    setStats((statsData as (MatchStat & { players: Player })[]) ?? []);
    setLoading(false);
  }, [matchId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-slate-600">Partido no encontrado.</p>
        <Link href="/dashboard/partidos" className="mt-4 inline-block text-[#1B4F8C]">
          Volver
        </Link>
      </div>
    );
  }

  const completed = isCompletedMatch(match.status);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/partidos"
        className="text-sm font-medium text-[#1B4F8C] hover:underline"
      >
        ← Volver a partidos
      </Link>

      {completed ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">vs {match.opponent}</h1>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                resultBadgeClass(match.result),
              )}
            >
              {match.result
                ? getMatchResultLabel(match.result)
                : getMatchStatusLabel(match.status)}
            </span>
          </div>
          <p className="mt-2 text-slate-600">
            {formatKickoffDateTime(match.kickoff_at, match.match_date)} ·{" "}
            {match.goals_for ?? 0}-{match.goals_against ?? 0}
          </p>
        </div>
      ) : (
        <MatchScheduleCard match={match} showCaptureLink variant="light" />
      )}

      <div className="rounded-2xl bg-white shadow-sm">
        {stats.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            {completed
              ? "No hay stats registradas para este partido."
              : "Registra el resultado y stats cuando termine el partido."}
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6"
              >
                <div className="flex items-center gap-3">
                  <PlayerAvatar
                    firstName={stat.players.first_name}
                    lastName={stat.players.last_name}
                    photoUrl={stat.players.photo_url}
                  />
                  <div>
                    <p className="font-medium text-slate-900">
                      {stat.players.first_name} {stat.players.last_name}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <p>{stat.minutes_played} min</p>
                  <p>
                    {stat.goals}G · {stat.assists}A
                    {stat.yellow_cards ? " · 🟨" : ""}
                    {stat.red_cards ? " · 🟥" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
