import Link from "next/link";
import {
  ArrowRight,
  Check,
  ClipboardList,
  LineChart,
  MessageCircle,
  Target,
} from "lucide-react";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { AllianceLockup, GphLogo } from "@/components/ui/gph-logo";
import { BrandWordmark, WithBrandName } from "@/components/ui/brand-wordmark";
import { CURRENT_SEASON_LABEL } from "@/lib/marketing-season";
import {
  GPH_ALLIANCE,
  GPH_WHATSAPP_DISPLAY,
  diagnosisWhatsAppHref,
} from "@/lib/gph-alliance";
import { DIAGNOSIS_PRODUCT } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: MessageCircle,
    title: "Agenda o paga",
    description:
      "WhatsApp para fecha y sede, o paga en línea. Coordinamos si es un jugador o un grupo.",
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
      "El informe queda en mificha.mx. La familia consulta etapa, objetivos y avance cuando haga falta.",
  },
] as const;

export function EvaluacionesPageContent() {
  const whatsapp = diagnosisWhatsAppHref();

  return (
    <>
      <MarketingPageHero
        eyebrow={`${GPH_ALLIANCE.shortLabel} · ${CURRENT_SEASON_LABEL}`}
        title="Diagnóstico GPH: mide, orienta y da seguimiento."
        description={
          <WithBrandName>
            Una sesión presencial con metodología GPH. Sales con etapa de desarrollo,
            fortalezas, objetivos claros y el informe en MiFicha — para entrenar con
            rumbo, no a ciegas.
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
              Agendar por WhatsApp
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/fut/pagar?sku=diagnosis" className="mf-btn-gph-ghost">
              Pagar diagnóstico
            </Link>
            <Link href="/fut/d/demo" className="mf-btn-gph-ghost">
              Ver ejemplo
            </Link>
          </>
        }
        aside={
          <div className="mf-card p-6 sm:p-8">
            <AllianceLockup size="lg" showCaption />
            <p className="mt-4 text-sm font-semibold text-mf-gph-ink">
              {DIAGNOSIS_PRODUCT.publicPriceLabel} · incluye 12 meses de MiFicha
            </p>
            <ul className="mt-4 space-y-2 text-sm text-mf-text-secondary">
              {[
                "Sesión presencial",
                "Ficha visual + lectura de entrenador",
                "3 a 5 objetivos de desarrollo",
                "Informe en mificha.mx",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-mf-gph" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        }
      />

      <section className="border-b border-mf-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="mf-marketing-eyebrow">Qué incluye</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text">
                Lo que recibes con el diagnóstico
              </h2>
              <ul className="mt-6 space-y-3">
                {DIAGNOSIS_PRODUCT.whatYouGet.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-mf-text-secondary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-mf-gph" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mf-marketing-eyebrow">Alcance</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text">
                Para qué sirve (y qué no promete)
              </h2>
              <ul className="mt-6 space-y-3">
                {DIAGNOSIS_PRODUCT.scope.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-mf-text-secondary">
                    <Target className="mt-0.5 h-4 w-4 shrink-0 text-mf-gph" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-7 text-mf-text-secondary">
                Conviene tener la{" "}
                <Link href="/fut/tutor" className="font-semibold text-mf-gph hover:underline">
                  ficha del tutor
                </Link>{" "}
                lista: el informe y el material del hijo viven en el mismo expediente.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="agendar"
        className="scroll-mt-24 border-b border-mf-border bg-mf-gph-soft"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-12">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              Agendar diagnóstico
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-mf-gph-ink">
              Pide información por WhatsApp
            </h2>
            <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
              Escribe para fecha, sede y si es un jugador o un grupo. Número:{" "}
              <span className="font-semibold tabular-nums text-mf-gph-ink">
                {GPH_WHATSAPP_DISPLAY}
              </span>
              .
            </p>
          </div>
          <a
            href={whatsapp}
            className="mf-btn-gph shrink-0 self-start sm:self-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp {GPH_WHATSAPP_DISPLAY}
          </a>
        </div>
      </section>

      <section className="border-b border-mf-border bg-mf-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="max-w-2xl">
            <p className="mf-marketing-eyebrow">Cómo funciona</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text">
              Diagnóstico + seguimiento en MiFicha
            </h2>
            <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
              Agenda por WhatsApp. El informe queda en tu cuenta; conviene tener la ficha
              del tutor lista para el seguimiento.
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
            <div className="flex flex-wrap gap-3">
              <a
                href={whatsapp}
                className="mf-btn-gph"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                Agendar por WhatsApp
              </a>
              <Link href="/fut/pagar?sku=diagnosis" className="mf-btn-gph-ghost">
                Pagar diagnóstico
              </Link>
              <Link href="/fut/tutor" className="mf-btn-gph-ghost">
                Crear cuenta de tutor
              </Link>
            </div>
            <p className="mt-3 text-sm text-mf-text-secondary">
              Para cotizar un grupo o confirmar fecha: WhatsApp{" "}
              <a
                href={whatsapp}
                className="font-semibold text-mf-gph hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {GPH_WHATSAPP_DISPLAY}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/** Banda en home: diagnósticos GPH ya contratables; ficha de torneo aparte. */
export function HomeGphAllianceBand() {
  const whatsapp = diagnosisWhatsAppHref();

  return (
    <section id="diagnosticos-gph" className="scroll-mt-24 border-t border-mf-border bg-mf-gph-ink">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="inline-block rounded-md bg-white px-2 py-1.5">
          <AllianceLockup size="md" />
        </div>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph-hot">
          Disponible ahora
        </p>
        <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
          Diagnósticos GPH. Ya se pueden contratar.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
          Diagnóstico presencial abierto: {DIAGNOSIS_PRODUCT.publicPriceLabel}, incluye 12
          meses de MiFicha. Agenda por WhatsApp. La ficha del tutor ya está gratis en el
          piloto.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={whatsapp}
            className="mf-btn-gph"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp {GPH_WHATSAPP_DISPLAY}
          </a>
          <Link
            href="/fut/evaluaciones"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Ver detalle
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
  const whatsapp = diagnosisWhatsAppHref();

  return (
    <section className="border-t border-mf-border bg-mf-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
        <div className="mf-card flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="mf-marketing-eyebrow">{GPH_ALLIANCE.shortLabel}</p>
            <h2 className="mt-2 text-xl font-semibold text-mf-text">
              Diagnóstico GPH: ya se puede agendar
            </h2>
            <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
              Pide información por WhatsApp ({GPH_WHATSAPP_DISPLAY}). La evaluación
              queda en la ficha de <BrandWordmark className="text-sm" />.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <GphLogo size="sm" />
              <span className={cn("text-xs text-mf-text-muted")}>
                Metodología GPH · ficha en mificha.mx
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3 self-start sm:self-center">
            <a
              href={whatsapp}
              className="mf-btn-gph"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <Link href="/fut/evaluaciones" className="mf-btn-gph-ghost">
              Ver detalle
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
