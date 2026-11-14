import type { Metadata } from "next";
import { EvaluacionesPageContent } from "@/components/marketing/evaluaciones-page-content";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  title: "Diagnóstico GPH | MiFicha",
  description:
    "Sesión presencial en Querétaro: etapa, objetivos e informe en la ficha MiFicha.",
};

export default function EvaluacionesPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader />
      <main className="flex-1">
        <EvaluacionesPageContent />
      </main>
      <SiteFooter />
    </div>
  );
}
