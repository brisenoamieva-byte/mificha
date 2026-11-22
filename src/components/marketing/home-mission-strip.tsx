import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MISION_PATH } from "@/lib/mision";

/** Franja corta bajo el hero: qué es MiFicha sin saturar el primer viewport. */
export function HomeMissionStrip() {
  return (
    <section className="border-b border-mf-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-8">
        <div className="min-w-0 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            Etapa fundacional · 2026
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-mf-gph-ink sm:text-xl">
            El catálogo nacional de jugadores amateurs lo armamos juntos
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-mf-text-secondary">
            Fichas con consentimiento, datos objetivos y mapa de talento. Ahora el
            objetivo es densificar la base; después, torneos y puertas reales.
          </p>
        </div>
        <Link
          href={MISION_PATH}
          className="mf-btn-gph inline-flex w-full shrink-0 justify-center gap-2 sm:w-auto"
        >
          Qué es MiFicha
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
