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
            Piloto abierto para tutores: arma la ficha de tu hijo con fotos, videos e
            historia. El diagnóstico GPH también se puede agendar ya.
          </WithBrandName>
        </>
      }
      actions={
        <>
          <Link href="/fut/tutor" className="mf-btn-gph">
            Entrar como tutor
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="#diagnosticos-gph" className="mf-btn-accent">
            Diagnóstico GPH
          </Link>
        </>
      }
      aside={<HomeFichaPreview />}
      asideAlign="start"
      className="demo-ficha-hero"
    />
  );
}
