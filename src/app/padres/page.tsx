import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AudienceBenefitsSection } from "@/components/marketing/audience-benefits-section";
import { HomeFichaPreview } from "@/components/marketing/home-ficha-preview";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { ParentLinkForm } from "@/components/marketing/parent-link-form";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { MARKETING_MEDIA } from "@/lib/marketing-assets";

export const metadata: Metadata = {
  title: "Padres y jugadores | MiFicha",
  description:
    "Abre la ficha técnica de tu hijo con el link que envía su academia.",
};

export default function PadresPage() {
  return (
    <div className="flex min-h-full flex-col bg-mf-canvas">
      <SiteHeader actionHref="/padres" actionLabel="Padres" />

      <main className="flex-1">
        <MarketingPageHero
          eyebrow="Padres y jugadores"
          title="La ficha de tu hijo"
          description="Tu academia te envía el link por email o WhatsApp. Consulta Passport Score, stats e historial del torneo."
          photo={MARKETING_MEDIA.heroPadres}
          photoPriority
          actions={
            <Link href="#abrir-ficha" className="mf-btn-primary">
              Abrir ficha
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
          stats={[
            { value: "Auto", label: "Aviso post-partido" },
            { value: "Link", label: "WhatsApp o email" },
            { value: "100", label: "Passport Score", accent: true },
          ]}
          aside={<HomeFichaPreview />}
        />

        <section className="border-b border-mf-border bg-mf-surface">
          <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
            <AudienceBenefitsSection audienceId="padres" title="Para padres" />
            <AudienceBenefitsSection audienceId="jugadores" title="Para jugadores" />
          </div>
        </section>

        <section id="abrir-ficha" className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-16">
          <ParentLinkForm />
        </section>

        <section className="border-t border-mf-border bg-mf-surface">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <p className="mf-marketing-eyebrow">Directorio público</p>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-mf-text">
              ¿Buscas fichas de referencia?
            </h2>
            <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
              Explora jugadores con ficha pública activa y consentimiento parental.
            </p>
            <Link href="/explorar" className="mf-btn-secondary mt-6 inline-flex">
              Ir al directorio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
