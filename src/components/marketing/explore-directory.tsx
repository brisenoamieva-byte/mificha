"use client";

import Link from "next/link";
import { Award, MapPin, Search, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryFilterSelect } from "@/components/ui/category-filter-select";
import { PlayerCategoryBadge } from "@/components/ui/player-category-badge";
import { MexicoLocationSelect } from "@/components/ui/mexico-location-select";
import { IdealXIPanel } from "@/components/marketing/ideal-xi-panel";
import { WeeklyCompetitionPanels } from "@/components/marketing/weekly-competition-panels";
import { PositionRankingsPanel } from "@/components/marketing/position-rankings-panel";
import { getPositionLabel } from "@/lib/dashboard-utils";
import type { RankedWeeklyPerformance, WeeklyPlayerPerformance } from "@/lib/ideal-xi";
import { collectBirthDatesFromDirectory } from "@/lib/player-category";
import {
  filterDirectory,
  type PublicDirectoryData,
} from "@/lib/public-directory";
import { getPlayerInitials } from "@/lib/player-utils";
import type { PlayerPosition } from "@/types/database";

interface ExploreDirectoryProps {
  data: PublicDirectoryData;
  weeklyPerformances: WeeklyPlayerPerformance[];
  rankedPerformances: RankedWeeklyPerformance[];
  risingPerformances: RankedWeeklyPerformance[];
  leaderboard: RankedWeeklyPerformance[];
  weekLabel: string;
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
}: ExploreDirectoryProps) {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<PlayerPosition | "all">("all");
  const [minPassport, setMinPassport] = useState(0);
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const birthDates = useMemo(
    () => collectBirthDatesFromDirectory(data.players, weeklyPerformances),
    [data.players, weeklyPerformances],
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
      ),
    [data, query, position, minPassport, state, city, categoryFilter],
  );

  return (
    <div className="space-y-10">
      <div className="mf-card p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px_180px]">
          <label className="block">
            <span className="text-sm font-medium text-mf-text">Buscar</span>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mf-text-muted" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Jugador, academia o ciudad"
                className="mf-input pl-10"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-mf-text">Posición</span>
            <select
              value={position}
              onChange={(event) =>
                setPosition(event.target.value as PlayerPosition | "all")
              }
              className="mf-input mt-2"
            >
              {positionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-mf-text">
              Passport mínimo
            </span>
            <select
              value={minPassport}
              onChange={(event) => setMinPassport(Number(event.target.value))}
              className="mf-input mt-2"
            >
              <option value={0}>Cualquiera</option>
              <option value={50}>50+</option>
              <option value={70}>70+</option>
              <option value={80}>80+</option>
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 border-t border-mf-border-subtle pt-4 xl:grid-cols-2">
          <CategoryFilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            birthDates={birthDates}
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
      />

      <PositionRankingsPanel
        players={data.players}
        rankedPerformances={rankedPerformances}
        weekLabel={weekLabel}
        state={state}
        city={city}
        minPassport={minPassport}
        categoryFilter={categoryFilter}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="mf-section-title">Academias públicas</h2>
          <span className="text-sm text-mf-text-muted">
            {filtered.academies.length} resultados
          </span>
        </div>

        {filtered.academies.length === 0 ? (
          <div className="mf-card border-dashed p-8 text-center text-sm text-mf-text-secondary">
            No hay academias públicas que coincidan con tu búsqueda.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.academies.map((academy) => (
              <Link
                key={academy.id}
                href={`/a/${academy.slug}`}
                className="mf-card block p-5 transition hover:border-mf-brand/30"
              >
                <div className="flex items-start gap-3">
                  {academy.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={academy.logo_url}
                      alt=""
                      className="h-12 w-12 rounded-md object-cover ring-1 ring-mf-border"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-mf-brand-soft text-sm font-semibold text-mf-brand">
                      {academy.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-mf-text">
                      {academy.name}
                    </p>
                    {[academy.city, academy.state].filter(Boolean).length > 0 ? (
                      <p className="mt-1 inline-flex items-center gap-1 text-sm text-mf-text-secondary">
                        <MapPin className="h-3.5 w-3.5" />
                        {[academy.city, academy.state].filter(Boolean).join(", ")}
                      </p>
                    ) : null}
                  </div>
                </div>
                {academy.is_certified ? (
                  <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-mf-warning-soft px-2.5 py-1 text-xs font-semibold text-mf-warning">
                    <Award className="h-3.5 w-3.5" />
                    Certificada
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="mf-section-title">Jugadores verificados</h2>
          <span className="text-sm text-mf-text-muted">
            {filtered.players.length} resultados
          </span>
        </div>

        {filtered.players.length === 0 ? (
          <div className="mf-card border-dashed p-8 text-center text-sm text-mf-text-secondary">
            No hay jugadores públicos que coincidan con tu búsqueda.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.players.map((player) => (
              <Link
                key={player.slug}
                href={`/j/${player.slug}`}
                className="mf-card block p-5 transition hover:border-mf-brand/30"
              >
                <div className="flex items-center gap-3">
                  {player.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={player.photo_url}
                      alt=""
                      className="h-14 w-14 rounded-full object-cover ring-1 ring-mf-border"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mf-canvas text-sm font-semibold text-mf-text-secondary">
                      {getPlayerInitials(player.first_name, player.last_name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-mf-text">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="text-sm text-mf-text-secondary">
                      {getPositionLabel(player.position)}
                    </p>
                    <p className="mt-1 text-xs text-mf-text-muted">
                      {player.academies?.name ?? "Academia"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold tabular-nums text-mf-brand">
                      {player.passport_score}
                    </p>
                    <p className="text-[11px] font-medium text-mf-text-muted">
                      Passport
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <PlayerCategoryBadge birthDate={player.birth_date} compact />
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-mf-success">
                    <Shield className="h-3.5 w-3.5" />
                    Ficha verificada
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="mf-card p-6">
        <p className="text-sm font-medium text-mf-text">¿Eres scout o club?</p>
        <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
          Por ahora puedes explorar fichas y academias sin crear cuenta. Próximamente:
          listas guardadas, alertas y contacto directo.
        </p>
      </div>
    </div>
  );
}
