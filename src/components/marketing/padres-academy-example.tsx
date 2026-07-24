import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, MapPin } from "lucide-react";
import { DEMO_EXPLORE_ACADEMY } from "@/lib/explore-demo-data";
import { MARKETING_IMAGES } from "@/lib/marketing-assets";

export function PadresAcademyExample() {
  return (
    <section className="border-t border-mf-border bg-mf-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
        <div className="mf-card flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-mf-border bg-white p-2 shadow-sm">
            <Image
              src={MARKETING_IMAGES.demoAcademiaGallosLogo}
              alt={`Logo ${DEMO_EXPLORE_ACADEMY.name}`}
              width={72}
              height={72}
              className="h-auto w-full object-contain"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="mf-marketing-eyebrow">Academia certificada · Ejemplo</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-mf-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-mf-accent-dark">
                <Award className="h-3.5 w-3.5" aria-hidden />
                Verificada
              </span>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-mf-text">{DEMO_EXPLORE_ACADEMY.name}</h2>
            <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
              Así se ve una sede con plantel en MiFicha: fichas con stats del torneo, logo de
              la academia y aviso automático a tutores tras cada jornada.
            </p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-mf-text-muted">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {[DEMO_EXPLORE_ACADEMY.city, DEMO_EXPLORE_ACADEMY.state]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>

          <Link
            href={`/fut/a/${DEMO_EXPLORE_ACADEMY.slug}`}
            className="mf-btn-secondary shrink-0 self-start sm:self-center"
          >
            Ver academia ejemplo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
