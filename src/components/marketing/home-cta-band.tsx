import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { isLaunchFreeMode, LAUNCH_COPY } from "@/lib/launch-mode";

export function HomeLaunchBanner() {
  if (!isLaunchFreeMode()) return null;

  return (
    <section className="border-b border-mf-brand/15 bg-mf-brand-soft/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-6">
        <span className="mf-marketing-eyebrow w-fit rounded-full bg-mf-brand/10 px-2.5 py-1 text-[10px]">
          {LAUNCH_COPY.badge}
        </span>
        <p className="text-sm leading-6 text-mf-text-secondary">
          Academias, padres y scouts usan MiFicha sin costo mientras construimos la
          red de talento verificado en México.
        </p>
      </div>
    </section>
  );
}

export function HomeCtaBand() {
  return (
    <section className="border-t border-mf-brand-dark bg-gradient-to-br from-mf-brand to-mf-brand-dark">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-16">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            Empieza hoy
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
            Tu academia merece más que una hoja de Excel
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/75">
            Registra el plantel, captura el primer partido y comparte la ficha con
            padres en el mismo día.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-mf-brand transition hover:bg-white/95"
          >
            Registrar academia
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/padres"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Soy padre
          </Link>
        </div>
      </div>
    </section>
  );
}
