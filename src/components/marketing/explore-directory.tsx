"use client";

import Link from "next/link";
import { Award, ChevronDown, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryFilterSelect } from "@/components/ui/category-filter-select";
import { MexicoLocationSelect } from "@/components/ui/mexico-location-select";
import { ExplorePlayerCard } from "@/components/marketing/explore-player-card";
import {
  DEFAULT_PERFORMANCE_FILTER,
  ExplorePerformanceFilters,
} from "@/components/marketing/explore-performance-filters";
import {
  GphScoreFilterSelect,
  gphScoreFilterValueFromPerformance,
  performancePatchFromGphScoreFilter,
} from "@/components/marketing/gph-score-filter-select";
import {
  isMarketingPlaceholderAcademy,
  normalizeExplorePlayerName,
} from "@/lib/explore-demo-data";
import { collectBirthDatesFromDirectory } from "@/lib/player-category";
import {
  filterDirectory,
  hasActivePerformanceFilter,
  isPlaceholderExplorePlayer,
  type DirectoryPerformanceFilter,
  type DirectoryPlayer,
  type PublicDirectoryData,
} from "@/lib/public-directory";
import { explorePreviewPlayers } from "@/lib/explore-preview";
import { CURRENT_SEASON_LABEL } from "@/lib/marketing-season";
import { PROGRESS_TIER_FILTER_OPTIONS } from "@/lib/passport-score";
import type { PlayerPosition } from "@/types/database";

interface ExploreDirectoryProps {
  data: PublicDirectoryData;
  initialCategoryFilter?: string;
  /** Ficha completa desbloqueada (membresía persona / staff / dueño). */
  unlocked?: boolean;
  initialQuery?: string;
  initialPosition?: string;
  initialState?: string;
  initialCity?: string;
  /** Modo controlado (mapa de calor → filtros). */
  locationState?: string;
  locationCity?: string;
  onLocationChange?: (next: { state: string; city: string }) => void;
}

