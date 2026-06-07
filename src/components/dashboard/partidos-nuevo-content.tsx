"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MatchSavedSummary, type SavedPlayerSummary } from "@/components/dashboard/match-saved-summary";
import {
  MinuteQuickInput,
  QuickGoalPicker,
} from "@/components/dashboard/match-stat-capture";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { toast } from "@/components/ui/toast";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";
import { getPositionLabel } from "@/lib/dashboard-utils";
import { defaultSeasonName } from "@/lib/match-utils";
import { calculatePassportScoreForPlayer } from "@/lib/passport-score";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { MatchResult, Player, Season } from "@/types/database";

interface PlayerCapture {
  player_id: string;
  played: boolean;
  minutes: number;
  goals: number;
  assists: number;
  yellow: boolean;
  red: boolean;
}

function todayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

function Counter({
  label,
  value,
  onChange,
  max = 120,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <div className={cn(disabled && "opacity-40")}>
      <p className="mb-2 text-sm font-medium text-slate-600">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={disabled || value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-slate-700"
        >
          −
        </button>
        <span className="min-w-[2rem] text-center text-lg font-semibold text-slate-900">
          {value}
        </span>
        <button
          type="button"
          disabled={disabled || value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-slate-700"
        >
          +
        </button>
      </div>
    </div>
  );
}

function SeasonQuickForm({
  academyId,
  onCreated,
}: {
  academyId: string;
  onCreated: () => void;
}) {
  const [name, setName] = useState(defaultSeasonName());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await supabase
        .from("seasons")
        .update({ is_active: false })
        .eq("academy_id", academyId);

      const { error: insertError } = await supabase.from("seasons").insert({
        academy_id: academyId,
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
        is_active: true,
      });

      if (insertError) throw insertError;
      onCreated();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo crear la temporada.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <input
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
        placeholder="Temporada 2026"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="date"
          required
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
        <input
          type="date"
          required
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>
      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-[#1B4F8C] px-4 py-3 font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Creando..." : "Crear temporada"}
      </button>
    </form>
  );
}

export function PartidosNuevoContent() {
  const router = useRouter();
  const { academy } = useDashboard();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [season, setSeason] = useState<Season | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [captures, setCaptures] = useState<PlayerCapture[]>([]);
  const [savedSummaries, setSavedSummaries] = useState<SavedPlayerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [opponent, setOpponent] = useState("");
  const [matchDate, setMatchDate] = useState(todayIsoDate());
  const [result, setResult] = useState<MatchResult>("win");
  const [goalsFor, setGoalsFor] = useState(0);
  const [goalsAgainst, setGoalsAgainst] = useState(0);

  const playedCount = useMemo(
    () => captures.filter((item) => item.played).length,
    [captures],
  );

  const loadData = useCallback(async () => {
    if (!academy) return;

    setLoading(true);

    const [seasonResult, playersResult] = await Promise.all([
      supabase
        .from("seasons")
        .select("*")
        .eq("academy_id", academy.id)
        .eq("is_active", true)
        .maybeSingle(),
      supabase
        .from("players")
        .select("*")
        .eq("academy_id", academy.id)
        .order("last_name", { ascending: true }),
    ]);

    const activeSeason = seasonResult.data;
    const playerList = playersResult.data ?? [];

    setSeason(activeSeason);
    setPlayers(playerList);
    setCaptures(
      playerList.map((player) => ({
        player_id: player.id,
        played: false,
        minutes: 0,
        goals: 0,
        assists: 0,
        yellow: false,
        red: false,
      })),
    );
    setLoading(false);
  }, [academy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function updateCapture(playerId: string, patch: Partial<PlayerCapture>) {
    setCaptures((current) =>
      current.map((item) => {
        if (item.player_id !== playerId) return item;

        const next = { ...item, ...patch };
        const hasActivity =
          next.goals > 0 || next.assists > 0 || next.minutes > 0 || next.played;

        if (hasActivity) {
          next.played = true;
          if (next.minutes === 0 && (next.goals > 0 || next.assists > 0)) {
            next.minutes = 45;
          }
        }

        return next;
      }),
    );
  }

  async function handleSave() {
    if (!academy || !season) return;

    setSaving(true);
    setError(null);

    try {
      const playedStats = captures.filter((item) => item.played);
      const playedIds = playedStats.map((item) => item.player_id);

      const previousScores = new Map<string, number>();
      if (playedIds.length > 0) {
        const { data: beforePlayers } = await supabase
          .from("players")
          .select("id, passport_score, slug, first_name, last_name, is_public, public_consent_at")
          .in("id", playedIds);

        for (const player of beforePlayers ?? []) {
          previousScores.set(player.id, player.passport_score);
        }
      }

      const { data: match, error: matchError } = await supabase
        .from("matches")
        .insert({
          season_id: season.id,
          academy_id: academy.id,
          opponent: opponent.trim(),
          match_date: matchDate,
          result,
          goals_for: goalsFor,
          goals_against: goalsAgainst,
        })
        .select("*")
        .single();

      if (matchError || !match) throw matchError ?? new Error("No se creó el partido.");

      if (playedStats.length > 0) {
        const { error: statsError } = await supabase.from("match_stats").insert(
          playedStats.map((item) => ({
            match_id: match.id,
            player_id: item.player_id,
            goals: item.goals,
            assists: item.assists,
            minutes_played: item.minutes,
            yellow_cards: item.yellow ? 1 : 0,
            red_cards: item.red ? 1 : 0,
            captured_by: "coach" as const,
          })),
        );

        if (statsError) throw statsError;

        for (const capture of playedStats) {
          const player = players.find((item) => item.id === capture.player_id);
          if (!player) continue;

          const { data: seasonStat } = await supabase
            .from("player_season_stats")
            .select("*")
            .eq("player_id", capture.player_id)
            .eq("season_id", season.id)
            .maybeSingle();

          const nextScore = calculatePassportScoreForPlayer(player, seasonStat);
          await supabase
            .from("players")
            .update({ passport_score: nextScore })
            .eq("id", capture.player_id);
        }
      }

      let summaries: SavedPlayerSummary[] = [];

      if (playedIds.length > 0) {
        const { data: afterPlayers } = await supabase
          .from("players")
          .select("id, slug, first_name, last_name, passport_score, is_public, public_consent_at")
          .in("id", playedIds);

        summaries = playedStats.map((capture) => {
          const updated = afterPlayers?.find(
            (player) => player.id === capture.player_id,
          );

          return {
            player_id: capture.player_id,
            first_name: updated?.first_name ?? "",
            last_name: updated?.last_name ?? "",
            slug: updated?.slug ?? "",
            goals: capture.goals,
            assists: capture.assists,
            minutes: capture.minutes,
            passport_score: updated?.passport_score ?? 0,
            previous_passport_score:
              previousScores.get(capture.player_id) ?? updated?.passport_score ?? 0,
            is_public: updated?.is_public ?? false,
            public_consent_at: updated?.public_consent_at ?? null,
          };
        });
      }

      setSavedSummaries(summaries);
      setStep(3);
      toast.success("Partido guardado. Passport Score actualizado.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el partido.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!academy) return <NoAcademyState />;

  if (loading) {
    return <p className="text-slate-500">Cargando...</p>;
  }

  if (!season) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Link
          href="/dashboard/partidos"
          className="text-sm font-medium text-[#1B4F8C] hover:underline"
        >
          ← Volver
        </Link>
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Primero, crea una temporada</h1>
          <p className="mt-2 text-slate-600">
            Necesitas una temporada activa para capturar partidos.
          </p>
          <SeasonQuickForm academyId={academy.id} onCreated={() => loadData()} />
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="mx-auto max-w-3xl pb-12">
        <MatchSavedSummary
          opponent={opponent}
          players={savedSummaries}
          onDone={() => router.push("/dashboard/partidos")}
        />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-3xl pb-28">
        <Link
          href="/dashboard/partidos"
          className="text-sm font-medium text-[#1B4F8C] hover:underline"
        >
          ← Cancelar
        </Link>

        <div className="mt-4 flex items-center gap-2">
          {[1, 2].map((value) => (
            <span
              key={value}
              className={cn(
                "h-2 flex-1 rounded-full",
                step >= value ? "bg-[#1B4F8C]" : "bg-slate-200",
              )}
            />
          ))}
        </div>

        {step === 1 ? (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-bold text-slate-900">Nuevo partido</h1>
            <p className="mt-1 text-slate-600">Paso 1 de 2 · Datos del partido</p>

            <div className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  ¿Contra quién jugaron?
                </label>
                <input
                  value={opponent}
                  onChange={(event) => setOpponent(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-4 text-lg"
                  placeholder="Halcones FC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  ¿Cuándo?
                </label>
                <input
                  type="date"
                  value={matchDate}
                  onChange={(event) => setMatchDate(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-4 text-lg"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">¿Resultado?</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {[
                    { value: "win" as const, label: "🟢 Ganamos", tone: "border-green-500 bg-green-50" },
                    { value: "draw" as const, label: "🟡 Empatamos", tone: "border-amber-400 bg-amber-50" },
                    { value: "loss" as const, label: "🔴 Perdimos", tone: "border-red-500 bg-red-50" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setResult(option.value)}
                      className={cn(
                        "rounded-2xl border-2 px-4 py-5 text-base font-semibold transition-colors",
                        result === option.value
                          ? option.tone
                          : "border-slate-200 bg-white text-slate-700",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Counter
                  label="Goles a favor"
                  value={goalsFor}
                  onChange={setGoalsFor}
                  max={30}
                />
                <Counter
                  label="Goles en contra"
                  value={goalsAgainst}
                  onChange={setGoalsAgainst}
                  max={30}
                />
              </div>

              {error ? (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                disabled={!opponent.trim()}
                onClick={() => setStep(2)}
                className="w-full rounded-2xl bg-[#1B4F8C] px-5 py-4 text-base font-semibold text-white disabled:opacity-50"
              >
                Siguiente · stats por jugador
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h1 className="text-2xl font-bold text-slate-900">
                Stats por jugador
              </h1>
              <p className="mt-1 text-slate-600">
                Paso 2 de 2 · vs {opponent}
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Partido registrado → captura rápida → guardar → Passport Score
                se recalcula → avisa al padre por WhatsApp.
              </p>
            </div>

            {players.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <p className="text-slate-600">
                  Agrega jugadores en Mi Plantel primero.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {players.map((player) => {
                  const capture = captures.find(
                    (item) => item.player_id === player.id,
                  );
                  if (!capture) return null;

                  return (
                    <div
                      key={player.id}
                      className={cn(
                        "rounded-2xl border bg-white p-4 shadow-sm",
                        capture.played
                          ? "border-[#1B4F8C]/30 ring-1 ring-[#1B4F8C]/10"
                          : "border-slate-200",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <PlayerAvatar
                          firstName={player.first_name}
                          lastName={player.last_name}
                          photoUrl={player.photo_url}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-900">
                            {player.first_name} {player.last_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {getPositionLabel(player.position)} · Passport{" "}
                            {player.passport_score}
                          </p>
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={capture.played}
                            onChange={(event) =>
                              updateCapture(player.id, {
                                played: event.target.checked,
                                minutes: event.target.checked
                                  ? capture.minutes || 45
                                  : 0,
                                goals: event.target.checked ? capture.goals : 0,
                                assists: event.target.checked
                                  ? capture.assists
                                  : 0,
                              })
                            }
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          Jugó
                        </label>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <QuickGoalPicker
                          label="Goles"
                          value={capture.goals}
                          max={3}
                          disabled={!capture.played}
                          onChange={(value) =>
                            updateCapture(player.id, { goals: value })
                          }
                        />
                        <QuickGoalPicker
                          label="Asistencias"
                          value={capture.assists}
                          max={3}
                          disabled={!capture.played}
                          onChange={(value) =>
                            updateCapture(player.id, { assists: value })
                          }
                        />
                        <MinuteQuickInput
                          value={capture.minutes}
                          disabled={!capture.played}
                          onChange={(value) =>
                            updateCapture(player.id, { minutes: value })
                          }
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={!capture.played}
                          onClick={() =>
                            updateCapture(player.id, {
                              yellow: !capture.yellow,
                            })
                          }
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-40",
                            capture.yellow
                              ? "border-amber-400 bg-amber-50"
                              : "border-slate-200",
                          )}
                        >
                          🟨 Amarilla
                        </button>
                        <button
                          type="button"
                          disabled={!capture.played}
                          onClick={() =>
                            updateCapture(player.id, { red: !capture.red })
                          }
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-40",
                            capture.red
                              ? "border-red-500 bg-red-50"
                              : "border-slate-200",
                          )}
                        >
                          🟥 Roja
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {error ? (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </div>
        )}
      </div>

      {step === 2 ? (
        <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white p-4 shadow-lg">
          <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl px-4 py-4 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Atrás
            </button>
            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <p className="flex items-center justify-center text-sm text-slate-500 sm:mr-2">
                {playedCount} jugador{playedCount === 1 ? "" : "es"} marcados
              </p>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="flex-1 rounded-2xl bg-green-600 px-5 py-4 text-base font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar · recalcular Score"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
