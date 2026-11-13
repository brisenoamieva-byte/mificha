import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExploreDirectory } from "@/components/marketing/explore-directory";
import { ExplorePaywallBanner } from "@/components/marketing/explore-paywall";
import type { PublicDirectoryData } from "@/lib/public-directory";
import type { ExploreAccess } from "@/lib/scout-product";

interface HomeExploreSectionProps {
  data: PublicDirectoryData;
  access: ExploreAccess;
  initialCategoryFilter?: string;
  initialQuery?: string;
  initialPosition?: string;
  initialState?: string;
  initialCity?: string;
}

export function HomeExploreSection({
  data,
  access,
  initialCategoryFilter,
  initialQuery,
  initialPosition,
  initialState,
  initialCity,
}: HomeExploreSectionProps) {
  return (
    <section id="directorio" className="scroll-mt-20 border-b border-mf-border bg-mf-canvas">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              Resultados
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-mf-gph-ink">
              Jugadores en MiFicha
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-mf-text-secondary">
              Fichas que publican tutores o representantes. Datos básicos visibles; el
              detalle se abre con la membresía persona.
            </p>
          </div>
          <Link href="/fut/explorar" className="mf-btn-gph-ghost shrink-0">
            Abrir Explorar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ExplorePaywallBanner access={access} />

        <ExploreDirectory
          data={data}
          initialCategoryFilter={initialCategoryFilter}
          unlocked={access.unlocked}
          initialQuery={initialQuery}
          initialPosition={initialPosition}
          initialState={initialState}
          initialCity={initialCity}
        />
      </div>
    </section>
  );
}
