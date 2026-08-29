import type { Metadata } from "next";
import { EvaluacionesPageContent } from "@/components/marketing/evaluaciones-page-content";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  title: "Evaluaciones GPH | MiFicha",
  description:
    "Diagnósticos de jugadores con metodología GPH. La ficha y el seguimiento viven en mificha.mx.",
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
