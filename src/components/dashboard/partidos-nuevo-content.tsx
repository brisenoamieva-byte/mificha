"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MatchSavedSummary, type SavedPlayerSummary } from "@/components/dashboard/match-saved-summary";
import {
  MatchCaptureStep,
  updateCapturesList,
} from "@/components/dashboard/match-capture-step";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";
import { FixturePicker } from "@/components/dashboard/fixture-picker";
import { NoFixturesState } from "@/components/dashboard/no-fixtures-state";
import { NoSeasonState } from "@/components/dashboard/no-season-state";
import { OfficialMatchNotice } from "@/components/dashboard/official-match-notice";
import { toast } from "@/components/ui/toast";
import {
  applyCapturePatch,
  createCapturesForPlayers,
  markPlayedWithMinutes,
  sumPlayerGoals,
  toggleConvocadoId,
  type CaptureStyle,
  type PlayerCapture,
  type RosterListMode,
} from "@/lib/match-capture";
import {
  buildAcademyCaptureBlockedMessage,
  formatOfficialScoreLine,
  getMatchGovernance,
} from "@/lib/match-data-governance";
import {
  getCategoryFilterLabel,
  inferCategoryFilterFromMatchCategory,
  matchesCategoryFilter,
  parseCategoryFilter,
} from "@/lib/player-category";
import { calculatePassportScoreForPlayer } from "@/lib/passport-score";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Match, MatchResult, Player, Season } from "@/types/database";

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

