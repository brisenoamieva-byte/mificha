import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { TutorWorkspace } from "@/components/tutor/tutor-workspace";

export const metadata: Metadata = {
  title: "Constructor de ficha · Tutor | MiFicha",
  description:
    "Arma la ficha profesional de tu hijo paso a paso: datos, foto, video e historia. Piloto gratuito.",
};

export default function TutorPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader actionHref="/fut/tutor" actionLabel="Tutor" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            Piloto gratuito
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-mf-gph-ink sm:text-3xl">
            Arma la ficha de tu hijo
          </h1>
          <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
            No es un álbum: es una ficha presentable para visorías y universidades. Completas
            datos, foto e historia; la vista previa se actualiza al momento. El diagnóstico
            GPH y las stats de torneo se suman después.
          </p>
        </div>
        <TutorWorkspace />
      </main>
      <SiteFooter />
    </div>
  );
}
