"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { MetricCard } from "@/components/dashboard/metric-card";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";
import { AcademyOnboardingPanel } from "@/components/dashboard/academy-onboarding-panel";
import { SubscriptionPanel } from "@/components/dashboard/subscription-panel";
import { AcademyWeeklyCompetition } from "@/components/dashboard/academy-weekly-competition";
import { TeamInsightsPanel } from "@/components/dashboard/team-insights-panel";
import {
  DashboardPageSkeleton,
  MetricCardSkeleton,
} from "@/components/dashboard/skeletons";
import { toast } from "@/components/ui/toast";
import {
  calculateAge,
  getPositionLabel,
} from "@/lib/dashboard-utils";
import { isLaunchFreeMode } from "@/lib/launch-mode";
import { supabase } from "@/lib/supabase";
import type { Player, PlayerPosition, PlayerSeasonStat } from "@/types/database";

interface DashboardStats {
  totalPlayers: number;
  seasonMatches: number;
  incompleteProfiles: number;
}

interface RecentPlayer {
  id: string;
  first_name: string;
  last_name: string;
  position: PlayerPosition;
  birth_date: string;
  passport_score: number;
  photo_url: string | null;
}

export function DashboardHome() {
  const { academy } = useDashboard();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPlayers, setRecentPlayers] = useState<RecentPlayer[]>([]);
  const [seasonStats, setSeasonStats] = useState<PlayerSeasonStat[]>([]);
  const [seasonName, setSeasonName] = useState<string | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Suscripción activada correctamente.");
    } else if (searchParams.get("canceled") === "true") {
      toast.error("Pago cancelado. Puedes intentarlo cuando quieras.");
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!academy) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [
          playersCountResult,
          activeSeasonResult,
          incompleteCountResult,
          recentPlayersResult,
        ] = await Promise.all([
          supabase
            .from("players")
            .select("*", { count: "exact", head: true })
            .eq("academy_id", academy.id),
          supabase
            .from("seasons")
            .select("id")
            .eq("academy_id", academy.id)
            .eq("is_active", true)
            .maybeSingle(),
          supabase
            .from("players")
            .select("*", { count: "exact", head: true })
            .eq("academy_id", academy.id)
            .or("photo_url.is.null,video_url.is.null"),
          supabase
            .from("players")
            .select(
              "id, first_name, last_name, position, birth_date, passport_score, photo_url",
            )
            .eq("academy_id", academy.id)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        let seasonMatches = 0;
        let nextSeasonStats: PlayerSeasonStat[] = [];

        if (activeSeasonResult.data?.id) {
          const [matchesCountResult, statsResult, seasonResult] = await Promise.all([
            supabase
              .from("matches")
              .select("*", { count: "exact", head: true })
              .eq("season_id", activeSeasonResult.data.id),
            supabase
              .from("player_season_stats")
              .select("*")
              .eq("season_id", activeSeasonResult.data.id),
            supabase
              .from("seasons")
              .select("name")
              .eq("id", activeSeasonResult.data.id)
              .single(),
          ]);

          seasonMatches = matchesCountResult.count ?? 0;
          nextSeasonStats = statsResult.data ?? [];
          setSeasonName(seasonResult.data?.name ?? null);
        } else {
          setSeasonName(null);
        }

        const { data: roster } = await supabase
          .from("players")
          .select("*")
          .eq("academy_id", academy.id);

        setAllPlayers(roster ?? []);
        setSeasonStats(nextSeasonStats);

        setStats({
          totalPlayers: playersCountResult.count ?? 0,
          seasonMatches,
          incompleteProfiles: incompleteCountResult.count ?? 0,
        });
        setRecentPlayers(recentPlayersResult.data ?? []);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [academy]);

  if (!academy) {
    return <NoAcademyState />;
  }

  if (loading) {
    return <DashboardPageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="mf-page-title">Dashboard</h1>
        <p className="mt-1 text-sm text-mf-text-secondary">
          Resumen de {academy.name}
        </p>
      </div>

      <AcademyOnboardingPanel />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats ? (
          <>
            <MetricCard
              title="Total jugadores"
              value={stats.totalPlayers}
              icon={Users}
            />
            <MetricCard
              title="Partidos esta temporada"
              value={stats.seasonMatches}
              icon={Trophy}
            />
            <MetricCard
              title="Fichas incompletas"
              value={stats.incompleteProfiles}
              icon={AlertCircle}
            />
            <MetricCard
              title={isLaunchFreeMode() ? "Acceso" : "Suscripción"}
              value=""
              icon={Sparkles}
              badge={{
                label: isLaunchFreeMode() ? "Gratuito" : "Ver planes",
                active: isLaunchFreeMode(),
              }}
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, index) => (
            <MetricCardSkeleton key={index} />
          ))
        )}
      </div>

      <SubscriptionPanel />

      <TeamInsightsPanel
        players={allPlayers}
        seasonStats={seasonStats}
        seasonName={seasonName ?? undefined}
      />

      <AcademyWeeklyCompetition academyId={academy.id} />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="mf-card p-6 lg:col-span-2">
          <h2 className="mf-section-title">
            Jugadores recientes
          </h2>

          {recentPlayers.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              Aún no hay jugadores registrados en tu plantel.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 pr-4 font-medium">Jugador</th>
                    <th className="pb-3 pr-4 font-medium">Posición</th>
                    <th className="pb-3 pr-4 font-medium">Edad</th>
                    <th className="pb-3 font-medium">PASSPORT</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPlayers.map((player) => (
                    <tr key={player.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          {player.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={player.photo_url}
                              alt={`${player.first_name} ${player.last_name}`}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                              {player.first_name[0]}
                              {player.last_name[0]}
                            </div>
                          )}
                          <span className="font-medium text-slate-900">
                            {player.first_name} {player.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        {getPositionLabel(player.position)}
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        {calculateAge(player.birth_date)} años
                      </td>
                      <td className="py-4 font-semibold text-[#1B4F8C]">
                        {player.passport_score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mf-card p-6">
          <h2 className="mf-section-title">
            Próximo partido
          </h2>
          <div className="mt-6 rounded-lg border border-dashed border-mf-border bg-mf-canvas p-6 text-center">
            <Trophy className="mx-auto h-8 w-8 text-mf-text-muted" />
            <p className="mt-3 text-sm font-medium text-mf-text">
              Sin partidos programados
            </p>
            <p className="mt-1 text-sm text-mf-text-muted">
              Aquí verás el siguiente partido de tu academia.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