export function PartidosNuevoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduledMatchIdParam = searchParams.get("matchId");
  const { academy } = useDashboard();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [season, setSeason] = useState<Season | null>(null);
  const [scheduledMatchId, setScheduledMatchId] = useState<string | null>(null);
  const [selectedFixture, setSelectedFixture] = useState<Match | null>(null);
  const [scheduledMatchCategory, setScheduledMatchCategory] = useState<string | null>(
    null,
  );
  const [players, setPlayers] = useState<Player[]>([]);
  const [captures, setCaptures] = useState<PlayerCapture[]>([]);
  const [savedSummaries, setSavedSummaries] = useState<SavedPlayerSummary[]>([]);
  const [notificationSummary, setNotificationSummary] = useState<{
    sent: number;
    failed: number;
    skipped: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [opponent, setOpponent] = useState("");
  const [matchDate, setMatchDate] = useState(todayIsoDate());
  const [result, setResult] = useState<MatchResult>("win");
  const [goalsFor, setGoalsFor] = useState(0);
  const [goalsAgainst, setGoalsAgainst] = useState(0);
  const [captureStyle, setCaptureStyle] = useState<CaptureStyle>("quick");
  const [listMode, setListMode] = useState<RosterListMode>("convocados");
  const [convocadoIds, setConvocadoIds] = useState<string[]>([]);
  const [pendingFixtures, setPendingFixtures] = useState<Match[]>([]);

  const playedCount = useMemo(
    () => captures.filter((item) => item.played).length,
    [captures],
  );

  const rosterCategoryFilter = useMemo(() => {
    const inferred = inferCategoryFilterFromMatchCategory(scheduledMatchCategory);
    return inferred ? parseCategoryFilter(inferred) : { kind: "all" as const };
  }, [scheduledMatchCategory]);

  const visiblePlayers = useMemo(() => {
    if (rosterCategoryFilter.kind === "all") return players;
    return players.filter((player) =>
      matchesCategoryFilter(player.birth_date, rosterCategoryFilter),
    );
  }, [players, rosterCategoryFilter]);

  const rosterCategoryLabel = getCategoryFilterLabel(rosterCategoryFilter);

  const playerGoalsTotal = useMemo(
    () => sumPlayerGoals(captures.filter((item) => item.played)),
    [captures],
  );

  const matchGovernance = useMemo(
    () =>
      getMatchGovernance(
        selectedFixture ?? {
          is_official: false,
          result: null,
          goals_for: null,
          goals_against: null,
          result_locked_at: null,
          acta_published_at: null,
        },
      ),
    [selectedFixture],
  );

  const effectiveGoalsFor = matchGovernance.hasOfficialResult
    ? selectedFixture?.goals_for ?? 0
    : goalsFor;

  const goalsMismatch =
    !matchGovernance.isOfficial &&
    captureStyle === "detailed" &&
    effectiveGoalsFor > 0 &&
    playedCount > 0 &&
    playerGoalsTotal !== effectiveGoalsFor;

  const captureBlockedMessage = selectedFixture
    ? buildAcademyCaptureBlockedMessage(selectedFixture)
    : null;

  const loadData = useCallback(async () => {
    if (!academy) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (scheduledMatchIdParam) {
      const { data: scheduledMatch } = await supabase
        .from("matches")
        .select("*")
        .eq("id", scheduledMatchIdParam)
        .eq("academy_id", academy.id)
        .maybeSingle();

      if (scheduledMatch && scheduledMatch.status === "scheduled") {
        setScheduledMatchId(scheduledMatch.id);
        setSelectedFixture(scheduledMatch);
        setScheduledMatchCategory(scheduledMatch.category);
        setOpponent(scheduledMatch.opponent);
        setMatchDate(scheduledMatch.match_date);
        if (scheduledMatch.result) {
          setResult(scheduledMatch.result);
          setGoalsFor(scheduledMatch.goals_for ?? 0);
          setGoalsAgainst(scheduledMatch.goals_against ?? 0);
        }

        const [{ data: scheduledSeason }, { data: playerList }] = await Promise.all([
          supabase
            .from("seasons")
            .select("*")
            .eq("id", scheduledMatch.season_id)
            .maybeSingle(),
          supabase
            .from("players")
            .select("*")
            .eq("academy_id", academy.id)
            .order("last_name", { ascending: true }),
        ]);

        setSeason(scheduledSeason);
        setPlayers(playerList ?? []);
        setCaptures(createCapturesForPlayers((playerList ?? []).map((player) => player.id)));
        setLoading(false);
        return;
      }
    }

    setScheduledMatchId(null);
    setSelectedFixture(null);
    setScheduledMatchCategory(null);

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
    setCaptures(createCapturesForPlayers(playerList.map((player) => player.id)));

    if (activeSeason) {
      const { data: pending } = await supabase
        .from("matches")
        .select("*")
        .eq("academy_id", academy.id)
        .eq("season_id", activeSeason.id)
        .in("status", ["scheduled", "postponed"])
        .order("kickoff_at", { ascending: true });

      setPendingFixtures(pending ?? []);
    } else {
      setPendingFixtures([]);
    }

    setLoading(false);
  }, [academy, scheduledMatchIdParam]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function updateCapture(playerId: string, patch: Partial<PlayerCapture>) {
    setCaptures((current) => updateCapturesList(current, playerId, patch));
  }

  function toggleConvocado(playerId: string) {
    setConvocadoIds((current) => toggleConvocadoId(current, playerId));
  }

  function selectAllConvocados() {
    setConvocadoIds(visiblePlayers.map((player) => player.id));
  }

  function clearConvocados() {
    setConvocadoIds([]);
    setCaptures((current) =>
      current.map((item) => applyCapturePatch(item, { played: false })),
    );
  }

  function bulkMinutes(minutes: number) {
    setCaptures((current) =>
      current.map((item) =>
        convocadoIds.includes(item.player_id)
          ? markPlayedWithMinutes(item, minutes)
          : item,
      ),
    );
  }

  function selectFixture(fixture: Match) {
    setScheduledMatchId(fixture.id);
    setSelectedFixture(fixture);
    setScheduledMatchCategory(fixture.category);
    setOpponent(fixture.opponent);
    setMatchDate(fixture.match_date);
    if (fixture.result) {
      setResult(fixture.result);
      setGoalsFor(fixture.goals_for ?? 0);
      setGoalsAgainst(fixture.goals_against ?? 0);
    } else {
      setResult("win");
      setGoalsFor(0);
      setGoalsAgainst(0);
    }
  }

  async function handleSave() {
    if (!academy || !season || !scheduledMatchId || !selectedFixture) {
      setError("Selecciona una jornada publicada por MiFicha.");
      return;
    }

    if (matchGovernance.isOfficial && !matchGovernance.hasOfficialResult) {
      setError(
        "El marcador oficial aún no está publicado. El organizador (MiFicha) lo registrará tras el partido.",
      );
      return;
    }

    if (matchGovernance.isOfficial && !matchGovernance.hasOfficialActa) {
      setError(
        "El acta oficial aún no está publicada. El organizador registrará goles y tarjetas antes de tu captura de minutos.",
      );
      return;
    }

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

      const matchUpdate: {
        status: "completed";
        opponent?: string;
        match_date?: string;
        result?: MatchResult;
        goals_for?: number;
        goals_against?: number;
      } = { status: "completed" };

      if (!matchGovernance.isOfficial) {
        matchUpdate.opponent = opponent.trim();
        matchUpdate.match_date = matchDate;
        matchUpdate.result = result;
        matchUpdate.goals_for = goalsFor;
        matchUpdate.goals_against = goalsAgainst;
      }

      const { data: match, error: matchError } = await supabase
        .from("matches")
        .update(matchUpdate)
        .eq("id", scheduledMatchId)
        .select("*")
        .single();

      if (matchError || !match) throw matchError ?? new Error("No se creó el partido.");

      if (playedStats.length > 0) {
        const { error: statsError } = await supabase.from("match_stats").insert(
          playedStats.map((item) => ({
            match_id: match.id,
            player_id: item.player_id,
            goals: matchGovernance.isOfficial ? 0 : item.goals,
            assists: matchGovernance.isOfficial ? 0 : item.assists,
            minutes_played: item.minutes,
            yellow_cards: matchGovernance.isOfficial ? 0 : item.yellow ? 1 : 0,
            red_cards: matchGovernance.isOfficial ? 0 : item.red ? 1 : 0,
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

        const achievementMap = new Map<
          string,
          Array<{
            key: string;
            title: string;
            description: string;
            rarity: string;
            emoji: string;
          }>
        >();
        const weeklyMap = new Map<
          string,
          {
            rank: number;
            total: number;
            weekly_score: number;
            positions_delta: number | null;
            week_label: string;
          }
        >();

        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            const achievementResponse = await fetch("/api/achievements/evaluate-match", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                match_id: match.id,
                season_id: season.id,
                captures: playedStats.map((capture) => ({
                  player_id: capture.player_id,
                  goals: capture.goals,
                  assists: capture.assists,
                  minutes: capture.minutes,
                  passport_score:
                    afterPlayers?.find((player) => player.id === capture.player_id)
                      ?.passport_score ?? 0,
                  previous_passport_score:
                    previousScores.get(capture.player_id) ??
                    afterPlayers?.find((player) => player.id === capture.player_id)
                      ?.passport_score ??
                    0,
                })),
              }),
            });

            if (achievementResponse.ok) {
              const payload = (await achievementResponse.json()) as {
                players?: Array<{
                  player_id: string;
                  unlocked: Array<{
                    key: string;
                    title: string;
                    description: string;
                    rarity: string;
                    emoji: string;
                  }>;
                  weekly?: {
                    rank: number;
                    total: number;
                    weekly_score: number;
                    positions_delta: number | null;
                    week_label: string;
                  };
                }>;
              };

              for (const row of payload.players ?? []) {
                achievementMap.set(row.player_id, row.unlocked);
                if (row.weekly) {
                  weeklyMap.set(row.player_id, row.weekly);
                }
              }
            }
          }
        } catch {
          // Achievements are optional until SQL #19 is applied.
        }

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
            unlocked_achievements: achievementMap.get(capture.player_id) ?? [],
            weekly: weeklyMap.get(capture.player_id) ?? null,
          };
        });
      }

      let notificationByPlayer = new Map<
        string,
        SavedPlayerSummary["notification"]
      >();

      if (summaries.length > 0 && academy) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            const notificationResponse = await fetch("/api/notifications/match-update", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                match_id: match.id,
                academy_id: academy.id,
                opponent,
                player_ids: summaries.map((row) => row.player_id),
                previous_passport_by_player: Object.fromEntries(
                  summaries.map((row) => [row.player_id, row.previous_passport_score]),
                ),
                achievement_keys_by_player: Object.fromEntries(
                  summaries.map((row) => [
                    row.player_id,
                    row.unlocked_achievements.map((item) => item.key),
                  ]),
                ),
                weekly_by_player: Object.fromEntries(
                  summaries
                    .filter((row) => row.weekly)
                    .map((row) => [row.player_id, row.weekly!]),
                ),
              }),
            });

            if (notificationResponse.ok) {
              const payload = (await notificationResponse.json()) as {
                summary?: { sent: number; failed: number; skipped: number };
                results?: Array<NonNullable<SavedPlayerSummary["notification"]>>;
              };

              if (payload.summary) {
                setNotificationSummary(payload.summary);
              }

              for (const row of payload.results ?? []) {
                notificationByPlayer.set(row.player_id, row);
              }
            }
          }
        } catch {
          // Notificaciones opcionales hasta SQL #22 / Resend / WhatsApp API.
        }
      }

      summaries = summaries.map((row) => ({
        ...row,
        notification: notificationByPlayer.get(row.player_id) ?? null,
      }));

      setSavedSummaries(summaries);
      setStep(3);
      const unlockedCount = summaries.reduce(
        (count, player) => count + player.unlocked_achievements.length,
        0,
      );
      toast.success(
        unlockedCount > 0
          ? `Partido guardado · ${unlockedCount} insignia${unlockedCount === 1 ? "" : "s"} desbloqueada${unlockedCount === 1 ? "" : "s"}.`
          : "Partido guardado. Passport Score actualizado.",
      );
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
      <NoSeasonState
        backHref="/dashboard/partidos"
        backLabel="← Volver a partidos"
      />
    );
  }

  if (!scheduledMatchId && pendingFixtures.length === 0 && step !== 3) {
    return <NoFixturesState />;
  }

  if (step === 3) {
    return (
      <div className="mx-auto max-w-3xl pb-12">
        <MatchSavedSummary
          opponent={opponent}
          players={savedSummaries}
          notificationSummary={notificationSummary ?? undefined}
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
            {!scheduledMatchId ? (
              <FixturePicker
                fixtures={pendingFixtures}
                onSelect={selectFixture}
              />
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-900">
                  Capturar stats del plantel
                </h1>
                <p className="mt-1 text-slate-600">
                  Paso 1 de 2 · Jornada publicada por MiFicha
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  {matchGovernance.isOfficial
                    ? "El marcador lo publica el organizador. Aquí solo confirmas convocados y stats individuales."
                    : "Marcador y stats del plantel. En el paso 2 eliges convocados y captura rápida o detallada."}
                </p>

                <p className="mt-4 rounded-xl bg-[#1B4F8C]/5 px-4 py-3 text-sm text-slate-700">
                  Jornada vs <strong>{opponent}</strong>
                  {scheduledMatchCategory ? ` · ${scheduledMatchCategory}` : ""}
                  {matchGovernance.isOfficial ? " · Oficial MiFicha" : ""}
                </p>

                {matchGovernance.isOfficial ? (
                  <OfficialMatchNotice className="mt-6" />
                ) : null}

                {captureBlockedMessage ? (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
                    <p className="font-semibold">Captura no disponible aún</p>
                    <p className="mt-2 leading-6">{captureBlockedMessage}</p>
                  </div>
                ) : null}

                {matchGovernance.hasOfficialResult && selectedFixture && !matchGovernance.hasOfficialActa ? (
                  <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-950">
                    <p className="font-semibold">Acta oficial pendiente</p>
                    <p className="mt-2 leading-6">
                      Marcador publicado: {formatOfficialScoreLine(selectedFixture)}. Falta
                      el acta con goles y tarjetas por jugador.
                    </p>
                  </div>
                ) : null}

                {matchGovernance.hasOfficialResult &&
                matchGovernance.hasOfficialActa &&
                selectedFixture ? (
                  <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      Listo para captura de plantel
                    </p>
                    <p className="mt-2 text-2xl font-bold text-emerald-950">
                      {formatOfficialScoreLine(selectedFixture)}
                    </p>
                    <p className="mt-2 text-sm text-emerald-900/80">
                      Marcador y acta verificados. Solo captura convocados y minutos.
                    </p>
                  </div>
                ) : null}

                <div className="mt-8 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Rival
                    </label>
                    <input
                      value={opponent}
                      readOnly
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-lg text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Fecha del partido
                    </label>
                    <input
                      type="date"
                      value={matchDate}
                      readOnly
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-lg text-slate-700"
                    />
                  </div>

                  {!matchGovernance.isOfficial ? (
                    <>
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
                    </>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => {
                      setScheduledMatchId(null);
                      setSelectedFixture(null);
                      setScheduledMatchCategory(null);
                    }}
                    className="text-sm font-medium text-slate-500 hover:text-slate-700"
                  >
                    ← Elegir otra jornada
                  </button>

                  {error ? (
                    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    disabled={Boolean(captureBlockedMessage)}
                    onClick={() => setStep(2)}
                    className="w-full rounded-2xl bg-[#1B4F8C] px-5 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Siguiente · convocados y minutos
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <MatchCaptureStep
            opponent={opponent}
            captureStyle={matchGovernance.isOfficial ? "quick" : captureStyle}
            listMode={listMode}
            convocadoIds={convocadoIds}
            visiblePlayers={visiblePlayers}
            captures={captures}
            rosterCategoryLabel={rosterCategoryLabel}
            scheduledMatchCategory={scheduledMatchCategory}
            playedCount={playedCount}
            academyCaptureScope={matchGovernance.academyCaptureScope}
            onCaptureStyleChange={setCaptureStyle}
            onListModeChange={setListMode}
            onToggleConvocado={toggleConvocado}
            onSelectAllConvocados={selectAllConvocados}
            onClearConvocados={clearConvocados}
            onEditConvocados={() => setConvocadoIds([])}
            onBulkMinutes={bulkMinutes}
            onUpdateCapture={updateCapture}
          />
        )}

        {step === 2 && error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}
      </div>

      {step === 2 ? (
        <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white p-4 shadow-lg">
          <div className="mx-auto flex max-w-3xl flex-col gap-2">
            {goalsMismatch ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-900">
                Suma de goles de jugadores ({playerGoalsTotal}) ≠ marcador (
                {effectiveGoalsFor}). Puedes guardar igual; revísalo si quieres coherencia.
              </p>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl px-4 py-4 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Atrás
              </button>
              <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                <p className="flex items-center justify-center text-sm text-slate-500 sm:mr-2">
                  {playedCount} jugador{playedCount === 1 ? "" : "es"} · modo{" "}
                  {captureStyle === "quick" ? "rápida" : "detallada"}
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="mf-btn-accent-solid flex-1 rounded-2xl px-5 py-4 text-base disabled:opacity-60"
                >
                  {saving ? "Guardando..." : "Guardar · avisar padres"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
