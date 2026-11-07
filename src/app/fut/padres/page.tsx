import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FichaTypesSection } from "@/components/marketing/ficha-types-section";
import { PadresAcademyExample } from "@/components/marketing/padres-academy-example";
import { PadresBenefitsSection } from "@/components/marketing/padres-benefits-section";
import { PadresGphSection } from "@/components/marketing/evaluaciones-page-content";
import { PadresPageHero } from "@/components/marketing/padres-page-hero";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  title: "Padres y jugadores | MiFicha",
  description:
    "Crea tu cuenta de tutor: arma la ficha de tu hijo y sigue su desarrollo en un solo lugar.",
};

export default function PadresPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader />

      <main className="flex-1">
        <PadresPageHero />
        <FichaTypesSection />
        <PadresBenefitsSection />
        <PadresGphSection />

        <section className="scroll-mt-20 border-t border-mf-border bg-white">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-14 sm:px-6 lg:py-16">
            <p className="mf-marketing-eyebrow">Familias</p>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-mf-text">
              Empieza con tu cuenta de tutor
            </h2>
            <p className="text-sm leading-7 text-mf-text-secondary">
              Ahí armas la ficha, subes material y, cuando haya torneo, verás las stats en el
              mismo lugar.
            </p>
            <Link href="/fut/tutor" className="mf-btn-gph self-start">
              Crear cuenta de tutor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
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
