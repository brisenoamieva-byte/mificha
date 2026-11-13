"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ExplorePlayerCard } from "@/components/marketing/explore-player-card";
import { ExplorePaywallBanner } from "@/components/marketing/explore-paywall";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { MexicoLocationSelect } from "@/components/ui/mexico-location-select";
import {
  isMarketingPlaceholderAcademy,
  normalizeExplorePlayerName,
} from "@/lib/explore-demo-data";
import { CURRENT_SEASON_LABEL } from "@/lib/marketing-season";
import {
  filterDirectory,
  isDevSeedPlayer,
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
  const [applied, setApplied] = useState({
    query: "",
    position: "all" as PlayerPosition | "all",
    state: "",
    city: "",
  });

  const filtered = useMemo(
    () =>
      filterDirectory(
        data,
        applied.query,
        applied.position,
        0,
        applied.state,
        applied.city,
        initialCategoryFilter,
      ),
    [data, applied, initialCategoryFilter],
  );

  const players = useMemo(() => {
    const real = filtered.players.filter((player) => !isDevSeedPlayer(player));
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
    setApplied({
      query: query.trim(),
      position,
      state,
      city,
    });
    document.getElementById("directorio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-mf-border bg-[#0a1f3d]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_15%_0%,rgba(52,211,153,0.18),transparent_55%),radial-gradient(ellipse_70%_60%_at_90%_20%,rgba(27,79,140,0.55),transparent_50%),linear-gradient(180deg,rgba(10,31,61,0.2),rgba(10,31,61,0.95))]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
            Buscador · {CURRENT_SEASON_LABEL}
          </p>
          <h1 className="mt-3 text-[2.15rem] font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[2.75rem]">
            <BrandWordmark className="text-white" />
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-medium leading-8 text-white/90 sm:text-xl">
            Encuentra jugadores de futbol
          </p>
          <p className="mt-2 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
            Nombre, posición y lugar. Vista básica gratis; ficha completa con membresía persona
            (gratis por tiempo limitado).
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

            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_auto]">
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
                className="gap-2"
              />

              <button
                type="submit"
                className="mf-btn-gph h-[42px] justify-center sm:col-span-2 lg:col-span-1"
              >
                Buscar
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/70">
            <Link href="/fut/entrar" className="hover:text-white">
              Publicar ficha
            </Link>
            <span className="hidden text-white/30 sm:inline" aria-hidden>
              ·
            </span>
            <Link href="/fut/explorar#pro" className="hover:text-white">
              Membresía · gratis ahora
            </Link>
            <span className="hidden text-white/30 sm:inline" aria-hidden>
              ·
            </span>
            <Link href="/fut/explorar#directorio" className="font-semibold text-emerald-300 hover:text-emerald-200">
              Ver directorio
            </Link>
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
                {applied.query || applied.position !== "all" || applied.state
                  ? " con tu filtro"
                  : ""}
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
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-mf-brand-soft text-xs font-semibold text-mf-brand">
                        {academy.name.slice(0, 2).toUpperCase()}
                      </div>
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
