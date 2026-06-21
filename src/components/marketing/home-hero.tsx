import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeFichaPreview } from "@/components/marketing/home-ficha-preview";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { WithBrandName } from "@/components/ui/brand-wordmark";

const DEMO_FICHA_HREF = "/j/santiago-hernandez-demo";

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
          <Link
            href={DEMO_FICHA_HREF}
            className="inline-flex w-full items-center gap-1 text-sm font-semibold text-mf-brand hover:underline sm:hidden"
          >
            Ver ficha de ejemplo
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </>
      }
      aside={<HomeFichaPreview />}
      asideAlign="start"
      asideClassName="hidden lg:block"
      className="demo-ficha-hero"
    />
  );
}
