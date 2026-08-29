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
import { supabase } from "@/lib/supabase";
import type { Player } from "@/types/database";
import { cn } from "@/lib/utils";

const TONE_PILL: Record<ReturnType<typeof scoreTone>, string> = {
  danger: "bg-mf-danger-soft text-mf-danger",
  warning: "bg-mf-warning-soft text-mf-warning",
  success: "bg-mf-accent-soft text-mf-accent-dark",
  neutral: "bg-mf-canvas text-mf-text-muted",
};

export function DiagnosisList() {
  const { academy, isGphEvaluator } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [diagnoses, setDiagnoses] = useState<PlayerDiagnosisRecord[]>([]);
  const [academies, setAcademies] = useState<Array<{ id: string; name: string }>>([]);
  const [academyId, setAcademyId] = useState(academy?.id ?? "");

  useEffect(() => {
    if (academy?.id && !academyId) setAcademyId(academy.id);
  }, [academy?.id, academyId]);

  const load = useCallback(async () => {
    if (!academy && !isGphEvaluator) return;
    setLoading(true);
    try {
      if (isGphEvaluator) {
        const roster = await diagnosisAuthedFetch("/fut/api/diagnoses/academies");
        const list = (roster.academies as Array<{ id: string; name: string }>) ?? [];
        setAcademies(list);
        const selected = academyId || academy?.id || list[0]?.id || "";
        if (selected && selected !== academyId) setAcademyId(selected);
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
        setDiagnoses((diagnosesPayload.diagnoses as PlayerDiagnosisRecord[]) ?? []);
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
      setDiagnoses((payload.diagnoses as PlayerDiagnosisRecord[]) ?? []);
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
    const map = new Map<string, PlayerDiagnosisRecord[]>();
    for (const row of diagnoses) {
      const list = map.get(row.player_id) ?? [];
      list.push(row);
      map.set(row.player_id, list);
    }
    return map;
  }, [diagnoses]);

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
            Metodología GPH en cancha. Dato crudo, escala 1–5 y ficha de seguimiento.
          </p>
          {isGphEvaluator && academies.length > 0 ? (
            <label className="mt-3 block max-w-sm text-xs font-medium text-mf-text-secondary">
              Academia
              <select
                value={academyId}
                onChange={(event) => setAcademyId(event.target.value)}
                className="mf-input mt-1 text-sm"
              >
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

      {players.length === 0 ? (
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
                      {latest
                        ? `${DIAGNOSIS_KIND_LABELS[latest.kind]} · ${formatDiagnosisDate(latest.evaluated_at)}`
                        : "Sin evaluar"}
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
                          <Link
                            href={`/fut/dashboard/diagnostico/${latest.id}`}
                            className="text-xs font-semibold text-mf-brand hover:underline"
                          >
                            Ver ficha
                          </Link>
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