function parseInitialPosition(value?: string): PlayerPosition | "all" {
  if (
    value === "goalkeeper" ||
    value === "defender" ||
    value === "midfielder" ||
    value === "forward"
  ) {
    return value;
  }
  return "all";
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
  initialCategoryFilter = "all",
  unlocked = false,
  initialQuery = "",
  initialPosition,
  initialState = "",
  initialCity = "",
  locationState,
  locationCity,
  onLocationChange,
}: ExploreDirectoryProps) {
  const [query, setQuery] = useState(initialQuery);
  const [position, setPosition] = useState<PlayerPosition | "all">(
    parseInitialPosition(initialPosition),
  );
  const [minPassport, setMinPassport] = useState(0);
  const [internalState, setInternalState] = useState(initialState);
  const [internalCity, setInternalCity] = useState(initialCity);
  const controlled = typeof onLocationChange === "function";
  const state = controlled ? (locationState ?? "") : internalState;
  const city = controlled ? (locationCity ?? "") : internalCity;
  const setState = (nextState: string) => {
    if (controlled) {
      onLocationChange({ state: nextState, city: nextState ? city : "" });
      return;
    }
    setInternalState(nextState);
  };
  const setCity = (nextCity: string) => {
    if (controlled) {
      onLocationChange({ state, city: nextCity });
      return;
    }
    setInternalCity(nextCity);
  };
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter);
  const [performance, setPerformance] = useState<DirectoryPerformanceFilter>(
    DEFAULT_PERFORMANCE_FILTER,
  );
  const [showPerformance, setShowPerformance] = useState(false);

  const birthDates = useMemo(
    () => collectBirthDatesFromDirectory(data.players, []),
    [data.players],
  );

  const filtered = useMemo(
    () =>
      filterDirectory(
        data,
        query,
        position,
        minPassport,
        state,
        city,
        categoryFilter,
        performance,
      ),
    [data, query, position, minPassport, state, city, categoryFilter, performance],
  );

  const allPlayers = useMemo(() => {
    const realPlayers = filtered.players.filter(
      (player) => !isPlaceholderExplorePlayer(player),
    );
    const seenNames = new Set<string>();
    const unique: DirectoryPlayer[] = [];

    for (const player of realPlayers) {
      const nameKey = normalizeExplorePlayerName(player.first_name, player.last_name);
      if (seenNames.has(nameKey)) continue;
      seenNames.add(nameKey);
      unique.push(player);
    }

    return unique;
  }, [filtered.players]);

  const displayPlayers = useMemo(
    () => explorePreviewPlayers(allPlayers, unlocked),
    [allPlayers, unlocked],
  );
  const previewCapped = !unlocked && allPlayers.length > displayPlayers.length;

  const displayAcademies = useMemo(
    () =>
      filtered.academies.filter((academy) => !isMarketingPlaceholderAcademy(academy)),
    [filtered.academies],
  );

  return (
    <div className="space-y-6">
      <div className="mf-card p-4 sm:p-5">
        <p className="text-sm text-mf-text-secondary">
          Solo fichas con <strong className="font-semibold text-mf-text">consentimiento del tutor</strong>{" "}
          · {CURRENT_SEASON_LABEL}
          {unlocked ? (
            <>
              {" "}
              ·{" "}
              <span className="tabular-nums font-medium text-mf-text">
                {allPlayers.length}
              </span>{" "}
              {allPlayers.length === 1 ? "jugador" : "jugadores"}
            </>
          ) : (
            <> · vista previa</>
          )}
          {query ||
          position !== "all" ||
          state ||
          city ||
          categoryFilter !== "all" ||
          hasActivePerformanceFilter(performance)
            ? " con este filtro"
            : unlocked
              ? " visibles ahora"
              : ""}
          {unlocked
            ? ". Hay más fichas en MiFicha; sin firma no salen aquí."
            : ". Entra para buscar el directorio completo."}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <label className="block sm:col-span-2 lg:col-span-2">
            <span className="sr-only">Buscar</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mf-text-muted" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar jugador, código MF-, academia o ciudad"
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
            <span className="sr-only">Etapa de progreso</span>
            <select
              value={minPassport}
              onChange={(event) => setMinPassport(Number(event.target.value))}
              className="mf-input"
            >
              {PROGRESS_TIER_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <GphScoreFilterSelect
            hideLabel
            className="sm:col-span-2 lg:col-span-2"
            value={gphScoreFilterValueFromPerformance(performance)}
            onChange={(next) =>
              setPerformance((current) => ({
                ...current,
                ...performancePatchFromGphScoreFilter(next),
              }))
            }
          />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <CategoryFilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            birthDates={birthDates}
            hint="Filtra por categoría de edad."
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
            stateLabel="Estado"
            cityLabel="Ciudad o municipio"
          />
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowPerformance((open) => !open)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-mf-gph-ink hover:text-mf-gph"
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
          {showPerformance ? (
            <div className="mt-3 rounded-xl border border-mf-border bg-mf-canvas px-3 py-3 sm:px-4">
              <ExplorePerformanceFilters value={performance} onChange={setPerformance} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-8">
        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-base font-semibold text-mf-text">Jugadores</h2>
            {unlocked ? (
              <span className="text-sm text-mf-text-muted">
                {allPlayers.length} resultado{allPlayers.length === 1 ? "" : "s"}
              </span>
            ) : (
              <span className="text-sm text-mf-text-muted">Muestra gratuita</span>
            )}
          </div>

          {displayPlayers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-mf-border bg-white px-5 py-10 text-center text-sm text-mf-text-secondary">
              <p>
                No hay jugadores que coincidan. Solo salen fichas con{" "}
                <strong className="text-mf-text">consentimiento del tutor</strong>.
              </p>
              <a
                href="/fut/entrar?next=/fut/tutor"
                className="mf-btn-gph mt-4 inline-flex"
              >
                Publicar ficha con consentimiento
              </a>
            </div>
          ) : (
            <>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {displayPlayers.map((player) => (
                  <ExplorePlayerCard
                    key={player.slug}
                    player={player}
                    unlocked={unlocked}
                  />
                ))}
              </div>
              {previewCapped ? (
                <div className="rounded-xl border border-mf-gph/25 bg-mf-gph-soft px-4 py-4 text-center sm:px-5">
                  <p className="text-sm font-semibold text-mf-gph-ink">
                    Hay más fichas con Explorar Pro
                  </p>
                  <p className="mt-1 text-sm text-mf-text-secondary">
                    Crea tu cuenta de tutor y publica la ficha de tu hijo en ~5 min.
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <Link
                      href="/fut/entrar?next=/fut/tutor&utm_source=explorar&utm_medium=preview&utm_campaign=crear_ficha"
                      className="mf-btn-gph"
                    >
                      Entrar / armar ficha
                    </Link>
                    <Link href="/fut/entrar?next=/fut/explorar" className="mf-btn-gph-ghost">
                      Ver más con Explorar Pro
                    </Link>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>

        <section className="space-y-3 border-t border-mf-border-subtle pt-8">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-base font-semibold text-mf-text">Academias</h2>
            {unlocked ? (
              <span className="text-sm text-mf-text-muted">
                {displayAcademies.length} resultados
              </span>
            ) : null}
          </div>

          {displayAcademies.length === 0 ? (
            <div className="rounded-xl border border-dashed border-mf-border bg-white px-4 py-5 text-sm text-mf-text-secondary">
              <p className="font-medium text-mf-text">
                {unlocked
                  ? "Aún no hay academias públicas con ese filtro."
                  : "Estamos sumando academias al directorio."}
              </p>
              <p className="mt-1">
                Si diriges una academia,{" "}
                <Link href="/fut/signup" className="font-semibold text-mf-gph hover:underline">
                  créala gratis
                </Link>{" "}
                y publica tu página.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-mf-border-subtle rounded-xl border border-mf-border bg-white">
              {displayAcademies.map((academy) => (
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
    </div>
  );
}
