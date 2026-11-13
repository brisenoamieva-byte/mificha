"use client";

import Link from "next/link";
import { Award, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryFilterSelect } from "@/components/ui/category-filter-select";
import { MexicoLocationSelect } from "@/components/ui/mexico-location-select";
import { ExplorePlayerCard } from "@/components/marketing/explore-player-card";
import {
  isMarketingPlaceholderAcademy,
  normalizeExplorePlayerName,
} from "@/lib/explore-demo-data";
import { collectBirthDatesFromDirectory } from "@/lib/player-category";
import {
  filterDirectory,
  isDevSeedPlayer,
  type DirectoryPlayer,
  type PublicDirectoryData,
} from "@/lib/public-directory";
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
}: ExploreDirectoryProps) {
  const [query, setQuery] = useState(initialQuery);
  const [position, setPosition] = useState<PlayerPosition | "all">(
    parseInitialPosition(initialPosition),
  );
  const [minPassport, setMinPassport] = useState(0);
  const [state, setState] = useState(initialState);
  const [city, setCity] = useState(initialCity);
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter);

  const birthDates = useMemo(
    () => collectBirthDatesFromDirectory(data.players, []),
    [data.players],
  );

  const filtered = useMemo(
    () =>
      filterDirectory(data, query, position, minPassport, state, city, categoryFilter),
    [data, query, position, minPassport, state, city, categoryFilter],
  );

  const displayPlayers = useMemo(() => {
    const realPlayers = filtered.players.filter((player) => !isDevSeedPlayer(player));
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

  const displayAcademies = useMemo(
    () =>
      filtered.academies.filter((academy) => !isMarketingPlaceholderAcademy(academy)),
    [filtered.academies],
  );

  return (
    <div className="space-y-6">
      <div className="mf-card p-4 sm:p-5">
        <p className="text-sm text-mf-text-secondary">
          Solo fichas con consentimiento · {CURRENT_SEASON_LABEL} ·{" "}
          <span className="tabular-nums font-medium text-mf-text">
            {displayPlayers.length}
          </span>{" "}
          {displayPlayers.length === 1 ? "jugador" : "jugadores"}
          {query || position !== "all" || state || city || categoryFilter !== "all"
            ? " con este filtro"
            : " en el buscador"}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>

      <div className="space-y-8">
        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-base font-semibold text-mf-text">Jugadores</h2>
            <span className="text-sm text-mf-text-muted">
              {displayPlayers.length} resultado{displayPlayers.length === 1 ? "" : "s"}
            </span>
          </div>

          {displayPlayers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-mf-border bg-white px-5 py-10 text-center text-sm text-mf-text-secondary">
              No hay jugadores que coincidan. Las fichas las publican tutores o
              representantes con consentimiento.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {displayPlayers.map((player) => (
                <ExplorePlayerCard
                  key={player.slug}
                  player={player}
                  unlocked={unlocked}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3 border-t border-mf-border-subtle pt-8">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-base font-semibold text-mf-text">Academias</h2>
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
