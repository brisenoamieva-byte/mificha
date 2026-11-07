import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { TutorWorkspace } from "@/components/tutor/tutor-workspace";

export const metadata: Metadata = {
  title: "Tutor · piloto | MiFicha",
  description:
    "Organiza fotos, videos e historia de tu hijo y genera una ficha para universidades o visorías. Piloto gratuito.",
};

export default function TutorPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader actionHref="/fut/tutor" actionLabel="Tutor" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <div className="mb-8 rounded-xl border border-mf-border bg-white px-4 py-4 text-sm leading-6 text-mf-text-secondary">
          <p className="font-semibold text-mf-gph-ink">Qué es MiFicha para tu hijo</p>
          <p className="mt-1">
            Seguimiento digital, avisos de visorías con Primera, convocatorias a torneos,
            eventos con descuento y especialización GPH. Hoy el piloto de ficha (fotos,
            videos e historia) es gratis; la membresía de $1,200 activa el paquete completo
            cuando cierre el piloto.
          </p>
        </div>
        <TutorWorkspace />
      </main>
      <SiteFooter />
    </div>
  );
}
