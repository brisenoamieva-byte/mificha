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
            Stats oficiales del torneo en la ficha de cada jugador. Gratis para academias;
            el tutor recibe su link tras cada jornada.
          </WithBrandName>
        </>
      }
      actions={
        <>
          <Link href="/signup" className="mf-btn-primary">
            Registrar academia
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="#como-funciona" className="mf-btn-accent">
            Ver cómo funciona
          </Link>
        </>
      }
      aside={<HomeFichaPreview />}
      asideAlign="start"
      className="demo-ficha-hero"
    />
  );
}
