import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiagnosisReport } from "@/components/diagnosis/diagnosis-report";
import { buildDemoDiagnosisReport, isDemoDiagnosisToken } from "@/lib/demo-diagnosis";
import {
  findDiagnosisByShareToken,
  loadDiagnosisReportBundle,
} from "@/lib/player-diagnosis-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { DIAGNOSIS_KIND_LABELS } from "@/lib/player-diagnosis";
import { diagnosisWhatsAppHref } from "@/lib/gph-alliance";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  if (isDemoDiagnosisToken(token)) {
    return {
      title: "Diagnóstico · Santiago Hernández (ejemplo) | MiFicha",
      robots: { index: false, follow: false },
    };
  }
  try {
    const admin = createSupabaseAdminClient();
    const diagnosis = await findDiagnosisByShareToken(admin, token);
    if (!diagnosis) return { title: "Diagnóstico | MiFicha", robots: { index: false } };
    const bundle = await loadDiagnosisReportBundle(admin, diagnosis);
    const name = bundle
      ? `${bundle.player.first_name} ${bundle.player.last_name}`
      : "Jugador";
    return {
      title: `Diagnóstico · ${name} | MiFicha`,
      description: `${DIAGNOSIS_KIND_LABELS[diagnosis.kind]} · GPH · MiFicha.`,
      robots: { index: false, follow: false },
    };
  } catch {
    return { title: "Diagnóstico | MiFicha", robots: { index: false } };
  }
}

export default async function PublicDiagnosisPage({ params }: PageProps) {
  const { token } = await params;
  if (isDemoDiagnosisToken(token)) {
    const demo = buildDemoDiagnosisReport();
    return (
      <div className="min-h-dvh bg-mf-canvas px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-mf-gph print:hidden">
            Ejemplo · GPH · MiFicha
          </p>
          <DiagnosisReport
            diagnosis={demo.diagnosis}
            player={demo.player}
            academy={demo.academy}
          />
          <div className="gph-public-cta mt-6 rounded-2xl border border-mf-gph/25 bg-white px-5 py-5 text-center print:hidden">
            <p className="text-sm font-semibold text-mf-gph-ink">
              ¿Quieres esta lectura para tu hijo?
            </p>
            <p className="mt-1 text-sm text-mf-text-secondary">
              Sesión GPH en cancha. Ficha y plan en MiFicha.
            </p>
            <a
              href={diagnosisWhatsAppHref()}
              className="mf-btn-gph mt-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contratar evaluación
            </a>
          </div>
        </div>
      </div>
    );
  }

  const admin = createSupabaseAdminClient();
  const diagnosis = await findDiagnosisByShareToken(admin, token);
  if (!diagnosis) notFound();
  const bundle = await loadDiagnosisReportBundle(admin, diagnosis);
  if (!bundle) notFound();

  return (
    <div className="min-h-dvh bg-mf-canvas px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <DiagnosisReport
          diagnosis={bundle.diagnosis}
          player={bundle.player}
          academy={bundle.academy}
        />
      </div>
    </div>
  );
}
