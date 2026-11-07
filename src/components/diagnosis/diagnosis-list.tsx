"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";
import { Skeleton } from "@/components/dashboard/skeletons";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { toast } from "@/components/ui/toast";
import { diagnosisAuthedFetch } from "@/lib/player-diagnosis-client";
import {
  DIAGNOSIS_KIND_LABELS,
  DIAGNOSIS_STAGE_LABELS,
  formatDiagnosisDate,
  scoreTone,
  type PlayerDiagnosisRecord,
} from "@/lib/player-diagnosis";
import { isFieldSessionDraft } from "@/lib/gph-field-protocol";
import { supabase } from "@/lib/supabase";
import type { Player } from "@/types/database";
import { cn } from "@/lib/utils";

const ALL_ACADEMIES = "";

const TONE_PILL: Record<ReturnType<typeof scoreTone>, string> = {
  danger: "bg-mf-danger-soft text-mf-danger",
  warning: "bg-mf-warning-soft text-mf-warning",
  success: "bg-mf-accent-soft text-mf-accent-dark",
  neutral: "bg-mf-canvas text-mf-text-muted",
};

type EnrichedDiagnosis = PlayerDiagnosisRecord & {
  player_first_name?: string;
  player_last_name?: string;
  player_photo_url?: string | null;
  academy_name?: string;
};

