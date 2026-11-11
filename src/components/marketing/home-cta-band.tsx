import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingBackgroundPhoto } from "@/components/marketing/marketing-hero-visual";
import { MARKETING_MEDIA } from "@/lib/marketing-assets";

export function HomeCtaBand() {
  return (
    <section className="relative min-h-0 overflow-hidden border-t border-mf-brand-dark sm:min-h-[220px]">
      <MarketingBackgroundPhoto meta={MARKETING_MEDIA.ctaBand} />
      <div className="absolute inset-0 bg-gradient-to-r from-mf-brand-dark/95 via-mf-brand/88 to-mf-brand-dark/55 lg:to-transparent" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_40%_80%_at_100%_50%,rgba(52,211,153,0.15),transparent)]"
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-mf-accent via-mf-accent-bright to-mf-accent-dark" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-5 px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            Piloto · familias
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
            Arma la ficha o agenda el diagnóstico
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            El tutor arma la ficha en la plataforma. Diagnóstico GPH cuando lo necesites.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/fut/pagar?sku=diagnosis"
            className="inline-flex items-center gap-2 rounded-full bg-mf-gph px-6 py-3 text-sm font-semibold text-white transition hover:bg-mf-gph-hot"
          >
            Contratar diagnóstico
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/fut/tutor"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-mf-brand transition hover:bg-white/95"
          >
            Entrar como tutor
          </Link>
        </div>
      </div>
    </section>
  );
}
