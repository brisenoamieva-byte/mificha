"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Flame } from "lucide-react";
import { ComparativeReportPanel } from "@/components/dashboard/comparative-report-panel";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { PassportScoreDisplay } from "@/components/ui/passport-score-display";
import {
  AreaTrendChart,
  MatchTimeline,
  MetricPulseCard,
} from "@/components/ui/performance-charts";
import { CategoryFilterSelect } from "@/components/ui/category-filter-select";
import { getPositionLabel } from "@/lib/dashboard-utils";
import {
  buildTrendSeries,
  getPerformanceHighlights,
  getResultTone,
  normalizeMatchPerformanceRows,
} from "@/lib/performance-analytics";
import {
  getCategoryFilterLabel,
  matchesCategoryFilter,
  parseCategoryFilter,
} from "@/lib/player-category";
import { getPassportTier } from "@/lib/passport-score";
import { getComparisonInsights } from "@/lib/stats-analytics";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Player, PlayerSeasonStat, Season } from "@/types/database";

interface PerformancePlayerPanelProps {
  academyId: string;
  players: Player[];
  seasons: Season[];
  seasonStats: PlayerSeasonStat[];
  initialSeasonId: string;
}

export function PerformancePlayerPanel({
  academyId,
  players,
  seasons,
  seasonStats,
  initialSeasonId,
}: PerformancePlayerPanelProps) {
  const [seasonId, setSeasonId] = useState(initialSeasonId);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [panelSeasonStats, setPanelSeasonStats] = useState(seasonStats);
  const [matchRows, setMatchRows] = useState(
    normalizeMatchPerformanceRows([]),
  );
  const [loadingMatches, setLoadingMatches] = useState(false);

  const birthDates = useMemo(
    () => players.map((player) => player.birth_date),
    [players],
  );

  const filteredPlayers = useMemo(() => {
    const category = parseCategoryFilter(categoryFilter);
    return players.filter((player) =>
      matchesCategoryFilter(player.birth_date, category),
    );
  }, [players, categoryFilter]);

  useEffect(() => {
    setPanelSeasonStats(seasonStats);
  }, [seasonStats]);

  useEffect(() => {
    if (!seasonId) {
      setPanelSeasonStats([]);
      return;
    }

    let cancelled = false;

    void (async () => {
      const { data } = await supabase
        .from("player_season_stats")
        .select("*")
        .eq("season_id", seasonId);

      if (!cancelled) {
        setPanelSeasonStats(data ?? []);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [seasonId]);

  const filteredSeasonStats = useMemo(() => {
    const ids = new Set(filteredPlayers.map((player) => player.id));
    return panelSeasonStats.filter((stat) => ids.has(stat.player_id));
  }, [filteredPlayers, panelSeasonStats]);

  const selectedPlayer =
    filteredPlayers.find((player) => player.id === selectedPlayerId) ??
    filteredPlayers[0] ??
    null;

  const selectedSeason = seasons.find((season) => season.id === seasonId);
  const categoryLabel = getCategoryFilterLabel(parseCategoryFilter(categoryFilter));

  useEffect(() => {
    if (
      selectedPlayerId &&
      filteredPlayers.some((player) => player.id === selectedPlayerId)
    ) {
      return;
    }
    setSelectedPlayerId(filteredPlayers[0]?.id ?? "");
  }, [filteredPlayers, selectedPlayerId]);

  const loadMatchPerformance = useCallback(async () => {
    if (!selectedPlayer || !seasonId) {
      setMatchRows([]);
      return;
    }

    setLoadingMatches(true);

    const { data } = await supabase
      .from("match_stats")
      .select(
        "goals, assists, minutes_played, yellow_cards, red_cards, matches!inner(id, opponent, match_date, result, goals_for, goals_against, season_id, academy_id)",
      )
      .eq("player_id", selectedPlayer.id)
      .eq("matches.season_id", seasonId)
      .eq("matches.academy_id", academyId);

    setMatchRows(normalizeMatchPerformanceRows(data ?? []));
    setSelectedMatchId(null);
    setLoadingMatches(false);
  }, [academyId, seasonId, selectedPlayer]);

  useEffect(() => {
    void loadMatchPerformance();
  }, [loadMatchPerformance]);

  const insights = useMemo(
    () =>
      selectedPlayer
        ? getComparisonInsights(filteredSeasonStats, selectedPlayer.id)
        : [],
    [filteredSeasonStats, selectedPlayer],
  );

  const highlights = useMemo(
    () => getPerformanceHighlights(matchRows, insights),
    [matchRows, insights],
  );

  const goalsTrend = buildTrendSeries(matchRows, "goals");
  const assistsTrend = buildTrendSeries(matchRows, "assists");
  const minutesTrend = buildTrendSeries(matchRows, "minutes");
  const contributionTrend = buildTrendSeries(matchRows, "contributions");

  const timelineRows = matchRows.map((row) => ({
    matchId: row.matchId,
    matchDate: row.matchDate,
    opponent: row.opponent,
    goals: row.goals,
    assists: row.assists,
    minutes: row.minutes,
    result: getResultTone(row.result),
  }));

  const tier = selectedPlayer ? getPassportTier(selectedPlayer.passport_score) : null;

  if (players.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-mf-border bg-mf-surface px-6 py-12 text-center">
        <p className="text-sm text-mf-text-secondary">
          Carga jugadores en Plantel para ver gráficas de rendimiento.
        </p>
        <Link href="/dashboard/plantel" className="mf-btn-primary mt-4 inline-flex">
          Ir a plantel
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <CategoryFilterSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          birthDates={birthDates}
          hint="Comparativas y rankings usan la categoría seleccionada."
        />
        <label className="block">
          <span className="text-sm font-medium text-mf-text-secondary">Temporada</span>
          <select
            value={seasonId}
            onChange={(event) => setSeasonId(event.target.value)}
            className="mf-input mt-2"
          >
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
                {season.is_active ? " (activa)" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedPlayer && tier ? (
        <section className="relative overflow-hidden rounded-2xl border border-mf-accent/20 bg-gradient-to-br from-[#0a1f3d] via-[#0f2d52] to-[#123d68] p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_2px,transparent_2px,transparent_10px)]" />
          <div className="pointer-events-none absolute -right-8 top-0 h-40 w-40 rounded-full bg-mf-accent/15 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mf-accent-bright">
                Tu centro de progreso
              </p>
              <div className="mt-4 flex items-center gap-4">
                <PlayerAvatar
                  firstName={selectedPlayer.first_name}
                  lastName={selectedPlayer.last_name}
                  photoUrl={selectedPlayer.photo_url}
                  size="lg"
                />
                <div>
                  <h2 className="text-2xl font-semibold tracking-[-0.02em]">
                    {selectedPlayer.first_name} {selectedPlayer.last_name}
                  </h2>
                  <p className="mt-1 text-sm text-white/70">
                    {getPositionLabel(selectedPlayer.position)}
                    {categoryLabel ? ` · ${categoryLabel}` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-black/15 px-4 py-3">
                  <p className="text-xs text-white/55">Sobre el promedio</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-mf-accent-bright">
                    {highlights.positiveMetrics}
                  </p>
                  <p className="text-xs text-white/45">métricas</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/15 px-4 py-3">
                  <p className="text-xs text-white/55">Partidos</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {highlights.totalMatches}
                  </p>
                  <p className="text-xs text-white/45">capturados</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/15 px-4 py-3">
                  <p className="text-xs text-white/55">Racha reciente</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-mf-accent-bright">
                    +{highlights.recentForm}
                  </p>
                  <p className="text-xs text-white/45">G+A últimos 3</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <PassportScoreDisplay
                score={selectedPlayer.passport_score}
                variant="compact"
                surface="dark"
                scoreLabel="Progreso verificado"
                className="w-[160px]"
              />
              <AreaTrendChart
                values={contributionTrend.map((point) => point.cumulative)}
                labels={[
                  contributionTrend[0]?.label ?? "Inicio",
                  contributionTrend[contributionTrend.length - 1]?.label ?? "Hoy",
                ]}
              />
            </div>
          </div>
        </section>
      ) : null}

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2">
          {filteredPlayers.map((player) => {
            const active = player.id === selectedPlayer?.id;
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => setSelectedPlayerId(player.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition",
                  active
                    ? "border-mf-accent bg-mf-accent-soft text-mf-accent-dark shadow-sm"
                    : "border-mf-border bg-mf-surface text-mf-text-secondary hover:border-mf-accent/30",
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricPulseCard
          label="Goles acumulados"
          value={goalsTrend.at(-1)?.cumulative ?? 0}
          hint={
            highlights.bestMatch
              ? `Mejor: vs ${highlights.bestMatch.opponent}`
              : "Sin partidos"
          }
          sparklineValues={goalsTrend.map((point) => point.matchValue)}
          tone="accent"
        />
        <MetricPulseCard
          label="Asistencias"
          value={assistsTrend.at(-1)?.cumulative ?? 0}
          sparklineValues={assistsTrend.map((point) => point.matchValue)}
          tone="brand"
        />
        <MetricPulseCard
          label="Minutos"
          value={minutesTrend.at(-1)?.cumulative ?? 0}
          sparklineValues={minutesTrend.map((point) => point.matchValue)}
          tone="amber"
        />
        <MetricPulseCard
          label="Contribución total"
          value={highlights.totalContributions}
          deltaLabel={
            highlights.lastMatch
              ? `Último: +${highlights.lastMatch.goals + highlights.lastMatch.assists} vs ${highlights.lastMatch.opponent}`
              : undefined
          }
          sparklineValues={contributionTrend.map((point) => point.matchValue)}
          tone="accent"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="mf-card p-5">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-mf-accent-dark" />
            <h3 className="mf-section-title">Partido a partido</h3>
          </div>
          <p className="mt-1 text-sm text-mf-text-secondary">
            Toca un juego para resaltarlo. Cada barra refleja participación.
          </p>
          <div className={cn("mt-5", loadingMatches && "opacity-50")}>
            <MatchTimeline
              rows={timelineRows}
              selectedMatchId={selectedMatchId}
              onSelect={setSelectedMatchId}
            />
          </div>
        </section>

        <ComparativeReportPanel
          players={filteredPlayers}
          seasonStats={filteredSeasonStats}
          selectedPlayerId={selectedPlayer?.id ?? ""}
          onSelectPlayer={setSelectedPlayerId}
          seasonName={selectedSeason?.name}
          categoryLabel={categoryLabel}
        />
      </div>
    </div>
  );
}
