import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MISION_PATH } from "@/lib/mision";

/** Franja corta bajo el hero. */
export function HomeMissionStrip() {
  return (
    <section className="border-b border-mf-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-7">
        <div className="min-w-0 max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-gph">
            Qué es MiFicha
          </p>
          <p className="mt-1.5 text-base font-semibold tracking-tight text-mf-gph-ink sm:text-lg">
            La ficha digital del jugador. Estamos llenando la base en México.
          </p>
          <p className="mt-1 text-sm leading-6 text-mf-text-secondary">
            Publicas con consentimiento, buscas en Explorar y compartes el link.
            Falta gente: por eso pedimos que armes la tuya e invites al equipo.
          </p>
        </div>
        <Link
          href={MISION_PATH}
          className="mf-btn-gph inline-flex w-full shrink-0 justify-center gap-2 sm:w-auto"
        >
          Leer más
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
