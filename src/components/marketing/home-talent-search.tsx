"use client";

import Link from "next/link";
import { FormEvent, useDeferredValue, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { ExplorePlayerCard } from "@/components/marketing/explore-player-card";
import {
  DEFAULT_PERFORMANCE_FILTER,
  ExplorePerformanceFilters,
} from "@/components/marketing/explore-performance-filters";
import { ExplorePaywallBanner } from "@/components/marketing/explore-paywall";
import {
  GphScoreFilterSelect,
  gphScoreFilterValueFromPerformance,
  performancePatchFromGphScoreFilter,
} from "@/components/marketing/gph-score-filter-select";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { CategoryFilterSelect } from "@/components/ui/category-filter-select";
import { MexicoLocationSelect } from "@/components/ui/mexico-location-select";
import {
  isMarketingPlaceholderAcademy,
  normalizeExplorePlayerName,
} from "@/lib/explore-demo-data";
import { CURRENT_SEASON_LABEL } from "@/lib/marketing-season";
import { collectBirthDatesFromDirectory } from "@/lib/player-category";
import {
  filterDirectory,
  hasActivePerformanceFilter,
  isPlaceholderExplorePlayer,
  type DirectoryPerformanceFilter,
  type DirectoryPlayer,
  type PublicDirectoryData,
} from "@/lib/public-directory";
import type { ExploreAccess } from "@/lib/scout-product";
import type { PlayerPosition } from "@/types/database";

const POSITION_OPTIONS: { value: PlayerPosition | "all"; label: string }[] = [
  { value: "all", label: "Todas las posiciones" },
  { value: "goalkeeper", label: "Portero" },
  { value: "defender", label: "Defensa" },
  { value: "midfielder", label: "Mediocampista" },
  { value: "forward", label: "Delantero" },
];

export function HomeTalentSearch({
  data,
  access,
  playerCount,
  initialCategoryFilter = "all",
}: {
  data: PublicDirectoryData;
  access: ExploreAccess;
  playerCount: number;
  initialCategoryFilter?: string;
}) {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<PlayerPosition | "all">("all");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter);
  const [performance, setPerformance] = useState<DirectoryPerformanceFilter>(
    DEFAULT_PERFORMANCE_FILTER,
  );
  const [showPerformance, setShowPerformance] = useState(false);
  const deferredQuery = useDeferredValue(query.trim());

  const birthDates = useMemo(
    () => collectBirthDatesFromDirectory(data.players, []),
    [data.players],
  );

  const filtered = useMemo(
    () =>
      filterDirectory(
        data,
        deferredQuery,
        position,
        0,
        state,
        city,
        categoryFilter,
        performance,
      ),
    [data, deferredQuery, position, state, city, categoryFilter, performance],
  );

  const players = useMemo(() => {
    const real = filtered.players.filter(
      (player) => !isPlaceholderExplorePlayer(player),
    );
    const seen = new Set<string>();
    const unique: DirectoryPlayer[] = [];
    for (const player of real) {
      const key = normalizeExplorePlayerName(player.first_name, player.last_name);
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(player);
    }
    return unique;
  }, [filtered.players]);

  const academies = useMemo(
    () =>
      filtered.academies.filter((academy) => !isMarketingPlaceholderAcademy(academy)),
    [filtered.academies],
  );

  function onSearch(event: FormEvent) {
    event.preventDefault();
    document.getElementById("directorio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const hasActiveFilters =
    Boolean(deferredQuery) ||
    position !== "all" ||
    Boolean(state) ||
    categoryFilter !== "all" ||
    hasActivePerformanceFilter(performance);

  return (
    <>
      <section className="relative overflow-hidden border-b border-mf-border bg-[#0a1f3d]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_15%_0%,rgba(52,211,153,0.18),transparent_55%),radial-gradient(ellipse_70%_60%_at_90%_20%,rgba(27,79,140,0.55),transparent_50%),linear-gradient(180deg,rgba(10,31,61,0.2),rgba(10,31,61,0.95))]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16 lg:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
            Buscador · {CURRENT_SEASON_LABEL}
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[2.75rem]">
            <BrandWordmark className="text-white" />
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-medium leading-8 text-white/90 sm:text-xl">
            Encuentra jugadores de futbol
          </p>
          <p className="mt-2 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
            Para scouts: busca por nombre, posición, categoría y GPH. Para padres: arma la
            ficha de tu hijo en ~5 min y publícala con consentimiento.
            {playerCount > 0 ? (
              <>
                {" "}
                <span className="tabular-nums text-white/90">{playerCount}</span> en directorio.
              </>
            ) : null}
          </p>

          <form
            onSubmit={onSearch}
            className="mt-8 w-full overflow-hidden rounded-2xl border border-white/15 bg-white/95 p-3 shadow-[0_24px_60px_-28px_rgba(8,24,48,0.55)] backdrop-blur sm:p-4"
          >
            <label className="block">
              <span className="sr-only">Buscar jugador</span>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-mf-text-muted"
                  aria-hidden
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nombre, código MF- o academia"
                  className="mf-input h-12 border-mf-border bg-white pl-11 text-base"
                  autoComplete="off"
                />
              </div>
            </label>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="block">
                <span className="sr-only">Posición</span>
                <select
                  value={position}
                  onChange={(event) =>
                    setPosition(event.target.value as PlayerPosition | "all")
                  }
                  className="mf-input"
                >
                  {POSITION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <CategoryFilterSelect
                value={categoryFilter}
                onChange={setCategoryFilter}
                birthDates={birthDates}
                hideLabel
                className="block"
              />

              <GphScoreFilterSelect
                hideLabel
                value={gphScoreFilterValueFromPerformance(performance)}
                onChange={(next) =>
                  setPerformance((current) => ({
                    ...current,
                    ...performancePatchFromGphScoreFilter(next),
                  }))
                }
              />

              <MexicoLocationSelect
                allowAll
                hideLabels
                state={state}
                city={city}
                onStateChange={(next) => {
                  setState(next);
                  if (!next) setCity("");
                }}
                onCityChange={setCity}
                className="gap-2 sm:col-span-2"
              />
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setShowPerformance((open) => !open)}
                className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-mf-gph-ink hover:text-mf-gph"
                aria-expanded={showPerformance}
              >
                Filtros de rendimiento
                <ChevronDown
                  className={`h-4 w-4 transition ${showPerformance ? "rotate-180" : ""}`}
                  aria-hidden
                />
                {hasActivePerformanceFilter(performance) ? (
                  <span className="rounded-full bg-mf-gph-soft px-2 py-0.5 text-[11px] font-semibold text-mf-gph">
                    activos
                  </span>
                ) : null}
              </button>
              <button
                type="submit"
                className="mf-btn-gph h-11 w-full justify-center px-6 sm:h-[42px] sm:w-auto"
              >
                Ver resultados · {players.length}
              </button>
            </div>

            {showPerformance ? (
              <div className="mt-3 rounded-xl border border-mf-border bg-mf-canvas/80 p-3 sm:p-4">
                <ExplorePerformanceFilters
                  value={performance}
                  onChange={setPerformance}
                  tone="light"
                />
              </div>
            ) : null}
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/fut/explorar#mapa"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/70 hover:bg-emerald-400/15 hover:text-white"
            >
              Ver mapa de talento
            </Link>
            <Link
              href="/fut/entrar?next=/fut/tutor&utm_source=home&utm_medium=hero&utm_campaign=crear_ficha"
              className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-mf-brand transition hover:bg-white/95"
            >
              Armar ficha en ~5 min
            </Link>
            {!access.unlocked ? (
              <Link href="#pro" className="text-sm text-white/70 hover:text-white">
                Explorar Pro gratis
              </Link>
            ) : null}
            <a href="#directorio" className="text-sm font-semibold text-white/80 hover:text-white">
              Ver resultados
            </a>
          </div>
        </div>
      </section>

      <section id="directorio" className="scroll-mt-20 border-b border-mf-border bg-mf-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                Resultados
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-mf-gph-ink">
                Jugadores
              </h2>
              <p className="mt-1 text-sm text-mf-text-secondary">
                {players.length} resultado{players.length === 1 ? "" : "s"}
                {hasActiveFilters ? " con tu filtro" : ""}
              </p>
            </div>
          </div>

          <ExplorePaywallBanner access={access} />

          {players.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-mf-border bg-white px-6 py-10 text-center text-sm text-mf-text-secondary">
              No hay jugadores con ese filtro. Prueba otra posición o ciudad.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {players.map((player) => (
                <ExplorePlayerCard
                  key={player.slug}
                  player={player}
                  unlocked={access.unlocked}
                />
              ))}
            </div>
          )}

          {academies.length > 0 ? (
            <div className="mt-10 border-t border-mf-border-subtle pt-8">
              <h3 className="text-base font-semibold text-mf-gph-ink">
                Academias · {academies.length}
              </h3>
              <ul className="mt-3 divide-y divide-mf-border-subtle rounded-xl border border-mf-border bg-white">
                {academies.map((academy) => (
                  <li key={academy.id}>
                    <Link
                      href={`/fut/a/${academy.slug}`}
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
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-mf-text">
                          {academy.name}
                        </p>
                        <p className="text-xs text-mf-text-muted">
                          {[academy.city, academy.state].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
