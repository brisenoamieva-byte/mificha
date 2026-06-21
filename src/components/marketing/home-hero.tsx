import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeFichaPreview } from "@/components/marketing/home-ficha-preview";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { WithBrandName } from "@/components/ui/brand-wordmark";

export function HomeHero() {
  return (
    <MarketingPageHero
      eyebrow="Torneos interescolares · Querétaro"
      title="La ficha técnica que el torneo ya debería tener"
      description={
        <>
          <WithBrandName>
            MiFicha conecta el acta oficial de cada jornada con el plantel de tu colegio.
            Stats verificables, historial por jugador y aviso automático al tutor. Pensado
            para directores, organizadores y familias que hoy dependen de WhatsApp.
          </WithBrandName>
        </>
      }
      actions={
        <>
          <Link href="/signup" className="mf-btn-primary">
            Registrar colegio
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="#como-funciona" className="mf-btn-accent">
            Ver cómo funciona
          </Link>
        </>
      }
      aside={<HomeFichaPreview />}
    />
  );
}
