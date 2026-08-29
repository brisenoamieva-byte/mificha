import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DiagnosisReport } from "@/components/diagnosis/diagnosis-report";
import { buildDemoDiagnosisReport } from "@/lib/demo-diagnosis";
import { isDemoPlayerSlug } from "@/lib/demo-ficha-preview";
import { diagnosisWhatsAppHref } from "@/lib/gph-alliance";
import {
  getLatestDiagnosisForPlayer,
  loadDiagnosisReportBundle,
} from "@/lib/player-diagnosis-server";
import { DIAGNOSIS_KIND_LABELS } from "@/lib/player-diagnosis";
import { fetchPublicPlayerBySlug } from "@/lib/public-player";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isDemoPlayerSlug(slug)) {
    return {
      title: "Evaluación GPH · Santiago Hernández (ejemplo) | MiFicha",
      robots: { index: false, follow: false },
    };
  }

  const data = await fetchPublicPlayerBySlug(slug);
  if (!data?.gph) {
    return { title: "Evaluación GPH | MiFicha", robots: { index: false } };
  }

  const name = `${data.player.first_name} ${data.player.last_name}`;
  return {
    title: `Evaluación GPH · ${name} | MiFicha`,
    description: `${DIAGNOSIS_KIND_LABELS[data.gph.kind]} · GPH · MiFicha.`,
    robots: { index: false, follow: false },
  };
}

export default async function PublicPlayerEvaluationPage({ params }: PageProps) {
  const { slug } = await params;

  if (isDemoPlayerSlug(slug)) {
    const demo = buildDemoDiagnosisReport();
    return (
      <DiagnosisPageShell
        fichaHref={`/fut/j/${slug}`}
        showExampleCta
      >
        <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-mf-gph print:hidden">
          Ejemplo · GPH · MiFicha
        </p>
        <DiagnosisReport
          diagnosis={demo.diagnosis}
          player={demo.player}
          academy={demo.academy}
        />
      </DiagnosisPageShell>
    );
  }

  const publicPlayer = await fetchPublicPlayerBySlug(slug);
  if (!publicPlayer) notFound();

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    notFound();
  }

  const diagnosis = await getLatestDiagnosisForPlayer(admin, publicPlayer.player.id);
  if (!diagnosis) notFound();

  const bundle = await loadDiagnosisReportBundle(admin, diagnosis);
  if (!bundle) notFound();

  return (
    <DiagnosisPageShell fichaHref={`/fut/j/${slug}`}>
      <DiagnosisReport
        diagnosis={bundle.diagnosis}
        player={bundle.player}
        academy={bundle.academy}
      />
    </DiagnosisPageShell>
  );
}

function DiagnosisPageShell({
  children,
  fichaHref,
  showExampleCta = false,
}: {
  children: ReactNode;
  fichaHref: string;
  showExampleCta?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-mf-canvas px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-center print:hidden">
          <Link
            href={fichaHref}
            className="text-sm font-semibold text-mf-gph hover:underline"
          >
            ← Volver a Mi Ficha
          </Link>
        </p>
        {children}
        {showExampleCta ? (
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
        ) : null}
      </div>
    </div>
  );
}
