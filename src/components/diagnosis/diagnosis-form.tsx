"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles, Star } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { CoachBriefSection } from "@/components/diagnosis/coach-brief-section";
import { FieldSessionForm } from "@/components/diagnosis/field-session-form";
import { toast } from "@/components/ui/toast";
import { calculateAge, getPositionLabel } from "@/lib/dashboard-utils";
import { formatPlayerCategory } from "@/lib/player-category";
import {
  emptyFieldSession,
  fieldSessionProgress,
  flaggedIndicatorsFromField,
  scoresFromFieldSession,
  suggestPrioritiesFromField,
  GPH_VENUE_CODES,
  isFieldSessionDraft,
  protocolStageFromAge,
  type GphFieldSession,
} from "@/lib/gph-field-protocol";
import { diagnosisAuthedFetch } from "@/lib/player-diagnosis-client";
import {
  computeDiagnosisResult,
  DIAGNOSIS_ASSIGNED_GROUPS,
  DIAGNOSIS_GROUP_LABELS,
  DIAGNOSIS_KIND_LABELS,
  DIAGNOSIS_KINDS,
  DIAGNOSIS_MONTH_META,
  DIAGNOSIS_MONTHS,
  DIAGNOSIS_SCALE,
  DIAGNOSIS_SESSION_DAYS,
  DIAGNOSIS_STAGE_COPY,
  DIAGNOSIS_STAGE_LABELS,
  DIAGNOSIS_STAGES,
  emptyMonthlyPlan,
  indicatorsForModule,
  moduleFromPosition,
  suggestPriorities,
  type DiagnosisCoachBrief,
  type DiagnosisKind,
  type DiagnosisModule,
  type DiagnosisMonthlyPlan,
  type DiagnosisNotes,
  type DiagnosisPriorityItem,
  type DiagnosisScores,
  type DiagnosisStage,
  type PlayerDiagnosisRecord,
} from "@/lib/player-diagnosis";
import type { DominantFoot, Player } from "@/types/database";
import { dominantFootOptions, getDominantFootLabel, positionOptions } from "@/lib/player-utils";
import { cn } from "@/lib/utils";

interface DiagnosisFormProps {
  players: Player[];
  initialPlayerId?: string;
  academyId?: string;
  /** Continuar un avance guardado (borrador o ficha). */
  initialDiagnosis?: PlayerDiagnosisRecord;
  onPlayerCreated?: (player: Player) => void;
}

function fieldSessionForPlayer(player: Player | null): GphFieldSession {
  const age = player?.birth_date ? calculateAge(player.birth_date) : null;
  return emptyFieldSession(protocolStageFromAge(age));
}

