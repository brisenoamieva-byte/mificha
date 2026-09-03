"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { DiagnosisForm } from "@/components/diagnosis/diagnosis-form";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";
import { Skeleton } from "@/components/dashboard/skeletons";
import { diagnosisAuthedFetch } from "@/lib/player-diagnosis-client";
import type { PlayerDiagnosisRecord } from "@/lib/player-diagnosis";
import type { Player } from "@/types/database";

export function DiagnosisEditContent({ diagnosisId }: { diagnosisId: string }) {
  const { academy, isGphEvaluator } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<PlayerDiagnosisRecord | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!academy && !isGphEvaluator) return;
    let cancelled = false;
    setLoading(true);
    void diagnosisAuthedFetch(`/fut/api/diagnoses/${diagnosisId}`)
      .then(async (payload) => {
        const next = payload.diagnosis as PlayerDiagnosisRecord;
        const roster = await diagnosisAuthedFetch(
          `/fut/api/diagnoses/players?academy_id=${encodeURIComponent(next.academy_id)}`,
        );
        if (cancelled) return;
        setDiagnosis(next);
        setPlayers((roster.players as Player[]) ?? []);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se cargó el avance.");
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

  if (error || !diagnosis) {
    return (
      <div className="rounded-2xl border border-mf-border bg-white p-8 text-center">
        <p className="font-semibold text-mf-text">{error ?? "Diagnóstico no encontrado."}</p>
        <Link
          href="/fut/dashboard/diagnostico"
          className="mt-3 inline-block text-sm font-semibold text-mf-brand"
        >
          Volver a diagnósticos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/fut/dashboard/diagnostico/${diagnosis.id}`}
        className="inline-flex items-center gap-1 text-sm text-mf-text-secondary hover:text-mf-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Ver ficha
      </Link>
      <DiagnosisForm
        players={players}
        academyId={diagnosis.academy_id}
        initialDiagnosis={diagnosis}
      />
    </div>
  );
}
