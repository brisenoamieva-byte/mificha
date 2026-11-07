import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeFichaPreview } from "@/components/marketing/home-ficha-preview";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { WithBrandName } from "@/components/ui/brand-wordmark";

export function HomeHero() {
  return (
    <MarketingPageHero
      eyebrow="Torneos interescolares · Querétaro · en desarrollo"
      title="La ficha de cada jugador, sincronizada con el torneo"
      description={
        <>
          <WithBrandName>
            La ficha del torneo aún no está abierta. Lo que sí puedes contratar ya es el
            diagnóstico GPH: sesión, lectura y seguimiento.
          </WithBrandName>
        </>
      }
      actions={
        <>
          <Link href="#diagnosticos-gph" className="mf-btn-gph">
            Contratar diagnóstico GPH
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="#como-funciona" className="mf-btn-accent">
            Cómo va a funcionar la ficha
          </Link>
        </>
      }
      aside={<HomeFichaPreview />}
      asideAlign="start"
      className="demo-ficha-hero"
    />
  );
}
