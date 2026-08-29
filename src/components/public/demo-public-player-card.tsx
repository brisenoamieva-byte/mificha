"use client";

import Link from "next/link";
import { ArrowRight, Printer } from "lucide-react";
import { FichaDocument } from "@/components/ficha/ficha-document";
import { BrandLogoLink } from "@/components/ui/brand-logo";
import { GphPublicStrip } from "@/components/public/gph-public-strip";
import { buildDemoDiagnosisReport } from "@/lib/demo-diagnosis";
import { buildDemoFichaDocument } from "@/lib/ficha-document-model";
import {
  buildPublicGphEvaluationPath,
  publicGphSummaryFromDiagnosis,
} from "@/lib/gph-player-link";

export function DemoPublicPlayerCard() {
  const model = buildDemoFichaDocument();
  const demoGph = buildDemoDiagnosisReport();
  const gphHref = buildPublicGphEvaluationPath(
    demoGph.player.slug || "santiago-hernandez-demo",
  );

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-dvh bg-mf-canvas px-4 py-8 mf-page-bottom sm:px-6">
      <div className="mx-auto w-full max-w-[780px]">
        <div className="mb-5 flex justify-center">
          <BrandLogoLink size="sm" />
        </div>

        <p className="mb-4 rounded-lg border border-mf-brand/20 bg-mf-brand-soft/50 px-4 py-3 text-center text-sm leading-6 text-mf-text-secondary">
          Ficha de ejemplo con datos ficticios para mostrar el formato MiFicha.
        </p>

        <FichaDocument model={model} priorityPhoto variant="full" />

        <GphPublicStrip
          summary={publicGphSummaryFromDiagnosis(demoGph.diagnosis)}
          href={gphHref}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="demo-ficha-print-btn inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-4 py-2.5 text-sm font-semibold text-mf-brand hover:bg-mf-canvas sm:flex-none sm:px-5"
          >
            <Printer className="h-4 w-4" />
            Imprimir ficha
          </button>
          <Link
            href="/fut/signup"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-mf-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-mf-brand-dark sm:flex-none sm:px-5"
          >
            Registrar academia
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <footer className="mt-8 border-t border-mf-border pt-6 text-center print:hidden">
          <BrandLogoLink className="justify-center" size="sm" />
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm font-medium">
            <Link href="/" className="text-mf-brand hover:underline">
              Volver al inicio
            </Link>
            <Link href="/fut/explorar" className="text-mf-brand hover:underline">
              Explorar directorio
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
