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
import type { PlayerDiagnosisRecord, DiagnosisAcademySnapshot, DiagnosisPlayerSnapshot } from "@/lib/player-diagnosis";

export function DiagnosisViewContent({ diagnosisId }: { diagnosisId: string }) {
  const { academy, isGphEvaluator } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<PlayerDiagnosisRecord | null>(null);
  const [player, setPlayer] = useState<DiagnosisPlayerSnapshot | null>(null);
  const [academySnap, setAcademySnap] = useState<DiagnosisAcademySnapshot | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [coachBusy, setCoachBusy] = useState(false);

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
        <button
          type="button"
          disabled={coachBusy}
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
      <DiagnosisReport
        diagnosis={diagnosis}
        player={player}
        academy={academySnap}
        shareUrl={shareUrl}
        onCreateShareLink={async () => {
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
        }}
      />
    </div>
  );
}
