import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeFichaPreview } from "@/components/marketing/home-ficha-preview";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { WithBrandName } from "@/components/ui/brand-wordmark";

export function HomeHero() {
  return (
    <MarketingPageHero
      eyebrow="Torneos interescolares · Querétaro"
      title="La ficha de cada jugador, sincronizada con el torneo"
      description={
        <>
          <WithBrandName>
            MiFicha lleva las stats del torneo a la ficha de cada jugador. La academia
            carga plantel y contacto del tutor; el link llega solo después de cada jornada.
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
      className="demo-ficha-hero"
    />
  );
}
