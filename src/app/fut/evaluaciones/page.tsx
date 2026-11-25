import type { Metadata } from "next";
import { EvaluacionesPageContent } from "@/components/marketing/evaluaciones-page-content";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  title: "Pase Anual GPH–CRACKS | MiFicha",
  description:
    "Pase Anual de Proyección: diagnóstico, visorías 2027, selectivos CRACKS y especialización GPH. Un solo pago anual.",
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
