import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FichaTypesSection } from "@/components/marketing/ficha-types-section";
import { PadresBenefitsSection } from "@/components/marketing/padres-benefits-section";
import { PadresGphSection } from "@/components/marketing/evaluaciones-page-content";
import { PadresPageHero } from "@/components/marketing/padres-page-hero";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  title: "Padres y jugadores | MiFicha",
  description:
    "Llena la ficha de tu hijo, lleva su seguimiento y hazlo visible para agentes de futbol en MiFicha.",
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
              Tu espacio tutor en MiFicha
            </h2>
            <p className="text-sm leading-7 text-mf-text-secondary">
              Llena la ficha, lleva el seguimiento y aparece en Explorar para que agentes de
              futbol te encuentren. Si ligas la academia, el mismo link muestra stats de torneo
              y la evaluación GPH.
            </p>
            <Link href="/fut/tutor" className="mf-btn-gph self-start">
              Entrar al espacio tutor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="border-t border-mf-border bg-mf-canvas">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
            <div className="mf-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="max-w-xl">
                <p className="mf-marketing-eyebrow">Buscador</p>
                <h2 className="mt-2 text-xl font-semibold text-mf-text">
                  Explorar jugadores
                </h2>
                <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
                  Solo fichas con consentimiento del tutor o representante. Datos básicos
                  gratis; detalle completo con membresía persona (gratis por tiempo limitado).
                </p>
              </div>
              <Link href="/fut/explorar" className="mf-btn-primary shrink-0 self-start sm:self-center">
                Ir a Explorar
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
