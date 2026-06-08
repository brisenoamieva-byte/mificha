import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingBackgroundPhoto } from "@/components/marketing/marketing-hero-visual";
import { MARKETING_MEDIA } from "@/lib/marketing-assets";

export function HomeCtaBand() {
  return (
    <section className="relative min-h-[300px] overflow-hidden border-t border-mf-brand-dark">
      <MarketingBackgroundPhoto meta={MARKETING_MEDIA.ctaBand} />
      <div className="absolute inset-0 bg-gradient-to-r from-mf-brand-dark/95 via-mf-brand/88 to-mf-brand-dark/55 lg:to-transparent" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_40%_80%_at_100%_50%,rgba(52,211,153,0.15),transparent)]"
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-mf-accent via-mf-accent-bright to-mf-accent-dark" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-16">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            Empieza hoy
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
            Tu plantel merece más que una hoja de Excel
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/80">
            Carga el roster, captura el primer partido y comparte la ficha con padres
            el mismo sábado.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-mf-brand transition hover:bg-white/95"
          >
            Registrar colegio
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/padres"
            className="inline-flex items-center gap-2 rounded-full border border-mf-accent/40 bg-mf-accent/10 px-6 py-3 text-sm font-semibold text-mf-accent-bright transition hover:bg-mf-accent/20"
          >
            Soy padre
          </Link>
        </div>
      </div>
    </section>
  );
}
