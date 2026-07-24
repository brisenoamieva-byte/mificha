import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PadresAcademyExample } from "@/components/marketing/padres-academy-example";
import { PadresBenefitsSection } from "@/components/marketing/padres-benefits-section";
import { PadresPageHero } from "@/components/marketing/padres-page-hero";
import { ParentLinkForm } from "@/components/marketing/parent-link-form";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  title: "Padres y jugadores | MiFicha",
  description:
    "Recibe el link de la ficha de tu hijo tras cada jornada. Stats del torneo, evaluación del entrenador e historial en un solo lugar.",
};

export default function PadresPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader />

      <main className="flex-1">
        <PadresPageHero />
        <PadresBenefitsSection />

        <section
          id="abrir-ficha"
          className="scroll-mt-20 mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-16"
        >
          <div className="mb-8 max-w-2xl">
            <p className="mf-marketing-eyebrow">Acceso directo</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text">
              Abre la ficha con tu link
            </h2>
            <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
              Pega la URL que te envió la academia o escribe el identificador al final del
              enlace.
            </p>
          </div>
          <ParentLinkForm />
        </section>

        <PadresAcademyExample />

        <section className="border-t border-mf-border bg-mf-canvas">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
            <div className="mf-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="max-w-xl">
                <p className="mf-marketing-eyebrow">Directorio público</p>
                <h2 className="mt-2 text-xl font-semibold text-mf-text">
                  Explora fichas de referencia
                </h2>
                <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
                  Jugadores con ficha pública, consentimiento parental y stats del torneo —
                  útil para conocer el formato antes de que tu academia active la tuya.
                </p>
              </div>
              <Link href="/fut/explorar" className="mf-btn-primary shrink-0 self-start sm:self-center">
                Ir al directorio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
