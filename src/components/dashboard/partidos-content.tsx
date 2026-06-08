"use client";

import Link from "next/link";
import { CalendarPlus, Plus, Trophy } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { LeagueOfficialBanner } from "@/components/dashboard/league-official-banner";
import { MatchScheduleCard } from "@/components/marketing/match-schedule-card";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";
import { Skeleton } from "@/components/dashboard/skeletons";
import {
  formatKickoffDateTime,
  formatMatchDate,
  getMatchResultLabel,
  getMatchStatusLabel,
  isCompletedMatch,
  isUpcomingMatch,
} from "@/lib/match-utils";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Match, MatchResult, Season } from "@/types/database";

function resultBadgeClass(result: MatchResult | null) {
  if (!result) return "bg-slate-100 text-slate-600";
  if (result === "win") return "bg-green-100 text-green-700";
  if (result === "draw") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-700";
}

export function PartidosContent() {
  const { academy } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState<Season | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  const loadData = useCallback(async () => {
    if (!academy) return;

    setLoading(true);

    const { data: seasons } = await supabase
      .from("seasons")
      .select("*")
      .eq("academy_id", academy.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);

    const activeSeason = seasons?.[0] ?? null;

    setSeason(activeSeason);

    if (activeSeason) {
      const { data: matchData } = await supabase
        .from("matches")
        .select("*")
        .eq("season_id", activeSeason.id)
        .order("kickoff_at", { ascending: false, nullsFirst: false })
        .order("match_date", { ascending: false })
        .limit(30);

      setMatches(matchData ?? []);
    } else {
      setMatches([]);
    }

    setLoading(false);
  }, [academy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const upcomingMatches = useMemo(
    () =>
      matches
        .filter((match) =>
          isUpcomingMatch(match.status, match.kickoff_at, match.match_date),
        )
        .sort((a, b) => {
          const aTime = new Date(a.kickoff_at ?? `${a.match_date}T12:00:00`).getTime();
          const bTime = new Date(b.kickoff_at ?? `${b.match_date}T12:00:00`).getTime();
          return aTime - bTime;
        }),
    [matches],
  );

  const completedMatches = useMemo(
    () => matches.filter((match) => isCompletedMatch(match.status)),
    [matches],
  );

  if (!academy) {
    return <NoAcademyState />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Partidos</h1>
          <p className="mt-1 text-slate-600">
            Calendario oficial de liga + captura de stats en MiFicha
            {season ? ` · ${season.name}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/partidos/nuevo"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-4 text-sm font-semibold text-white hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Capturar resultado
          </Link>
          <Link
            href="/dashboard/partidos/programar"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <CalendarPlus className="h-4 w-4" />
            Amistoso
          </Link>
        </div>
      </div>

      <LeagueOfficialBanner academy={academy} />

      {!season && !loading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-600">
            Programa tu primer partido o captura un resultado para crear la temporada.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/partidos/programar"
              className="text-[#1B4F8C] hover:underline"
            >
              Programar partido
            </Link>
            <Link
              href="/dashboard/partidos/nuevo"
              className="text-[#1B4F8C] hover:underline"
            >
              Capturar resultado
            </Link>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Próximos partidos</h2>
            {upcomingMatches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                <p className="text-sm text-slate-500">
                  Publica fecha, hora y sede para que padres y scouts se enteren.
                </p>
                <Link
                  href="/dashboard/partidos/programar"
                  className="mt-3 inline-block text-sm font-semibold text-[#1B4F8C] hover:underline"
                >
                  Programar partido →
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {upcomingMatches.map((match) => (
                  <MatchScheduleCard
                    key={match.id}
                    match={match}
                    showCaptureLink
                    variant="light"
                  />
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-slate-900">Resultados</h2>
            </div>
            {completedMatches.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Trophy className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Sin resultados todavía
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Captura stats post-partido en menos de 60 segundos.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {completedMatches.map((match) => (
                  <Link
                    key={match.id}
                    href={`/dashboard/partidos/${match.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-5 transition-colors hover:bg-slate-50 sm:px-6"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">vs {match.opponent}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatKickoffDateTime(match.kickoff_at, match.match_date)} ·{" "}
                        {match.goals_for ?? 0}-{match.goals_against ?? 0}
                      </p>
                    </div>
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
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
