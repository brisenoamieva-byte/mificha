"use client";

import Link from "next/link";
import { Award, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CategoryFilterSelect } from "@/components/ui/category-filter-select";
import { MexicoLocationSelect } from "@/components/ui/mexico-location-select";
import { IdealXIPanel } from "@/components/marketing/ideal-xi-panel";
import { WeeklyCompetitionPanels } from "@/components/marketing/weekly-competition-panels";
import { PositionRankingsPanel } from "@/components/marketing/position-rankings-panel";
import { ExplorePlayerCard } from "@/components/marketing/explore-player-card";
import {
  DEMO_EXPLORE_ACADEMY,
  DEMO_EXPLORE_PLAYERS,
  filterDemoExploreAcademy,
  filterDemoExplorePlayers,
  normalizeExplorePlayerName,
  type ExploreDemoPlayer,
} from "@/lib/explore-demo-data";
import type { RankedWeeklyPerformance, WeeklyPlayerPerformance } from "@/lib/ideal-xi";
import { collectBirthDatesFromDirectory } from "@/lib/player-category";
import {
  filterDirectory,
  isDevSeedPlayer,
  type DirectoryPlayer,
  type PublicDirectoryData,
} from "@/lib/public-directory";
import { cn } from "@/lib/utils";
import type { PlayerPosition } from "@/types/database";

type ExploreView = "directorio" | "semana";

interface ExploreDirectoryProps {
  data: PublicDirectoryData;
  weeklyPerformances: WeeklyPlayerPerformance[];
  rankedPerformances: RankedWeeklyPerformance[];
  risingPerformances: RankedWeeklyPerformance[];
  leaderboard: RankedWeeklyPerformance[];
  weekLabel: string;
  initialCategoryFilter?: string;
}

const positionOptions: { value: PlayerPosition | "all"; label: string }[] = [
  { value: "all", label: "Todas las posiciones" },
  { value: "goalkeeper", label: "Portero" },
  { value: "defender", label: "Defensa" },
  { value: "midfielder", label: "Mediocampista" },
  { value: "forward", label: "Delantero" },
];

