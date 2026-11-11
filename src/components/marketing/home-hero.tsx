import Link from "next/link";
import { HomeFichaPreview } from "@/components/marketing/home-ficha-preview";
import { HomeHeroGphOffer } from "@/components/marketing/home-hero-gph-offer";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { WithBrandName } from "@/components/ui/brand-wordmark";

export function HomeHero() {
  return (
    <MarketingPageHero
      title="La ficha de futbol de tu hijo, lista para visorías"
      description={
        <>
          <WithBrandName>
            Seguimiento futbolistico, visorías de Primera, convocatorias y especialización.
            El ingreso de hoy es el diagnóstico GPH; la ficha del jugador la arma el tutor en
            la plataforma.
          </WithBrandName>
        </>
      }
      actions={
        <Link href="/fut/tutor" className="mf-btn-accent">
          Entrar como tutor
        </Link>
      }
      belowActions={<HomeHeroGphOffer />}
      aside={<HomeFichaPreview />}
      asideAlign="start"
      className="demo-ficha-hero"
    />
  );
}
