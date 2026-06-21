import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WithBrandName } from "@/components/ui/brand-wordmark";
import { CURRENT_SEASON_LABEL } from "@/lib/marketing-season";

interface OrganizadoresPageHeroProps {
  mailtoHref: string;
}

export function OrganizadoresPageHero({ mailtoHref }: OrganizadoresPageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-mf-border bg-mf-surface">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_0%_0%,rgba(27,79,140,0.07),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,rgba(52,211,153,0.06),transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="max-w-2xl">
          <p className="mf-marketing-eyebrow">
            Organizadores · {CURRENT_SEASON_LABEL}
          </p>
          <h1 className="mt-4 text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-mf-text sm:text-[2.5rem]">
            Stats oficiales para tu torneo
          </h1>
          <p className="mt-5 text-base leading-8 text-mf-text-secondary sm:text-[1.0625rem]">
            <WithBrandName>
              Tú publicas calendario y acta. MiFicha actualiza la ficha de cada jugador
              y avisa al tutor. Las academias no pagan.
            </WithBrandName>
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={mailtoHref} className="mf-btn-primary">
              Agendar conversación
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="#precios" className="mf-btn-accent">
              Ver precios
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
