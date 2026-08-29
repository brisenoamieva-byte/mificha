import Link from "next/link";
import { ArrowRight, ClipboardList, LineChart, MessageCircle } from "lucide-react";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { AllianceLockup, GphLogo } from "@/components/ui/gph-logo";
import { BrandWordmark, WithBrandName } from "@/components/ui/brand-wordmark";
import { CURRENT_SEASON_LABEL } from "@/lib/marketing-season";
import { GPH_ALLIANCE, diagnosisWhatsAppHref } from "@/lib/gph-alliance";
import { DIAGNOSIS_PRODUCT } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: MessageCircle,
    title: "Contrata la evaluación",
    description:
      "Escríbenos por WhatsApp. Coordinamos fecha, sede y si es un jugador o un grupo.",
  },
  {
    icon: ClipboardList,
    title: "Sesión con metodología GPH",
    description:
      "Técnica, táctica, físico, mental y hábitos. Escala 1–5 y etapa de desarrollo.",
  },
  {
    icon: LineChart,
    title: "Ficha y seguimiento",
    description:
      "Etapa, lectura de entrenador y plan quedan en mificha.mx. Tú y la familia lo consultan cuando haga falta.",
  },
] as const;

export function EvaluacionesPageContent() {
  const whatsapp = diagnosisWhatsAppHref();

  return (
    <>
      <MarketingPageHero
        eyebrow={`${GPH_ALLIANCE.shortLabel} · ${CURRENT_SEASON_LABEL}`}
        title="Evalúa a tu hijo. Sigue el avance en MiFicha."
        description={
          <WithBrandName>
            GPH evalúa y el resultado queda en MiFicha: el diagnóstico, la ficha y
            el plan viven en un mismo lugar. No necesitas que la academia esté
            inscrita para contratar una evaluación.
          </WithBrandName>
        }
        actions={
          <>
            <a
              href={whatsapp}
              className="mf-btn-gph"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contratar evaluación
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/fut/d/demo" className="mf-btn-gph-ghost">
              Ver ficha de ejemplo
            </Link>
          </>
        }
        aside={
          <div className="mf-card p-6 sm:p-8">
            <AllianceLockup size="lg" showCaption />
            <ul className="mt-5 space-y-2 text-sm text-mf-text-secondary">
              {["Sesión presencial", "Ficha visual 1–5", "Lectura de entrenador y plan"].map(
                (item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-mf-gph" />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
        }
      />

      <section className="border-b border-mf-border bg-mf-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="max-w-2xl">
            <p className="mf-marketing-eyebrow">Cómo funciona</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text">
              Independiente del calendario del torneo
            </h2>
            <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
              La ficha de partido sigue saliendo con el acta. Esta evaluación es otro
              servicio: se pide, se paga y se consulta por su cuenta.
            </p>
          </div>
          <ol className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {STEPS.map((item, index) => (
              <li key={item.title} className="mf-card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mf-gph text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="mf-icon-brand">
                    <item.icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-mf-text">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-mf-text-secondary">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="precios" className="border-b border-mf-border bg-mf-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
          <div className="max-w-2xl">
            <p className="mf-marketing-eyebrow">Cobro</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text">
              {DIAGNOSIS_PRODUCT.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-mf-text-secondary sm:text-base">
              {DIAGNOSIS_PRODUCT.subtitle}
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {DIAGNOSIS_PRODUCT.plans.map((plan) => (
              <article
                key={plan.id}
                className="flex flex-col rounded-xl border border-mf-border bg-white p-5 sm:p-6"
              >
                <p className="text-sm font-semibold text-mf-text">{plan.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-mf-gph">
                  {plan.priceLabel}
                </p>
                <p className="mt-1 text-xs font-medium text-mf-text-muted">{plan.period}</p>
                <p className="mt-4 text-sm leading-7 text-mf-text-secondary">
                  {plan.description}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs text-mf-text-muted">{DIAGNOSIS_PRODUCT.footnote}</p>
          <div className="mt-8">
            <a
              href={whatsapp}
              className="mf-btn-gph"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pedir cotización
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

/** Banda corta en home: evaluación GPH sin mezclarla con el flujo del torneo. */
export function HomeGphAllianceBand() {
  return (
    <section className="border-t border-mf-border bg-mf-gph-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <div className="inline-block rounded-md bg-white px-2 py-1.5">
            <AllianceLockup size="md" />
          </div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
            {GPH_ALLIANCE.headline}.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/fut/evaluaciones" className="mf-btn-gph">
            Evaluaciones
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/fut/d/demo"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Ver ejemplo
          </Link>
        </div>
      </div>
    </section>
  );
}

export function PadresGphSection() {
  return (
    <section className="border-t border-mf-border bg-mf-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
        <div className="mf-card flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="mf-marketing-eyebrow">{GPH_ALLIANCE.shortLabel}</p>
            <h2 className="mt-2 text-xl font-semibold text-mf-text">
              También puedes contratar un diagnóstico
            </h2>
            <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
              La evaluación GPH y el seguimiento de partido quedan en la misma
              ficha de <BrandWordmark className="text-sm" />.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <GphLogo size="sm" />
              <span className={cn("text-xs text-mf-text-muted")}>
                Metodología GPH · ficha en mificha.mx
              </span>
            </div>
          </div>
          <Link href="/fut/evaluaciones" className="mf-btn-gph shrink-0 self-start sm:self-center">
            Cómo contratar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
