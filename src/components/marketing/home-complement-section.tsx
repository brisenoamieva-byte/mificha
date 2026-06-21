import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COMPLEMENT_ROWS } from "@/lib/marketing-nav";
import { BrandWordmark, WithBrandName } from "@/components/ui/brand-wordmark";

export function HomeComplementSection() {
  return (
    <section id="complemento" className="border-t border-mf-border bg-mf-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
          <div>
            <p className="mf-marketing-eyebrow">Junto al torneo</p>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-mf-text sm:text-2xl">
              Lo que hace el torneo y lo que hace <BrandWordmark />
            </h2>
            <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
              <WithBrandName>
                MiFicha no sustituye la liga: complementa con la ficha individual de
                cada jugador y el aviso a su familia.
              </WithBrandName>
            </p>
            <Link href="/explorar" className="mf-btn-accent mt-6 inline-flex">
              Ver directorio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-mf-border bg-mf-canvas">
            <div className="grid grid-cols-2 border-b border-mf-border-subtle">
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-mf-text-muted">
                Torneo
              </div>
              <div className="border-l border-mf-border-subtle bg-mf-accent-soft/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-mf-accent-dark">
                <BrandWordmark />
              </div>
            </div>
            {COMPLEMENT_ROWS.map((row) => (
              <div
                key={row.official}
                className="grid grid-cols-2 border-b border-mf-border-subtle last:border-0"
              >
                <div className="px-4 py-3.5 text-sm leading-6 text-mf-text-secondary">
                  {row.official}
                </div>
                <div className="border-l border-mf-border-subtle bg-mf-accent-soft/20 px-4 py-3.5 text-sm font-medium leading-6 text-mf-text">
                  {row.mificha}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
