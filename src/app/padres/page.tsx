import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeFichaPreview } from "@/components/marketing/home-ficha-preview";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { ParentLinkForm } from "@/components/marketing/parent-link-form";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  title: "Padres y jugadores | MiFicha",
  description:
    "Abre la ficha técnica de tu hijo con el link o QR de su academia. Sin cuenta necesaria.",
};

export default function PadresPage() {
  return (
    <div className="flex min-h-full flex-col bg-mf-canvas">
      <SiteHeader actionHref="/padres" actionLabel="Padres" />

      <main className="flex-1">
        <MarketingPageHero
          eyebrow="Padres y jugadores"
          title="La ficha de tu hijo, sin app ni contraseña"
          description="La academia te comparte un QR o link por WhatsApp. Consulta Passport Score, stats de temporada e historial verificado al instante."
          actions={
            <Link href="#abrir-ficha" className="mf-btn-primary">
              Abrir ficha
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
          stats={[
            { value: "QR", label: "En la cancha" },
            { value: "0", label: "Registro requerido" },
            { value: "100", label: "Passport Score" },
          ]}
          aside={<HomeFichaPreview />}
        />

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
