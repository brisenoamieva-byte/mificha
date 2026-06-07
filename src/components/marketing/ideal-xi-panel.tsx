"use client";

import Link from "next/link";
import { Sparkles, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { MexicoLocationSelect } from "@/components/ui/mexico-location-select";
import { getPositionLabel } from "@/lib/dashboard-utils";
import {
  buildIdealXI,
  getIdealXIPitchRows,
  type IdealXIScope,
  type WeeklyPlayerPerformance,
} from "@/lib/ideal-xi";
import { getPlayerInitials } from "@/lib/player-utils";
import { cn } from "@/lib/utils";

interface IdealXIPanelProps {
  performances: WeeklyPlayerPerformance[];
  weekLabel: string;
  categoryFilter?: string;
}

const scopeOptions: { value: IdealXIScope; label: string }[] = [
  { value: "mexico", label: "México" },
  { value: "state", label: "Por estado" },
  { value: "city", label: "Por ciudad" },
];

function PlayerChip({ player }: { player: WeeklyPlayerPerformance }) {
  return (
    <Link
      href={`/j/${player.slug}`}
      className="group flex min-w-[92px] max-w-[120px] flex-col items-center gap-2 text-center transition hover:-translate-y-0.5"
    >
      {player.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={player.photo_url}
          alt=""
          className="h-14 w-14 rounded-full object-cover ring-2 ring-white/80 shadow-md transition group-hover:ring-mf-brand"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-sm font-semibold text-mf-brand shadow-md ring-2 ring-white/80">
          {getPlayerInitials(player.first_name, player.last_name)}
        </div>
      )}
      <div>
        <p className="truncate text-xs font-semibold text-white">
          {player.first_name} {player.last_name.charAt(0)}.
        </p>
        <p className="text-[10px] text-white/75">
          {player.goals}G · {player.assists}A
        </p>
      </div>
    </Link>
  );
}

function PitchRow({
  players,
  className,
}: {
  players: WeeklyPlayerPerformance[];
  className?: string;
}) {
  if (players.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-end justify-center gap-4 sm:gap-6", className)}>
      {players.map((player) => (
        <PlayerChip key={player.player_id} player={player} />
      ))}
    </div>
  );
}

export function IdealXIPanel({
  performances,
  weekLabel,
  categoryFilter = "all",
}: IdealXIPanelProps) {
  const [scope, setScope] = useState<IdealXIScope>("mexico");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const idealXI = useMemo(
    () => buildIdealXI(performances, scope, state, city, categoryFilter),
    [performances, scope, state, city, categoryFilter],
  );

  const pitchRows = useMemo(
    () => getIdealXIPitchRows(idealXI.lineup),
    [idealXI.lineup],
  );

  const hasEnoughPlayers = idealXI.lineup.length >= 5;
  const scopeReady =
    scope === "mexico" ||
    (scope === "state" && Boolean(state)) ||
    (scope === "city" && Boolean(state && city));

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-mf-brand-soft px-3 py-1 text-xs font-semibold text-mf-brand">
            <Sparkles className="h-3.5 w-3.5" />
            11 ideal de la semana
          </div>
          <h2 className="mt-3 mf-section-title">
            Los mejores de {idealXI.scopeLabel}
          </h2>
          <p className="mt-2 text-sm text-mf-text-secondary">
            Semana {weekLabel}. Ranking por goles, asistencias y minutos jugados
            en partidos verificados.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {scopeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setScope(option.value)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                scope === option.value
                  ? "bg-mf-brand text-white"
                  : "bg-mf-surface text-mf-text-secondary ring-1 ring-mf-border hover:text-mf-text",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {scope !== "mexico" ? (
        <div className="mf-card p-5">
          <MexicoLocationSelect
            allowAll={false}
            showCity={scope === "city"}
            state={state}
            city={city}
            onStateChange={setState}
            onCityChange={setCity}
            stateLabel="Estado"
            cityLabel="Ciudad o municipio"
            required={scope === "city"}
          />
          {scope === "state" && !state ? (
            <p className="mt-3 text-sm text-mf-text-secondary">
              Elige un estado para ver su 11 ideal semanal.
            </p>
          ) : null}
          {scope === "city" && (!state || !city) ? (
            <p className="mt-3 text-sm text-mf-text-secondary">
              Elige estado y municipio para ver el 11 ideal local.
            </p>
          ) : null}
        </div>
      ) : null}

      {!scopeReady ? null : performances.length === 0 ? (
        <div className="mf-card border-dashed p-8 text-center">
          <Trophy className="mx-auto h-8 w-8 text-mf-text-muted" />
          <p className="mt-3 text-sm font-medium text-mf-text">
            Aún no hay partidos registrados esta semana
          </p>
          <p className="mt-2 text-sm text-mf-text-secondary">
            Cuando las academias capturen resultados, aquí aparecerá el 11 ideal
            automáticamente.
          </p>
        </div>
      ) : !hasEnoughPlayers ? (
        <div className="mf-card border-dashed p-8 text-center">
          <p className="text-sm font-medium text-mf-text">
            Pocos datos esta semana en {idealXI.scopeLabel}
          </p>
          <p className="mt-2 text-sm text-mf-text-secondary">
            Hay actividad, pero aún no alcanza para armar un 11 completo en esta
            zona. Prueba otro alcance o vuelve más adelante.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-mf-border bg-[linear-gradient(180deg,#1f7a43_0%,#176337_100%)] p-5 shadow-lg sm:p-8">
          <div className="relative mx-auto max-w-4xl rounded-[1.75rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] px-4 py-8 sm:px-8 sm:py-10">
            <div className="pointer-events-none absolute inset-x-8 top-1/2 border-t border-white/10" />
            <div className="pointer-events-none absolute inset-y-8 left-1/2 border-l border-white/10" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

            <div className="relative space-y-8 sm:space-y-10">
              <PitchRow players={pitchRows.goalkeeper} />
              <PitchRow players={pitchRows.defenders} />
              <PitchRow players={pitchRows.midfielders} />
              <PitchRow players={pitchRows.forwards} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {idealXI.lineup.map((player) => (
              <Link
                key={player.player_id}
                href={`/j/${player.slug}`}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-white transition hover:bg-white/15"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {player.first_name} {player.last_name}
                  </p>
                  <p className="text-xs text-white/75">
                    {getPositionLabel(player.position)} · {player.academy_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold tabular-nums">
                    {Math.round(player.weekly_score)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-white/70">
                    pts semana
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
