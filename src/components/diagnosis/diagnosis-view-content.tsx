"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { DiagnosisReport } from "@/components/diagnosis/diagnosis-report";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";
import { Skeleton } from "@/components/dashboard/skeletons";
import { toast } from "@/components/ui/toast";
import { diagnosisAuthedFetch } from "@/lib/player-diagnosis-client";
import { isFieldSessionDraft } from "@/lib/gph-field-protocol";
import {
  DIAGNOSIS_STAGE_LABELS,
  DIAGNOSIS_STAGES,
  type DiagnosisAcademySnapshot,
  type DiagnosisPlayerSnapshot,
  type DiagnosisStage,
  type PlayerDiagnosisRecord,
} from "@/lib/player-diagnosis";

export function DiagnosisViewContent({ diagnosisId }: { diagnosisId: string }) {
  const { academy, isGphEvaluator } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<PlayerDiagnosisRecord | null>(null);
  const [player, setPlayer] = useState<DiagnosisPlayerSnapshot | null>(null);
  const [academySnap, setAcademySnap] = useState<DiagnosisAcademySnapshot | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [coachBusy, setCoachBusy] = useState(false);
  const [familyDraft, setFamilyDraft] = useState("");
  const [stageDraft, setStageDraft] = useState<DiagnosisStage | "">("");
  const [savingCopy, setSavingCopy] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`diagnosis-share:${diagnosisId}`);
    if (stored) setShareUrl(stored);
  }, [diagnosisId]);

  useEffect(() => {
    if (!academy && !isGphEvaluator) return;
    let cancelled = false;
    setLoading(true);
    void diagnosisAuthedFetch(`/fut/api/diagnoses/${diagnosisId}`)
      .then((payload) => {
        if (cancelled) return;
        setDiagnosis(payload.diagnosis as PlayerDiagnosisRecord);
        setPlayer(payload.player as DiagnosisPlayerSnapshot);
        setAcademySnap(payload.academy as DiagnosisAcademySnapshot);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se cargó la ficha.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [academy, diagnosisId, isGphEvaluator]);

  useEffect(() => {
    if (!diagnosis) return;
    setFamilyDraft(diagnosis.field_session.coachBrief?.family ?? "");
    setStageDraft(diagnosis.assigned_stage ?? "");
  }, [diagnosis]);

  if (!academy && !isGphEvaluator) return <NoAcademyState />;

  if (loading) {
    return <Skeleton className="h-[640px] w-full rounded-2xl" />;
  }

  if (error || !diagnosis || !player || !academySnap) {
    return (
      <div className="rounded-2xl border border-mf-border bg-white p-8 text-center">
        <p className="font-semibold text-mf-text">{error ?? "Ficha no encontrada."}</p>
        <Link href="/fut/dashboard/diagnostico" className="mt-3 inline-block text-sm font-semibold text-mf-brand">
          Volver a diagnósticos
        </Link>
      </div>
    );
  }

  async function saveFamilyAndStage() {
    if (!diagnosis) return;
    setSavingCopy(true);
    try {
      const brief = diagnosis.field_session.coachBrief;
      const payload = await diagnosisAuthedFetch(`/fut/api/diagnoses/${diagnosisId}`, {
        method: "PUT",
        body: JSON.stringify({
          academy_id: diagnosis.academy_id,
          assigned_stage: stageDraft || null,
          field_session: {
            ...diagnosis.field_session,
            coachBrief: brief ? { ...brief, family: familyDraft } : brief,
          },
        }),
      });
      setDiagnosis(payload.diagnosis as PlayerDiagnosisRecord);
      toast.success("Texto y etapa guardados.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSavingCopy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/fut/dashboard/diagnostico"
          className="inline-flex items-center gap-1 text-sm text-mf-text-secondary hover:text-mf-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Diagnósticos
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/fut/dashboard/diagnostico/${diagnosisId}/editar`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-mf-border bg-white px-3 py-2 text-xs font-semibold text-mf-text hover:bg-mf-canvas"
          >
            {isFieldSessionDraft(diagnosis.field_session)
              ? "Continuar captura"
              : "Editar captura"}
          </Link>
          <button
            type="button"
            disabled={coachBusy || isFieldSessionDraft(diagnosis.field_session)}
            onClick={() => {
              setCoachBusy(true);
              void diagnosisAuthedFetch(`/fut/api/diagnoses/${diagnosisId}/coach-brief`, {
                method: "POST",
                body: JSON.stringify({ academy_id: diagnosis.academy_id }),
              })
                .then((payload) => {
                  setDiagnosis(payload.diagnosis as PlayerDiagnosisRecord);
                  if (payload.ai_fallback) {
                    toast.success("La IA no respondió; se aplicó el motor GPH.");
                  } else {
                    toast.success(
                      payload.source === "ai"
                        ? "Lectura de entrenador actualizada con IA."
                        : "Lectura GPH actualizada.",
                    );
                  }
                })
                .catch((err: unknown) => {
                  toast.error(err instanceof Error ? err.message : "No se pudo generar.");
                })
                .finally(() => setCoachBusy(false));
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-mf-brand-soft px-3 py-2 text-xs font-semibold text-mf-brand hover:bg-mf-brand hover:text-white disabled:opacity-50"
          >
            {coachBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {diagnosis.field_session.coachBrief ? "Regenerar lectura" : "Lectura de entrenador"}
          </button>
        </div>
      </div>

      {!isFieldSessionDraft(diagnosis.field_session) ? (
        <div className="rounded-2xl border border-mf-border bg-white p-4">
          <p className="text-sm font-semibold text-mf-text">Editar ficha para la familia</p>
          <p className="mt-1 text-[11px] text-mf-text-muted">
            El comentario de arriba se genera solo. Aquí lo cambias sin volver a correr las
            pruebas. La etapa asignada es la que debe verse (no el promedio).
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[12rem_1fr]">
            <label className="text-xs font-medium text-mf-text-muted">
              Etapa asignada
              <select
                value={stageDraft}
                onChange={(e) => setStageDraft(e.target.value as DiagnosisStage | "")}
                className="mf-input mt-1"
              >
                <option value="">Usar la calculada</option>
                {DIAGNOSIS_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {DIAGNOSIS_STAGE_LABELS[stage]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-mf-text-muted sm:col-span-1">
              Texto para la familia
              <textarea
                value={familyDraft}
                onChange={(e) => setFamilyDraft(e.target.value)}
                className="mf-input mt-1 min-h-24"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={savingCopy}
            onClick={() => void saveFamilyAndStage()}
            className="mf-btn-primary mt-3"
          >
            {savingCopy ? "Guardando…" : "Guardar texto y etapa"}
          </button>
        </div>
      ) : null}

      {isFieldSessionDraft(diagnosis.field_session) ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Borrador: todavía no es la ficha final. Continúa la captura cuando tengas más pruebas;
          el link público no se entrega hasta generar la ficha.
        </div>
      ) : null}

      <DiagnosisReport
        diagnosis={diagnosis}
        player={player}
        academy={academySnap}
        shareUrl={isFieldSessionDraft(diagnosis.field_session) ? null : shareUrl}
        onCreateShareLink={
          isFieldSessionDraft(diagnosis.field_session)
            ? undefined
            : async () => {
                const payload = await diagnosisAuthedFetch(
                  `/fut/api/diagnoses/${diagnosisId}/share`,
                  {
                    method: "POST",
                    body: JSON.stringify({ academy_id: diagnosis.academy_id }),
                  },
                );
                const url = typeof payload.share_url === "string" ? payload.share_url : null;
                if (url) {
                  sessionStorage.setItem(`diagnosis-share:${diagnosisId}`, url);
                  setShareUrl(url);
                }
                return url;
              }
        }
      />
    </div>
  );
}