export function ExploreDirectory({
  data,
  weeklyPerformances,
  rankedPerformances,
  risingPerformances,
  leaderboard,
  weekLabel,
  initialCategoryFilter = "all",
}: ExploreDirectoryProps) {
  const [view, setView] = useState<ExploreView>("directorio");
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<PlayerPosition | "all">("all");
  const [minPassport, setMinPassport] = useState(0);
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter);

  const birthDates = useMemo(
    () => [
      ...collectBirthDatesFromDirectory(data.players, weeklyPerformances),
      ...DEMO_EXPLORE_PLAYERS.map((player) => player.birth_date),
    ],
    [data.players, weeklyPerformances],
  );

  const filtered = useMemo(
    () =>
      filterDirectory(data, query, position, minPassport, state, city, categoryFilter),
    [data, query, position, minPassport, state, city, categoryFilter],
  );

  const filteredDemos = useMemo(
    () =>
      filterDemoExplorePlayers(
        DEMO_EXPLORE_PLAYERS,
        query,
        position,
        minPassport,
        state,
        city,
        categoryFilter,
      ),
    [query, position, minPassport, state, city, categoryFilter],
  );

  const displayPlayers = useMemo(() => {
    const realPlayers = filtered.players.filter((player) => !isDevSeedPlayer(player));
    const realSlugs = new Set(realPlayers.map((player) => player.slug));
    const demos = filteredDemos.filter((player) => !realSlugs.has(player.slug));

    const seenNames = new Set<string>();
    const merged: Array<DirectoryPlayer | ExploreDemoPlayer> = [];

    for (const player of [...demos, ...realPlayers]) {
      const nameKey = normalizeExplorePlayerName(player.first_name, player.last_name);
      if (seenNames.has(nameKey)) continue;
      seenNames.add(nameKey);
      merged.push(player);
    }

    return merged;
  }, [filtered.players, filteredDemos]);

  const displayAcademies = useMemo(() => {
    const realAcademies = filtered.academies.filter(
      (academy) => academy.slug !== DEMO_EXPLORE_ACADEMY.slug,
    );
    const includeDemo = filterDemoExploreAcademy(query, state, city);

    return includeDemo ? [DEMO_EXPLORE_ACADEMY, ...realAcademies] : realAcademies;
  }, [filtered.academies, query, state, city]);

  useEffect(() => {
    const syncViewFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (["destacados", "ideal-11", "rankings", "semana"].includes(hash)) {
        setView("semana");
      }
    };

    syncViewFromHash();
    window.addEventListener("hashchange", syncViewFromHash);
    return () => window.removeEventListener("hashchange", syncViewFromHash);
  }, []);

  return (
    <div className="space-y-6">
      <div className="mf-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-mf-text-secondary">
            Fichas con consentimiento parental · stats del torneo · Temporada 2026
          </p>
          <div className="flex gap-1 rounded-lg border border-mf-border bg-mf-canvas p-1">
            {(
              [
                { id: "directorio" as const, label: "Directorio", count: displayPlayers.length },
                { id: "semana" as const, label: "Esta semana", count: null },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setView(tab.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-semibold transition",
                  view === tab.id
                    ? "bg-white text-mf-brand shadow-sm"
                    : "text-mf-text-secondary hover:text-mf-text",
                )}
              >
                {tab.label}
                {tab.count != null ? (
                  <span className="ml-1.5 tabular-nums text-mf-text-muted">({tab.count})</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block sm:col-span-2 lg:col-span-2">
            <span className="sr-only">Buscar</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mf-text-muted" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar jugador, academia o ciudad"
                className="mf-input pl-10"
              />
            </div>
          </label>

          <label className="block">
            <span className="sr-only">Posición</span>
            <select
              value={position}
              onChange={(event) =>
                setPosition(event.target.value as PlayerPosition | "all")
              }
              className="mf-input"
            >
              {positionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Perfil mínimo</span>
            <select
              value={minPassport}
              onChange={(event) => setMinPassport(Number(event.target.value))}
              className="mf-input"
            >
              <option value={0}>Perfil: cualquiera</option>
              <option value={50}>Perfil 50+</option>
              <option value={70}>Perfil 70+</option>
              <option value={80}>Perfil 80+</option>
            </select>
          </label>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <CategoryFilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            birthDates={birthDates}
            hint="Obligatorio para rankings semanales."
          />
          <MexicoLocationSelect
            allowAll
            state={state}
            city={city}
            onStateChange={(nextState) => {
              setState(nextState);
              if (!nextState) setCity("");
            }}
            onCityChange={setCity}
          />
        </div>
      </div>

      {view === "directorio" ? (
        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="mf-section-title">Jugadores</h2>
              <span className="text-sm text-mf-text-muted">
                {displayPlayers.length} resultados
              </span>
            </div>

            {displayPlayers.length === 0 ? (
              <div className="mf-card border-dashed p-8 text-center text-sm text-mf-text-secondary">
                No hay jugadores que coincidan con tu búsqueda.
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {displayPlayers.map((player) => (
                  <ExplorePlayerCard key={player.slug} player={player} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3 border-t border-mf-border-subtle pt-8">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-base font-semibold text-mf-text">Academias certificadas</h2>
              <span className="text-sm text-mf-text-muted">
                {displayAcademies.length} resultados
              </span>
            </div>

            {displayAcademies.length === 0 ? (
              <p className="text-sm text-mf-text-secondary">
                No hay academias que coincidan con tu búsqueda.
              </p>
            ) : (
              <ul className="divide-y divide-mf-border-subtle rounded-xl border border-mf-border bg-white">
                {displayAcademies.map((academy) => (
                  <li key={academy.id}>
                    <Link
                      href={`/a/${academy.slug}`}
                      className="flex items-center gap-3 px-4 py-3 transition hover:bg-mf-canvas"
                    >
                      {academy.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={academy.logo_url}
                          alt=""
                          className="h-9 w-9 rounded-md bg-white object-contain p-0.5 ring-1 ring-mf-border"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-mf-brand-soft text-xs font-semibold text-mf-brand">
                          {academy.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-mf-text">
                          {academy.name}
                        </p>
                        {[academy.city, academy.state].filter(Boolean).length > 0 ? (
                          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-mf-text-muted">
                            <MapPin className="h-3 w-3" />
                            {[academy.city, academy.state].filter(Boolean).join(", ")}
                          </p>
                        ) : null}
                      </div>
                      {academy.is_certified ? (
                        <span className="hidden shrink-0 items-center gap-1 text-[11px] font-medium text-mf-accent-dark sm:inline-flex">
                          <Award className="h-3.5 w-3.5" />
                          Certificada
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <div id="destacados" className="scroll-mt-24 space-y-10">
          <WeeklyCompetitionPanels
            ranked={rankedPerformances}
            rising={risingPerformances}
            leaderboard={leaderboard}
            weekLabel={weekLabel}
            state={state}
            city={city}
            categoryFilter={categoryFilter}
          />

          <IdealXIPanel
            performances={weeklyPerformances}
            weekLabel={weekLabel}
            categoryFilter={categoryFilter}
            filterState={state}
            filterCity={city}
          />

          <PositionRankingsPanel
            players={data.players}
            rankedPerformances={rankedPerformances}
            weekLabel={weekLabel}
            state={state}
            city={city}
            minPassport={minPassport}
            categoryFilter={categoryFilter}
            passportOnly
          />
        </div>
      )}
    </div>
  );
}
