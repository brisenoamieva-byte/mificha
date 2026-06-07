"use client";

import Link from "next/link";
import { Plus, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";
import { Skeleton } from "@/components/dashboard/skeletons";
import {
  formatMatchDate,
  getMatchResultLabel,
} from "@/lib/match-utils";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Match, MatchResult, Season } from "@/types/database";

function resultBadgeClass(result: MatchResult) {
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

    const { data: activeSeason } = await supabase
      .from("seasons")
      .select("*")
      .eq("academy_id", academy.id)
      .eq("is_active", true)
      .maybeSingle();

    setSeason(activeSeason);

    if (activeSeason) {
      const { data: matchData } = await supabase
        .from("matches")
        .select("*")
        .eq("season_id", activeSeason.id)
        .order("match_date", { ascending: false })
        .limit(10);

      setMatches(matchData ?? []);
    } else {
      setMatches([]);
    }

    setLoading(false);
  }, [academy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!academy) {
    return <NoAcademyState />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Partidos</h1>
          <p className="mt-1 text-slate-600">
            {season ? season.name : "Sin temporada activa"}
          </p>
        </div>

        <Link
          href="/dashboard/partidos/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-4 text-sm font-semibold text-white hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          Capturar partido
        </Link>
      </div>

      {!season && !loading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-600">
            Crea una temporada activa desde la primera captura de partido.
          </p>
          <Link
            href="/dashboard/partidos/nuevo"
            className="mt-4 inline-block text-[#1B4F8C] hover:underline"
          >
            Ir a capturar partido
          </Link>
        </div>
      ) : null}

      <div className="rounded-2xl bg-white shadow-sm">
        {loading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Trophy className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Sin partidos todavía
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Captura tu primer partido en menos de 60 segundos.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {matches.map((match) => (
              <Link
                key={match.id}
                href={`/dashboard/partidos/${match.id}`}
                className="flex items-center justify-between gap-4 px-4 py-5 transition-colors hover:bg-slate-50 sm:px-6"
              >
                <div>
                  <p className="font-semibold text-slate-900">vs {match.opponent}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatMatchDate(match.match_date)} · {match.goals_for}-
                    {match.goals_against}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    resultBadgeClass(match.result),
                  )}
                >
                  {getMatchResultLabel(match.result)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
