import Link from "next/link";
import { ArrowDown, BarChart3, MessageCircle, Printer, ShieldCheck } from "lucide-react";
import { HomeFichaPreview } from "@/components/marketing/home-ficha-preview";
import { CURRENT_SEASON_LABEL } from "@/lib/marketing-season";
import { WithBrandName } from "@/components/ui/brand-wordmark";

export function PadresPageHero() {
  return (
    <section className="relative overflow-hidden border-b border-mf-border bg-mf-surface">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_0%_0%,rgba(27,79,140,0.07),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,rgba(52,211,153,0.06),transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-12">
          <div className="max-w-xl lg:pt-2">
            <p className="mf-marketing-eyebrow">Padres y jugadores · {CURRENT_SEASON_LABEL}</p>
            <h1 className="mt-4 text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-mf-text sm:text-[2.5rem]">
              La ficha de tu hijo, después de cada jornada
            </h1>
            <p className="mt-5 text-base leading-8 text-mf-text-secondary sm:text-[1.0625rem]">
              <WithBrandName>
                MiFicha envía el link por WhatsApp o email cuando el torneo publica las stats.
                Consulta goles, minutos, evaluación del entrenador e historial en un solo lugar.
              </WithBrandName>
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {[
                { icon: MessageCircle, label: "Aviso post-partido" },
                { icon: BarChart3, label: "Stats del torneo" },
                { icon: Printer, label: "Ficha imprimible" },
                { icon: ShieldCheck, label: "Consentimiento parental" },
              ].map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-mf-border-subtle bg-mf-canvas px-3 py-1.5 text-xs font-medium text-mf-text-secondary"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-mf-brand" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>

            <Link
              href="#abrir-ficha"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-mf-brand transition hover:text-mf-brand-dark"
            >
              Abrir ficha con tu link
              <ArrowDown className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="min-w-0 lg:justify-self-end">
            <HomeFichaPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