export function DiagnosisForm({
  players,
  initialPlayerId,
  academyId,
  initialDiagnosis,
  onPlayerCreated,
}: DiagnosisFormProps) {
  const { academy, profile, isGphEvaluator } = useDashboard();
  const targetAcademyId =
    academyId || initialDiagnosis?.academy_id || academy?.id || "";
  const router = useRouter();
  const [diagnosisId, setDiagnosisId] = useState(initialDiagnosis?.id ?? "");
  const [playerId, setPlayerId] = useState(
    initialDiagnosis?.player_id ?? initialPlayerId ?? players[0]?.id ?? "",
  );
  const player = players.find((item) => item.id === playerId) ?? null;
  const diagnosisModule: DiagnosisModule = player
    ? moduleFromPosition(player.position)
    : "campo";
  const editingLockedPlayer = Boolean(initialDiagnosis);

  const [kind, setKind] = useState<DiagnosisKind>(initialDiagnosis?.kind ?? "inicial");
  const [evaluatedAt, setEvaluatedAt] = useState(
    initialDiagnosis?.evaluated_at ?? new Date().toISOString().slice(0, 10),
  );
  const [evaluatorName, setEvaluatorName] = useState(
    initialDiagnosis?.evaluator_name ||
      (isGphEvaluator ? "Gustavo Reyes · GPH" : (profile?.full_name ?? "")),
  );
  const [sessionDays, setSessionDays] = useState(initialDiagnosis?.session_days ?? "");
  const [yearsExperience, setYearsExperience] = useState(
    initialDiagnosis?.years_experience != null
      ? String(initialDiagnosis.years_experience)
      : "",
  );
  const [sessionsPerWeek, setSessionsPerWeek] = useState(
    initialDiagnosis?.sessions_per_week != null
      ? String(initialDiagnosis.sessions_per_week)
      : "",
  );
  const [injuries, setInjuries] = useState(initialDiagnosis?.injuries ?? "");
  const [playerGoal, setPlayerGoal] = useState(initialDiagnosis?.player_goal ?? "");
  const [familyGoal, setFamilyGoal] = useState(initialDiagnosis?.family_goal ?? "");
  const [whyJoin, setWhyJoin] = useState(initialDiagnosis?.why_join ?? "");
  const [medicalNotes, setMedicalNotes] = useState(initialDiagnosis?.medical_notes ?? "");
  const [assignedStage, setAssignedStage] = useState<DiagnosisStage | "">(
    initialDiagnosis?.assigned_stage ?? "",
  );
  const [assignedGroup, setAssignedGroup] = useState(
    initialDiagnosis?.assigned_group ?? "",
  );
  const [contextOpen, setContextOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [scores, setScores] = useState<DiagnosisScores>(initialDiagnosis?.scores ?? {});
  const [notes, setNotes] = useState<DiagnosisNotes>(initialDiagnosis?.notes ?? {});
  const [flagged, setFlagged] = useState<string[]>(initialDiagnosis?.flagged ?? []);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [priorities, setPriorities] = useState<DiagnosisPriorityItem[]>(
    initialDiagnosis?.program_priorities ?? [],
  );
  const [monthlyPlan, setMonthlyPlan] = useState<DiagnosisMonthlyPlan>(
    initialDiagnosis?.monthly_plan ?? emptyMonthlyPlan(),
  );
  const [fieldSession, setFieldSession] = useState<GphFieldSession>(() =>
    initialDiagnosis?.field_session
      ? initialDiagnosis.field_session
      : fieldSessionForPlayer(
          players.find(
            (item) =>
              item.id ===
              (initialDiagnosis?.player_id ?? initialPlayerId ?? players[0]?.id),
          ) ?? null,
        ),
  );
  const [adjustedIds, setAdjustedIds] = useState<string[]>([]);
  const [coachBrief, setCoachBrief] = useState<DiagnosisCoachBrief | null>(
    initialDiagnosis?.field_session.coachBrief ?? null,
  );
  const [coachNotes, setCoachNotes] = useState(
    initialDiagnosis?.assignment_notes ?? "",
  );
  const [coachBusy, setCoachBusy] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [aiFallback, setAiFallback] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quickFirst, setQuickFirst] = useState("");
  const [quickLast, setQuickLast] = useState("");
  const [quickBirth, setQuickBirth] = useState("");
  const [quickPosition, setQuickPosition] = useState<Player["position"]>("forward");
  const [quickJersey, setQuickJersey] = useState("");
  const [quickFoot, setQuickFoot] = useState<DominantFoot>("right");
  const [quickBusy, setQuickBusy] = useState(false);

  useEffect(() => {
    if (!targetAcademyId) return;
    let cancelled = false;
    void diagnosisAuthedFetch(
      `/fut/api/diagnoses/coach-brief?academy_id=${encodeURIComponent(targetAcademyId)}`,
    )
      .then((payload) => {
        if (!cancelled) setAiReady(payload.ai === true);
      })
      .catch(() => {
        if (!cancelled) setAiReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetAcademyId]);

  const required = useMemo(() => indicatorsForModule(diagnosisModule), [diagnosisModule]);
  const fieldScores = useMemo(
    () => scoresFromFieldSession(fieldSession, diagnosisModule),
    [fieldSession, diagnosisModule],
  );
  const mergedScores = useMemo(
    () => ({ ...fieldScores, ...scores }),
    [fieldScores, scores],
  );
  const stationProgress = useMemo(
    () => fieldSessionProgress(fieldSession, diagnosisModule),
    [fieldSession, diagnosisModule],
  );
  const result = useMemo(
    () => computeDiagnosisResult(mergedScores, diagnosisModule),
    [mergedScores, diagnosisModule],
  );

  const groups = (["comun", diagnosisModule, "fisico", "mental"] as const).map((group) => ({
    group,
    items: required.filter((item) => item.group === group),
  }));

  function setScore(id: string, value: number) {
    setScores((prev) => ({ ...prev, [id]: value }));
  }

  function toggleFlag(id: string) {
    setFlagged((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function toggleSessionDay(code: string) {
    const parts = sessionDays
      .split(/[,·]/)
      .map((item) => item.trim())
      .filter(Boolean);
    const next = parts.includes(code)
      ? parts.filter((item) => item !== code)
      : [...parts, code];
    setSessionDays(next.join(", "));
  }

  async function requestCoachBrief() {
    if (!targetAcademyId || !player) return null;
    return diagnosisAuthedFetch("/fut/api/diagnoses/coach-brief", {
      method: "POST",
      body: JSON.stringify({
        academy_id: targetAcademyId,
        player_id: player.id,
        kind,
        module: diagnosisModule,
        scores: mergedScores,
        notes,
        flagged: [
          ...new Set([...flagged, ...flaggedIndicatorsFromField(fieldSession, diagnosisModule)]),
        ],
        injuries,
        player_goal: playerGoal,
        family_goal: familyGoal,
        why_join: whyJoin,
        field_session: fieldSession,
      }),
    });
  }

  function applyCoachPayload(payload: Record<string, unknown>) {
    const brief = payload.brief as DiagnosisCoachBrief;
    setCoachBrief(brief);
    setFieldSession((prev) => ({ ...prev, coachBrief: brief }));
    const nextPriorities = Array.isArray(payload.program_priorities)
      ? (payload.program_priorities as DiagnosisPriorityItem[])
      : null;
    if (nextPriorities) setPriorities(nextPriorities);
    if (payload.monthly_plan) {
      setMonthlyPlan(payload.monthly_plan as DiagnosisMonthlyPlan);
      setPlanOpen(true);
    }
    if (typeof payload.assignment_notes === "string") {
      setCoachNotes(payload.assignment_notes);
    }
    setAiFallback(payload.ai_fallback === true);
    if (payload.ai === true) setAiReady(true);
    return {
      brief,
      priorities: nextPriorities,
      monthlyPlan: payload.monthly_plan as DiagnosisMonthlyPlan | undefined,
      assignmentNotes:
        typeof payload.assignment_notes === "string" ? payload.assignment_notes : null,
    };
  }

  async function generateCoach() {
    if (!player) return;
    if (result.scoredCount < 5) {
      toast.error("Valora al menos 5 indicadores para la lectura de entrenador.");
      return;
    }
    setCoachBusy(true);
    try {
      const payload = await requestCoachBrief();
      if (!payload) return;
      applyCoachPayload(payload);
      toast.success(
        payload.source === "ai"
          ? "Lectura de entrenador con IA aplicada al plan."
          : payload.ai_fallback
            ? "La IA no respondió. Se aplicó el motor GPH."
            : "Lectura GPH aplicada al plan. Revisa prioridades y ruta.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo generar la lectura.");
    } finally {
      setCoachBusy(false);
    }
  }

  async function save(mode: "draft" | "ready") {
    if (!targetAcademyId || !player) return;
    const liveScores = { ...scoresFromFieldSession(fieldSession, diagnosisModule), ...scores };
    const live = computeDiagnosisResult(liveScores, diagnosisModule);
    if (!evaluatorName.trim()) {
      toast.error("Escribe el nombre del evaluador.");
      return;
    }

    if (mode === "ready") {
      const stations = fieldSessionProgress(fieldSession, diagnosisModule);
      if (stations.filled < stations.total) {
        toast.error(
          `Faltan ${stations.total - stations.filled} pruebas de estación: ${stations.missing.map((test) => test.label).join(", ")}.`,
        );
        return;
      }
      if (!live.complete) {
        toast.error(
          `Faltan ${live.requiredCount - live.scoredCount} indicadores por valorar (físico, mental y lo que no midió la estación).`,
        );
        return;
      }
    }

    const mergedFlags = [
      ...new Set([...flagged, ...flaggedIndicatorsFromField(fieldSession, diagnosisModule)]),
    ];
    const venueLabel =
      GPH_VENUE_CODES.find((item) => item.id === fieldSession.venueCode)?.label || null;

    setSaving(true);
    try {
      let brief = coachBrief;
      let nextPriorities = priorities;
      let nextPlan = monthlyPlan;
      let nextNotes = coachNotes;
      let nextSession: GphFieldSession = {
        ...fieldSession,
        status: mode,
        coachBrief: brief,
      };

      if (mode === "ready" && !brief) {
        const generated = await requestCoachBrief();
        if (generated) {
          const applied = applyCoachPayload(generated);
          brief = applied.brief;
          if (applied.priorities) nextPriorities = applied.priorities;
          if (applied.monthlyPlan) nextPlan = applied.monthlyPlan;
          if (applied.assignmentNotes) nextNotes = applied.assignmentNotes;
          nextSession = { ...fieldSession, status: mode, coachBrief: brief };
        }
      }

      const body = {
        academy_id: targetAcademyId,
        player_id: player.id,
        kind,
        module: diagnosisModule,
        evaluated_at: evaluatedAt,
        evaluator_name: evaluatorName,
        venue: venueLabel,
        session_days: sessionDays || null,
        years_experience:
          yearsExperience.trim() === "" || !Number.isFinite(Number(yearsExperience))
            ? null
            : Number(yearsExperience),
        sessions_per_week:
          sessionsPerWeek.trim() === "" || !Number.isFinite(Number(sessionsPerWeek))
            ? null
            : Number(sessionsPerWeek),
        injuries: injuries || null,
        why_join: whyJoin || null,
        player_goal: playerGoal || null,
        family_goal: familyGoal || null,
        medical_notes: medicalNotes || null,
        scores: liveScores,
        notes,
        flagged: mergedFlags,
        assigned_stage: assignedStage || live.stage,
        assigned_group: assignedGroup || null,
        program_priorities: nextPriorities,
        monthly_plan: nextPlan,
        assignment_notes: nextNotes || null,
        field_session: nextSession,
      };

      const payload = diagnosisId
        ? await diagnosisAuthedFetch(`/fut/api/diagnoses/${diagnosisId}`, {
            method: "PUT",
            body: JSON.stringify(body),
          })
        : await diagnosisAuthedFetch("/fut/api/diagnoses", {
            method: "POST",
            body: JSON.stringify(body),
          });

      const diagnosis = payload.diagnosis as { id: string };
      setDiagnosisId(diagnosis.id);
      setFieldSession(nextSession);
      const shareUrl = typeof payload.share_url === "string" ? payload.share_url : "";
      if (shareUrl) {
        sessionStorage.setItem(`diagnosis-share:${diagnosis.id}`, shareUrl);
      }

      if (mode === "draft") {
        toast.success(
          "Avance guardado. Puedes cerrar y continuar después desde Diagnósticos.",
        );
        router.push(`/fut/dashboard/diagnostico/${diagnosis.id}`);
      } else {
        toast.success("Ficha lista: dato, 1–5, lectura y plan.");
        router.push(`/fut/dashboard/diagnostico/${diagnosis.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function createQuickPlayer() {
    if (!targetAcademyId) return;
    if (!quickFirst.trim() || !quickLast.trim() || !quickBirth) {
      toast.error("Nombre, apellido y fecha de nacimiento.");
      return;
    }
    setQuickBusy(true);
    try {
      const payload = await diagnosisAuthedFetch("/fut/api/diagnoses/players", {
        method: "POST",
        body: JSON.stringify({
          academy_id: targetAcademyId,
          first_name: quickFirst.trim(),
          last_name: quickLast.trim(),
          birth_date: quickBirth,
          position: quickPosition,
          jersey_number: quickJersey ? Number(quickJersey) : null,
          dominant_foot: quickFoot,
        }),
      });
      const created = payload.player as Player;
      onPlayerCreated?.(created);
      setPlayerId(created.id);
      setFieldSession(fieldSessionForPlayer(created));
      toast.success("Jugador listo. Sigue con las estaciones.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el jugador.");
    } finally {
      setQuickBusy(false);
    }
  }

  if (!targetAcademyId) return null;

  if (players.length === 0) {
    return (
      <div className="rounded-2xl border border-mf-border bg-white p-6 sm:p-8">
        <p className="font-semibold text-mf-text">Alta rápida para evaluar</p>
        <p className="mt-1 text-sm text-mf-text-secondary">
          Nombre, fecha y posición. El resto de la ficha se llena en cancha.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-mf-text-muted">
            Nombre
            <input
              value={quickFirst}
              onChange={(e) => setQuickFirst(e.target.value)}
              className="mf-input mt-1"
            />
          </label>
          <label className="text-xs font-medium text-mf-text-muted">
            Apellido
            <input
              value={quickLast}
              onChange={(e) => setQuickLast(e.target.value)}
              className="mf-input mt-1"
            />
          </label>
          <label className="text-xs font-medium text-mf-text-muted">
            Fecha de nacimiento
            <input
              type="date"
              value={quickBirth}
              onChange={(e) => setQuickBirth(e.target.value)}
              className="mf-input mt-1"
            />
          </label>
          <label className="text-xs font-medium text-mf-text-muted">
            Posición
            <select
              value={quickPosition}
              onChange={(e) => setQuickPosition(e.target.value as Player["position"])}
              className="mf-input mt-1"
            >
              {positionOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-mf-text-muted">
            Perfil
            <select
              value={quickFoot}
              onChange={(e) => setQuickFoot(e.target.value as DominantFoot)}
              className="mf-input mt-1"
            >
              {dominantFootOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-mf-text-muted">
            Dorsal
            <input
              value={quickJersey}
              onChange={(e) => setQuickJersey(e.target.value)}
              className="mf-input mt-1"
              inputMode="numeric"
              placeholder="Opcional"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={quickBusy}
          onClick={() => void createQuickPlayer()}
          className="mf-btn-primary mt-4"
        >
          {quickBusy ? "Creando…" : "Crear y evaluar"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {diagnosisId ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {isFieldSessionDraft(fieldSession)
            ? "Avance en captura. Guarda cuando quieras y continúa después; Generar ficha cierra el diagnóstico completo."
            : "Editando una ficha ya generada. Guardar avance la marca otra vez como borrador; Generar ficha la vuelve a cerrar."}
        </div>
      ) : (
        <p className="text-sm text-mf-text-secondary">
          Si no terminas hoy: <span className="font-semibold text-mf-text">Guardar avance</span>{" "}
          y sigue en otra sesión. No hace falta apuntar todo en Excel.
        </p>
      )}

      <ol className="grid gap-2 sm:grid-cols-3">
        <li className="rounded-xl border border-mf-border bg-white px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-brand">1 · Cancha</p>
          <p className="mt-1 text-xs leading-5 text-mf-text-secondary">
            Llena cada prueba en su unidad (contactos, segundos, aciertos/puntos, metros).
            Acepta coma o punto.
          </p>
        </li>
        <li className="rounded-xl border border-mf-border bg-white px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-brand">2 · Cierre 1–5</p>
          <p className="mt-1 text-xs leading-5 text-mf-text-secondary">
            Técnica y decisión se cargan solas desde las estaciones. Completa físico y mental.
          </p>
        </li>
        <li className="rounded-xl border border-mf-border bg-white px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-brand">3 · Ficha</p>
          <p className="mt-1 text-xs leading-5 text-mf-text-secondary">
            Guarda avance a medias, o genera la ficha completa con lectura y plan.
          </p>
        </li>
      </ol>

      <div className="sticky top-0 z-20 -mx-1 rounded-xl border border-mf-border bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
              Resultado en vivo
            </p>
            <p className="text-lg font-semibold tabular-nums text-mf-brand">
              {result.globalScore == null ? "—" : result.globalScore.toFixed(1)}
              <span className="ml-2 text-sm font-medium text-mf-text-secondary">
                {result.stage ? DIAGNOSIS_STAGE_LABELS[result.stage] : "Completa la escala"}
              </span>
            </p>
            <p className="text-[11px] text-mf-text-muted">
              Estaciones {stationProgress.filled}/{stationProgress.total} · Cierre {result.scoredCount}/
              {result.requiredCount}
              {isFieldSessionDraft(fieldSession) || !diagnosisId
                ? " · Puedes guardar avance sin terminar"
                : ""}
            </p>
          </div>
          <p className="text-xs text-mf-text-muted">
            {result.scoredCount}/{result.requiredCount} indicadores
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={coachBusy || saving || result.scoredCount < 5}
              onClick={() => void generateCoach()}
              className="mf-btn-accent"
            >
              {coachBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Lectura de entrenador
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save("draft")}
              className="rounded-lg border border-mf-border bg-white px-4 py-2.5 text-sm font-semibold text-mf-text hover:bg-mf-canvas disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Guardar avance
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save("ready")}
              className="mf-btn-primary"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "Armando ficha…" : "Generar ficha"}
            </button>
          </div>
        </div>
      </div>

      <section className="grid gap-3 rounded-2xl border border-mf-border bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-medium text-mf-text-muted sm:col-span-2">
          Jugador
          <select
            value={playerId}
            disabled={editingLockedPlayer}
            onChange={(e) => {
              const nextId = e.target.value;
              const nextPlayer = players.find((item) => item.id === nextId) ?? null;
              setPlayerId(nextId);
              setScores({});
              setNotes({});
              setFlagged([]);
              setAdjustedIds([]);
              setFieldSession(fieldSessionForPlayer(nextPlayer));
              setCoachBrief(null);
              setCoachNotes("");
              setAiFallback(false);
              setPriorities([]);
              setMonthlyPlan(emptyMonthlyPlan());
              setAssignedStage("");
              setAssignedGroup("");
            }}
            className="mf-input mt-1 disabled:opacity-70"
          >
            {players.map((item) => (
              <option key={item.id} value={item.id}>
                {item.last_name}, {item.first_name} · {getPositionLabel(item.position)}
              </option>
            ))}
          </select>
          {player ? (
            <p className="mt-1.5 text-[11px] text-mf-text-secondary">
              {formatPlayerCategory(player.birth_date)} ·{" "}
              {player.birth_date ? `${calculateAge(player.birth_date)} años` : "edad —"}
              {player.dominant_foot
                ? ` · ${getDominantFootLabel(player.dominant_foot)}`
                : ""}
              {player.jersey_number != null ? ` · #${player.jersey_number}` : ""}
            </p>
          ) : null}
        </label>
        <label className="text-xs font-medium text-mf-text-muted">
          Tipo
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as DiagnosisKind)}
            className="mf-input mt-1"
          >
            {DIAGNOSIS_KINDS.map((item) => (
              <option key={item} value={item}>
                {DIAGNOSIS_KIND_LABELS[item]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-mf-text-muted">
          Fecha
          <input
            type="date"
            value={evaluatedAt}
            onChange={(e) => setEvaluatedAt(e.target.value)}
            className="mf-input mt-1"
          />
        </label>
        <label className="text-xs font-medium text-mf-text-muted sm:col-span-2">
          Evaluador
          <input
            value={evaluatorName}
            onChange={(e) => setEvaluatorName(e.target.value)}
            className="mf-input mt-1"
            placeholder="Nombre del evaluador"
          />
        </label>
        <div className="text-xs font-medium text-mf-text-muted">
          Días
          <div className="mt-1 flex flex-wrap gap-2">
            {DIAGNOSIS_SESSION_DAYS.map((day) => {
              const active = sessionDays.split(/[,·]/).map((item) => item.trim()).includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleSessionDay(day)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium",
                    active
                      ? "border-mf-brand bg-mf-brand-soft text-mf-brand"
                      : "border-mf-border text-mf-text-secondary",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
        <label className="text-xs font-medium text-mf-text-muted">
          Años de experiencia
          <input
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            className="mf-input mt-1"
            inputMode="decimal"
            placeholder="4"
          />
        </label>
        <label className="text-xs font-medium text-mf-text-muted">
          Sesiones / semana
          <input
            value={sessionsPerWeek}
            onChange={(e) => setSessionsPerWeek(e.target.value)}
            className="mf-input mt-1"
            inputMode="numeric"
            placeholder="2"
          />
        </label>
      </section>

      <section className="rounded-2xl border border-mf-border bg-white">
        <button
          type="button"
          onClick={() => setContextOpen((open) => !open)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-mf-text"
        >
          Motivo y contexto
          <span className="text-xs font-medium text-mf-text-muted">
            {contextOpen ? "Ocultar" : "Opcional"}
          </span>
        </button>
        {contextOpen ? (
          <div className="grid gap-3 border-t border-mf-border-subtle px-4 py-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-mf-text-muted sm:col-span-2">
              ¿Por qué busca ingresar?
              <textarea
                value={whyJoin}
                onChange={(e) => setWhyJoin(e.target.value)}
                className="mf-input mt-1 min-h-20"
              />
            </label>
            <label className="text-xs font-medium text-mf-text-muted">
              Objetivo del jugador
              <input
                value={playerGoal}
                onChange={(e) => setPlayerGoal(e.target.value)}
                className="mf-input mt-1"
              />
            </label>
            <label className="text-xs font-medium text-mf-text-muted">
              Objetivo de la familia
              <input
                value={familyGoal}
                onChange={(e) => setFamilyGoal(e.target.value)}
                className="mf-input mt-1"
              />
            </label>
            <label className="text-xs font-medium text-mf-text-muted sm:col-span-2">
              Lesiones / restricciones
              <input
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
                className="mf-input mt-1"
              />
            </label>
            <label className="text-xs font-medium text-mf-text-muted sm:col-span-2">
              Antecedentes médicos, físicos, nutricionales o emocionales
              <textarea
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                className="mf-input mt-1 min-h-20"
                placeholder="Se reportan aparte; no entran al puntaje de fútbol."
              />
            </label>
          </div>
        ) : null}
      </section>

      <FieldSessionForm
        academyId={targetAcademyId}
        module={diagnosisModule}
        session={fieldSession}
        onChange={setFieldSession}
      />

      <section className="rounded-2xl border border-mf-border bg-white p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-mf-text">2. Calificación de cierre 1–5</h2>
            <p className="mt-1 text-xs text-mf-text-muted">
              Lo que ya midió la estación aparece cerrado. Completa físico, mental y lo que
              falte. Toca «Ajustar» solo si el 1–5 de cancha no convence.{" "}
              {DIAGNOSIS_SCALE.map((item) => `${item.value} ${item.label}`).join(" · ")}
            </p>
          </div>
          <p className="text-xs text-mf-text-muted">
            Módulo {diagnosisModule === "portero" ? "portero" : "jugador de campo"}
          </p>
        </div>

        <div className="mt-5 space-y-6">
          {groups.map(({ group, items }) => (
            <div key={group}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                {DIAGNOSIS_GROUP_LABELS[group]}
              </p>
              <div className="divide-y divide-mf-border-subtle rounded-xl border border-mf-border-subtle">
                {items.map((item) => {
                  const score = mergedScores[item.id];
                  const fromStation = fieldScores[item.id];
                  const manual = scores[item.id];
                  const compact =
                    fromStation != null &&
                    manual == null &&
                    !adjustedIds.includes(item.id);
                  return (
                    <div key={item.id} className="px-3 py-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="min-w-[160px] flex-1">
                          <p className="text-sm font-medium text-mf-text">
                            {item.label}
                            {fromStation != null && manual == null ? (
                              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-mf-gph">
                                estación
                              </span>
                            ) : null}
                            {fromStation != null && manual != null && manual !== fromStation ? (
                              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-mf-warning">
                                ajustado
                              </span>
                            ) : null}
                          </p>
                          {compact ? null : (
                            <p className="text-[11px] text-mf-text-muted">{item.criterion}</p>
                          )}
                        </div>
                        {compact ? (
                          <>
                            <p className="text-sm font-semibold tabular-nums text-mf-gph">
                              {fromStation}/5
                            </p>
                            <button
                              type="button"
                              onClick={() => setAdjustedIds((prev) => [...prev, item.id])}
                              className="text-[11px] font-medium text-mf-text-muted hover:text-mf-brand"
                            >
                              Ajustar
                            </button>
                          </>
                        ) : (
                          <div className="flex gap-1">
                            {DIAGNOSIS_SCALE.map((level) => (
                              <button
                                key={level.value}
                                type="button"
                                title={level.hint}
                                onClick={() => setScore(item.id, level.value)}
                                className={cn(
                                  "h-9 w-9 rounded-lg text-sm font-semibold tabular-nums",
                                  score === level.value
                                    ? "bg-mf-brand text-white"
                                    : "bg-mf-canvas text-mf-text-secondary hover:bg-mf-brand-soft",
                                )}
                              >
                                {level.value}
                              </button>
                            ))}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleFlag(item.id)}
                          className={cn(
                            "rounded-lg p-2",
                            flagged.includes(item.id)
                              ? "text-mf-brand"
                              : "text-mf-text-muted hover:text-mf-brand",
                          )}
                          title="Marcar prioridad"
                        >
                          <Star
                            className="h-4 w-4"
                            fill={flagged.includes(item.id) ? "currentColor" : "none"}
                          />
                        </button>
                        {compact ? null : (
                          <button
                            type="button"
                            onClick={() =>
                              setOpenNoteId((current) => (current === item.id ? null : item.id))
                            }
                            className="text-[11px] font-medium text-mf-text-muted hover:text-mf-brand"
                          >
                            Nota
                          </button>
                        )}
                      </div>
                      {openNoteId === item.id ? (
                        <input
                          value={notes[item.id] ?? ""}
                          onChange={(e) =>
                            setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder="Observación breve"
                          className="mf-input mt-2"
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-mf-border bg-white p-4">
        <h2 className="text-base font-semibold text-mf-text">Asignación recomendada</h2>
        <p className="mt-1 text-xs text-mf-text-muted">
          La etapa no depende solo del promedio: edad, experiencia, seguridad, posición y
          contexto también cuentan. Calculada:{" "}
          {result.stage ? DIAGNOSIS_STAGE_LABELS[result.stage] : "completa la escala"}.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-mf-text-muted">
            Etapa asignada
            <select
              value={assignedStage}
              onChange={(e) => setAssignedStage(e.target.value as DiagnosisStage | "")}
              className="mf-input mt-1"
            >
              <option value="">Usar la calculada</option>
              {DIAGNOSIS_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {DIAGNOSIS_STAGE_LABELS[stage]}
                  {result.stage === stage ? " · calculada" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-mf-text-muted">
            Subcategoría / grupo
            <select
              value={assignedGroup}
              onChange={(e) => setAssignedGroup(e.target.value)}
              className="mf-input mt-1"
            >
              <option value="">Sin grupo</option>
              {DIAGNOSIS_ASSIGNED_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-mf-text-muted sm:col-span-2">
            Observaciones de asignación
            <input
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              className="mf-input mt-1"
              placeholder="Sede, días, rol, seguridad…"
            />
          </label>
        </div>
        {assignedStage && result.stage && assignedStage !== result.stage ? (
          <p className="mt-2 text-[11px] text-mf-warning">
            {DIAGNOSIS_STAGE_COPY[assignedStage]} Distinto al promedio (
            {DIAGNOSIS_STAGE_LABELS[result.stage]}).
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-mf-border bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-mf-text">Lectura de entrenador</h2>
            <p className="mt-1 text-xs text-mf-text-muted">
              Traduce etapa, puntajes y estación a comentarios de staff, foco de sesión y
              ruta. {aiReady
                ? "IA activa: redacta como entrenador y preparador."
                : "Motor GPH de staff activo. Si conectas IA en el servidor, la redacción se afinará."}
            </p>
          </div>
          <button
            type="button"
            disabled={coachBusy || result.scoredCount < 5}
            onClick={() => void generateCoach()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-mf-brand-soft px-3 py-2 text-xs font-semibold text-mf-brand hover:bg-mf-brand hover:text-white disabled:opacity-50"
          >
            {coachBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {coachBrief ? "Regenerar lectura" : "Generar lectura"}
          </button>
        </div>
        {aiFallback ? (
          <p className="mt-2 text-xs text-mf-warning">
            La IA no respondió; se usó el motor GPH.
          </p>
        ) : null}
        {coachBrief ? (
          <div className="mt-4 border-t border-mf-border-subtle pt-4">
            <CoachBriefSection brief={coachBrief} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-mf-text-muted">
            Opcional para revisar antes. Si no la generas aquí, se arma al pulsar Generar ficha.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-mf-border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-mf-text">Prioridades (3 a 5)</h2>
          <button
            type="button"
            onClick={() =>
              setPriorities(
                suggestPrioritiesFromField(fieldSession, diagnosisModule).length
                  ? suggestPrioritiesFromField(fieldSession, diagnosisModule)
                  : suggestPriorities(mergedScores, diagnosisModule),
              )
            }
            className="text-xs font-semibold text-mf-brand hover:underline"
          >
            Proponer desde puntajes bajos
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {priorities.map((item, index) => (
            <div key={`${item.title}-${index}`} className="grid gap-2 rounded-xl bg-mf-canvas p-3 sm:grid-cols-2">
              <input
                value={item.title}
                onChange={(e) => {
                  const next = [...priorities];
                  next[index] = { ...item, title: e.target.value };
                  setPriorities(next);
                }}
                className="mf-input"
                placeholder="Prioridad"
              />
              <input
                value={item.december_goal}
                onChange={(e) => {
                  const next = [...priorities];
                  next[index] = { ...item, december_goal: e.target.value };
                  setPriorities(next);
                }}
                className="mf-input"
                placeholder="Meta a diciembre"
              />
              <input
                value={item.baseline}
                onChange={(e) => {
                  const next = [...priorities];
                  next[index] = { ...item, baseline: e.target.value };
                  setPriorities(next);
                }}
                className="mf-input"
                placeholder="Línea base"
              />
              <input
                value={item.progress_indicator}
                onChange={(e) => {
                  const next = [...priorities];
                  next[index] = { ...item, progress_indicator: e.target.value };
                  setPriorities(next);
                }}
                className="mf-input"
                placeholder="Indicador de avance"
              />
              <input
                value={item.main_action}
                onChange={(e) => {
                  const next = [...priorities];
                  next[index] = { ...item, main_action: e.target.value };
                  setPriorities(next);
                }}
                className="mf-input sm:col-span-2"
                placeholder="Acción principal"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-mf-border bg-white">
        <button
          type="button"
          onClick={() => setPlanOpen((open) => !open)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-mf-text"
        >
          Ruta septiembre–diciembre
          <span className="text-xs font-medium text-mf-text-muted">
            {planOpen ? "Ocultar" : "Opcional"}
          </span>
        </button>
        {planOpen ? (
          <div className="grid gap-3 border-t border-mf-border-subtle p-4 sm:grid-cols-2">
            {DIAGNOSIS_MONTHS.map((month) => (
              <div key={month} className="rounded-xl bg-mf-canvas p-3">
                <p className="text-sm font-semibold text-mf-brand">
                  {DIAGNOSIS_MONTH_META[month].label}
                </p>
                <p className="text-[11px] text-mf-text-muted">
                  {DIAGNOSIS_MONTH_META[month].focus}
                </p>
                <input
                  value={monthlyPlan[month].objective}
                  onChange={(e) =>
                    setMonthlyPlan((prev) => ({
                      ...prev,
                      [month]: { ...prev[month], objective: e.target.value },
                    }))
                  }
                  className="mf-input mt-2"
                  placeholder="Objetivo"
                />
                <input
                  value={monthlyPlan[month].actions}
                  onChange={(e) =>
                    setMonthlyPlan((prev) => ({
                      ...prev,
                      [month]: { ...prev[month], actions: e.target.value },
                    }))
                  }
                  className="mf-input mt-2"
                  placeholder="Acciones"
                />
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
