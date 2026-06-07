import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COMPLEMENT_ROWS, HOME_FEATURES } from "@/lib/marketing-nav";

export function FeatureHubSection() {
  return (
    <>
      <section id="funciones" className="border-y border-mf-border bg-mf-canvas">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-2xl">
            <p className="mf-marketing-eyebrow">Plataforma</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text sm:text-3xl">
              Todo lo que tu portal de liga no cubre
            </h2>
            <p className="mt-4 text-sm leading-7 text-mf-text-secondary">
              Calendario y tabla oficial en la federación. MiFicha en la capa de
              academia: fichas individuales, engagement de padres y visibilidad para
              scouts.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="group flex flex-col rounded-xl border border-mf-border bg-mf-surface p-6 transition hover:border-mf-brand/25 hover:shadow-[var(--mf-shadow)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mf-brand-soft text-mf-brand">
                  <feature.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-[-0.01em] text-mf-text">
                  {feature.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-7 text-mf-text-secondary">
                  {feature.mificha}
                </p>
                <Link
                  href={feature.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-mf-brand opacity-90 transition group-hover:opacity-100"
                >
                  Conocer más
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="complemento" className="bg-mf-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <p className="mf-marketing-eyebrow">Complemento, no competidor</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text sm:text-[1.75rem]">
                MiFicha + tu liga oficial
              </h2>
              <p className="mt-4 text-sm leading-7 text-mf-text-secondary">
                En configuración enlazas el calendario de tu competición (FMF,
                estatal o municipal). MiFicha registra el rendimiento individual;
                la liga sigue siendo la fuente del marcador oficial.
              </p>
              <Link href="/signup" className="mf-btn-primary mt-8 inline-flex">
                Registrar academia
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-mf-border bg-mf-surface shadow-[var(--mf-shadow)]">
              <div className="grid grid-cols-2 border-b border-mf-border-subtle bg-mf-canvas">
                <div className="px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                  Portal de liga
                </div>
                <div className="border-l border-mf-border-subtle px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-mf-brand">
                  MiFicha
                </div>
              </div>
              {COMPLEMENT_ROWS.map((row) => (
                <div
                  key={row.official}
                  className="grid grid-cols-2 border-b border-mf-border-subtle last:border-0"
                >
                  <div className="px-5 py-4 text-sm leading-6 text-mf-text-secondary">
                    {row.official}
                  </div>
                  <div className="border-l border-mf-border-subtle bg-mf-brand-soft/30 px-5 py-4 text-sm font-medium leading-6 text-mf-text">
                    {row.mificha}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
