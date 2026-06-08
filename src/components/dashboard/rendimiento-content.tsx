"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BarChart3, LineChart, Mail, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { AcademyWeeklyCompetition } from "@/components/dashboard/academy-weekly-competition";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";
import { ParticipatingAcademiesStrip } from "@/components/dashboard/participating-academies-strip";
import { PerformancePlayerPanel } from "@/components/dashboard/performance-player-panel";
import { ReportesContent } from "@/components/dashboard/reportes-content";
import { TeamInsightsPanel } from "@/components/dashboard/team-insights-panel";
import { Skeleton } from "@/components/dashboard/skeletons";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Player, PlayerSeasonStat, Season } from "@/types/database";

type RendimientoTab = "progreso" | "plantel" | "enviar";

const tabs: { id: RendimientoTab; label: string; icon: typeof LineChart }[] = [
  { id: "progreso", label: "Progreso", icon: LineChart },
  { id: "plantel", label: "Plantel", icon: Users },
  { id: "enviar", label: "Enviar reportes", icon: Mail },
];

export function RendimientoContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as RendimientoTab) || "progreso";
  const { academy } = useDashboard();
  const [tab, setTab] = useState<RendimientoTab>(
    tabs.some((item) => item.id === initialTab) ? initialTab : "progreso",
  );
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [seasonStats, setSeasonStats] = useState<PlayerSeasonStat[]>([]);
  const [activeSeasonId, setActiveSeasonId] = useState("");

  const loadData = useCallback(async () => {
    if (!academy) return;

    setLoading(true);

    const [{ data: seasonData }, { data: playerData }] = await Promise.all([
      supabase
        .from("seasons")
        .select("*")
        .eq("academy_id", academy.id)
        .order("start_date", { ascending: false }),
      supabase
        .from("players")
        .select("*")
        .eq("academy_id", academy.id)
        .order("last_name", { ascending: true }),
    ]);

    const nextSeasons = seasonData ?? [];
    const activeSeason =
      nextSeasons.find((season) => season.is_active) ?? nextSeasons[0] ?? null;

    setSeasons(nextSeasons);
    setPlayers(playerData ?? []);
    setActiveSeasonId(activeSeason?.id ?? "");

    if (activeSeason?.id) {
      const { data: statsData } = await supabase
        .from("player_season_stats")
        .select("*")
        .eq("season_id", activeSeason.id);

      setSeasonStats(statsData ?? []);
    } else {
      setSeasonStats([]);
    }

    setLoading(false);
  }, [academy]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const activeSeasonName = useMemo(
    () => seasons.find((season) => season.id === activeSeasonId)?.name,
    [seasons, activeSeasonId],
  );

  if (!academy) return <NoAcademyState />;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-[520px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-mf-brand/15 bg-gradient-to-r from-mf-brand-dark via-mf-brand to-[#1a5fa8] px-6 py-8 text-white shadow-lg sm:px-8">
        <div className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-mf-accent/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mf-accent-bright">
              Rendimiento · engagement
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
              Progreso que emociona
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
              Gráficas vivas, comparativas por categoría y evolución partido a
              partido. Lo que padres y jugadores quieren revisar una y otra vez.
            </p>
          </div>
          <Link
            href="/dashboard/partidos/nuevo"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-mf-brand transition hover:bg-white/95"
          >
            <BarChart3 className="h-4 w-4" />
            Capturar partido
          </Link>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 rounded-xl border border-mf-border bg-mf-surface p-1.5">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition",
              tab === id
                ? "bg-mf-accent-soft text-mf-accent-dark shadow-sm"
                : "text-mf-text-secondary hover:bg-mf-canvas hover:text-mf-text",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "progreso" ? (
        <PerformancePlayerPanel
          academyId={academy.id}
          players={players}
          seasons={seasons}
          seasonStats={seasonStats}
          initialSeasonId={activeSeasonId}
        />
      ) : null}

      {tab === "plantel" ? (
        <div className="space-y-6">
          <ParticipatingAcademiesStrip currentAcademyId={academy.id} />
          <TeamInsightsPanel
            players={players}
            seasonStats={seasonStats}
            seasonName={activeSeasonName}
          />
          <AcademyWeeklyCompetition academyId={academy.id} />
        </div>
      ) : null}

      {tab === "enviar" ? <ReportesContent embedded /> : null}
    </div>
  );
}