export function DiagnosisList() {
  const { academy, isGphEvaluator } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [diagnoses, setDiagnoses] = useState<EnrichedDiagnosis[]>([]);
  const [academies, setAcademies] = useState<Array<{ id: string; name: string }>>([]);
  /** Vacío = todas las academias (solo evaluador GPH / super admin). */
  const [academyId, setAcademyId] = useState(isGphEvaluator ? ALL_ACADEMIES : academy?.id ?? "");

  useEffect(() => {
    if (!isGphEvaluator && academy?.id && !academyId) setAcademyId(academy.id);
  }, [academy?.id, academyId, isGphEvaluator]);

  const load = useCallback(async () => {
    if (!academy && !isGphEvaluator) return;
    setLoading(true);
    try {
      if (isGphEvaluator) {
        const roster = await diagnosisAuthedFetch("/fut/api/diagnoses/academies");
        const list = (roster.academies as Array<{ id: string; name: string }>) ?? [];
        setAcademies(list);

        if (academyId === ALL_ACADEMIES) {
          const diagnosesPayload = await diagnosisAuthedFetch("/fut/api/diagnoses");
          setPlayers([]);
          setDiagnoses((diagnosesPayload.diagnoses as EnrichedDiagnosis[]) ?? []);
          return;
        }

        const selected = academyId;
        if (!selected) {
          setPlayers([]);
          setDiagnoses([]);
          return;
        }
        const [playersPayload, diagnosesPayload] = await Promise.all([
          diagnosisAuthedFetch(
            `/fut/api/diagnoses/players?academy_id=${encodeURIComponent(selected)}`,
          ),
          diagnosisAuthedFetch(
            `/fut/api/diagnoses?academy_id=${encodeURIComponent(selected)}`,
          ),
        ]);
        setPlayers((playersPayload.players as Player[]) ?? []);
        setDiagnoses((diagnosesPayload.diagnoses as EnrichedDiagnosis[]) ?? []);
        return;
      }

      if (!academy) return;
      const [{ data }, payload] = await Promise.all([
        supabase
          .from("players")
          .select("*")
          .eq("academy_id", academy.id)
          .order("last_name", { ascending: true }),
        diagnosisAuthedFetch(
          `/fut/api/diagnoses?academy_id=${encodeURIComponent(academy.id)}`,
        ),
      ]);
      setPlayers(data ?? []);
      setDiagnoses((payload.diagnoses as EnrichedDiagnosis[]) ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se cargó el listado.");
    } finally {
      setLoading(false);
    }
  }, [academy, academyId, isGphEvaluator]);

  useEffect(() => {
    void load();
  }, [load]);

  const byPlayer = useMemo(() => {
    const map = new Map<string, EnrichedDiagnosis[]>();
    for (const row of diagnoses) {
      const list = map.get(row.player_id) ?? [];
      list.push(row);
      map.set(row.player_id, list);
    }
    return map;
  }, [diagnoses]);

  const showGlobalList = isGphEvaluator && academyId === ALL_ACADEMIES;

  if (!academy && !isGphEvaluator) return <NoAcademyState />;

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mf-page-title">
            {isGphEvaluator ? "Diagnósticos GPH" : "Diagnósticos"}
          </h1>
          <p className="mt-1 text-sm text-mf-text-secondary">
            {showGlobalList
              ? "Todos los diagnósticos reales de la plataforma, de más reciente a más antiguo."
              : "Metodología GPH en cancha. Dato crudo, escala 1–5 y ficha de seguimiento."}
          </p>
          {isGphEvaluator ? (
            <label className="mt-3 block max-w-sm text-xs font-medium text-mf-text-secondary">
              Academia
              <select
                value={academyId}
                onChange={(event) => setAcademyId(event.target.value)}
                className="mf-input mt-1 text-sm"
              >
                <option value={ALL_ACADEMIES}>Todas las academias</option>
                {academies.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <Link
            href="/fut/dashboard/diagnostico/protocolo"
            className="mt-2 inline-block text-xs font-semibold text-mf-gph hover:underline"
          >
            Abrir protocolo de estaciones
          </Link>
        </div>
        <Link
          href={
            academyId
              ? `/fut/dashboard/diagnostico/nuevo?academy=${encodeURIComponent(academyId)}`
              : "/fut/dashboard/diagnostico/nuevo"
          }
          className="mf-btn-gph"
        >
          <Plus className="h-4 w-4" />
          Nueva evaluación
        </Link>
      </div>

      {showGlobalList ? (
        diagnoses.length === 0 ? (
          <div className="rounded-2xl border border-mf-border bg-white px-6 py-16 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-mf-text-muted" />
            <p className="mt-3 font-semibold text-mf-text">Sin diagnósticos aún</p>
            <p className="mt-1 text-sm text-mf-text-secondary">
              Cuando se guarde una evaluación real, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-mf-border bg-white">
            <div className="border-b border-mf-border-subtle px-4 py-3 text-xs text-mf-text-muted sm:px-5">
              {diagnoses.length} diagnóstico{diagnoses.length === 1 ? "" : "s"} en total
            </div>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-mf-border-subtle text-mf-text-muted">
                  <th className="px-4 py-3 font-medium sm:px-5">Jugador</th>
                  <th className="px-4 py-3 font-medium">Academia</th>
                  <th className="px-4 py-3 font-medium">Evaluación</th>
                  <th className="px-4 py-3 font-medium">Global</th>
                  <th className="px-4 py-3 font-medium">Etapa</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {diagnoses.map((row) => {
                  const stage = row.assigned_stage ?? row.computed_stage ?? null;
                  const tone = scoreTone(row.global_score ?? null);
                  return (
                    <tr key={row.id} className="border-b border-mf-border-subtle last:border-0">
                      <td className="px-4 py-3 sm:px-5">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar
                            firstName={row.player_first_name ?? "Jugador"}
                            lastName={row.player_last_name ?? ""}
                            photoUrl={row.player_photo_url ?? null}
                          />
                          <div>
                            <p className="font-medium text-mf-text">
                              {row.player_first_name} {row.player_last_name}
                            </p>
                            <p className="text-xs text-mf-text-muted">{row.evaluator_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-mf-text-secondary">
                        {row.academy_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-mf-text-secondary">
                        <span className="inline-flex flex-wrap items-center gap-1.5">
                          <span>
                            {DIAGNOSIS_KIND_LABELS[row.kind]} ·{" "}
                            {formatDiagnosisDate(row.evaluated_at)}
                          </span>
                          {isFieldSessionDraft(row.field_session) ? (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                              Borrador
                            </span>
                          ) : null}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row.global_score != null ? (
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
                              TONE_PILL[tone],
                            )}
                          >
                            {row.global_score.toFixed(1)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-mf-text-secondary">
                        {stage ? DIAGNOSIS_STAGE_LABELS[stage] : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isFieldSessionDraft(row.field_session) ? (
                          <Link
                            href={`/fut/dashboard/diagnostico/${row.id}/editar`}
                            className="text-xs font-semibold text-mf-brand hover:underline"
                          >
                            Continuar
                          </Link>
                        ) : (
                          <Link
                            href={`/fut/dashboard/diagnostico/${row.id}`}
                            className="text-xs font-semibold text-mf-brand hover:underline"
                          >
                            Ver ficha
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : players.length === 0 ? (
        <div className="rounded-2xl border border-mf-border bg-white px-6 py-16 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-mf-text-muted" />
          <p className="mt-3 font-semibold text-mf-text">Sin plantel</p>
          <p className="mt-1 text-sm text-mf-text-secondary">
            Carga jugadores y luego abre su primera evaluación.
          </p>
          <Link href="/fut/dashboard/plantel" className="mf-btn-primary mt-4 inline-flex">
            Ir a plantel
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-mf-border bg-white">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-mf-border-subtle text-mf-text-muted">
                <th className="px-4 py-3 font-medium sm:px-5">Jugador</th>
                <th className="px-4 py-3 font-medium">Último diagnóstico</th>
                <th className="px-4 py-3 font-medium">Global</th>
                <th className="px-4 py-3 font-medium">Etapa</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {players.map((player) => {
                const latest = byPlayer.get(player.id)?.[0] ?? null;
                const stage = latest?.assigned_stage ?? latest?.computed_stage ?? null;
                const tone = scoreTone(latest?.global_score ?? null);
                return (
                  <tr key={player.id} className="border-b border-mf-border-subtle last:border-0">
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-3">
                        <PlayerAvatar
                          firstName={player.first_name}
                          lastName={player.last_name}
                          photoUrl={player.photo_url}
                        />
                        <div>
                          <p className="font-medium text-mf-text">
                            {player.first_name} {player.last_name}
                          </p>
                          <p className="text-xs text-mf-text-muted">
                            {(byPlayer.get(player.id)?.length ?? 0)} ficha
                            {(byPlayer.get(player.id)?.length ?? 0) === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-mf-text-secondary">
                      {latest ? (
                        <span className="inline-flex flex-wrap items-center gap-1.5">
                          <span>
                            {DIAGNOSIS_KIND_LABELS[latest.kind]} ·{" "}
                            {formatDiagnosisDate(latest.evaluated_at)}
                          </span>
                          {isFieldSessionDraft(latest.field_session) ? (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                              Borrador
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        "Sin evaluar"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {latest?.global_score != null ? (
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
                            TONE_PILL[tone],
                          )}
                        >
                          {latest.global_score.toFixed(1)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-mf-text-secondary">
                      {stage ? DIAGNOSIS_STAGE_LABELS[stage] : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {latest ? (
                          isFieldSessionDraft(latest.field_session) ? (
                            <Link
                              href={`/fut/dashboard/diagnostico/${latest.id}/editar`}
                              className="text-xs font-semibold text-mf-brand hover:underline"
                            >
                              Continuar
                            </Link>
                          ) : (
                            <Link
                              href={`/fut/dashboard/diagnostico/${latest.id}`}
                              className="text-xs font-semibold text-mf-brand hover:underline"
                            >
                              Ver ficha
                            </Link>
                          )
                        ) : null}
                        <Link
                          href={`/fut/dashboard/diagnostico/nuevo?player=${player.id}${academyId ? `&academy=${encodeURIComponent(academyId)}` : ""}`}
                          className="text-xs font-semibold text-mf-text-secondary hover:text-mf-brand"
                        >
                          Evaluar
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
