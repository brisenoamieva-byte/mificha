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
  diagnosisBookingCtaLabel,
  diagnosisBookingHref,
  diagnosisBookingIsCalendar,
  diagnosisWhatsAppHref,
  trainingBookingCtaLabel,
  trainingBookingHref,
} from "@/lib/gph-alliance";
import { DiagnosisPromoPrice } from "@/components/marketing/diagnosis-promo-price";
import { DIAGNOSIS_PRODUCT } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: MessageCircle,
    title: "Paga y elige horario",
    description: "Pago en línea y calendario GPH. Sesión presencial en Querétaro.",
  },
  {
    icon: ClipboardList,
    title: "Sesión de evaluación",
    description: "Técnica, táctica, físico, mental y hábitos · escala 1–5.",
  },
  {
    icon: LineChart,
    title: "Informe en tu ficha",
    description: "Etapa, objetivos y seguimiento en mificha.mx por 12 meses.",
  },
] as const;

export function EvaluacionesPageContent() {
  const bookingHref = diagnosisBookingHref();
  const bookingIsCalendar = diagnosisBookingIsCalendar();
  const whatsapp = diagnosisWhatsAppHref();
  const trainingHref = trainingBookingHref();

  return (
    <>
      <MarketingPageHero
        eyebrow={`${GPH_ALLIANCE.shortLabel} · ${CURRENT_SEASON_LABEL}`}
        title="Diagnóstico GPH para tu jugador."
        description={
          <WithBrandName>
            Sesión presencial en Querétaro. Sales con etapa, objetivos claros y el
            informe en MiFicha — para entrenar con rumbo. GPH también ofrece clase
            muestra gratuita.
          </WithBrandName>
        }
        actions={
          <>
            <a
              href={bookingHref}
              className="mf-btn-gph"
              target="_blank"
              rel="noopener noreferrer"
            >
              {diagnosisBookingCtaLabel("Agendar por WhatsApp")}
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/fut/pagar?sku=diagnosis" className="mf-btn-gph-ghost">
              Pagar diagnóstico
            </Link>
          </>
        }
        belowActions={
          <p className="text-sm text-mf-text-secondary">
            <Link href="/fut/d/demo" className="font-semibold text-mf-gph hover:underline">
              Ver ejemplo de informe
            </Link>
            {" · "}
            <a
              href={trainingHref}
              className="font-semibold text-mf-gph hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Clase muestra gratis · horarios
            </a>
          </p>
        }
        aside={
          <div className="mf-card overflow-hidden p-0 sm:p-0">
            <div className="bg-[#fff1f2] px-5 py-3 sm:px-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e11d48]">
                {DIAGNOSIS_PRODUCT.promoHeadline}
              </p>
            </div>
            <div className="p-6 sm:p-8">
              <AllianceLockup size="lg" showCaption />
              <DiagnosisPromoPrice className="mt-5" size="lg" />
              <p className="mt-4 text-sm leading-6 text-mf-text-secondary">
                Incluye informe en la ficha y 12 meses de MiFicha.
              </p>
            </div>
          </div>
        }
      />

      <section className="border-b border-mf-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="mf-marketing-eyebrow">Incluye</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-mf-text sm:text-2xl">
                Qué recibes
              </h2>
              <ul className="mt-5 space-y-2.5">
                {DIAGNOSIS_PRODUCT.whatYouGet.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-6 text-mf-text-secondary"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-mf-gph" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mf-marketing-eyebrow">Para quién</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-mf-text sm:text-2xl">
                Cuándo conviene
              </h2>
              <ul className="mt-5 space-y-2.5">
                {DIAGNOSIS_PRODUCT.scope.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-6 text-mf-text-secondary"
                  >
                    <Target className="mt-0.5 h-4 w-4 shrink-0 text-mf-gph" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-mf-border bg-mf-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="max-w-xl">
            <p className="mf-marketing-eyebrow">Proceso</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-mf-text sm:text-2xl">
              Tres pasos
            </h2>
          </div>
          <ol className="mt-7 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {STEPS.map((item, index) => (
              <li key={item.title} className="rounded-xl border border-mf-border bg-white p-5">
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

      <section
        id="clase-muestra"
        className="scroll-mt-24 border-b border-mf-border bg-white"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-10">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              También con GPH
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-mf-gph-ink">
              Clase muestra gratuita
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-mf-text-secondary">
              Sesión de especialización sin costo. Elige un espacio libre en el
              calendario GPH.
            </p>
          </div>
          <a
            href={trainingHref}
            className="mf-btn-gph shrink-0 self-start sm:self-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            {trainingBookingCtaLabel()}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section id="precios" className="scroll-mt-24 border-b border-mf-border bg-mf-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="max-w-xl">
            <p className="mf-marketing-eyebrow">Cobro</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-mf-text sm:text-2xl">
              {DIAGNOSIS_PRODUCT.title}
            </h2>
            <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
              {DIAGNOSIS_PRODUCT.subtitle}
            </p>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {DIAGNOSIS_PRODUCT.plans.map((plan) => (
              <article
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-xl border bg-white p-5 sm:p-6",
                  "promo" in plan && plan.promo
                    ? "border-[#fda4af] shadow-[0_10px_30px_-18px_rgba(225,29,72,0.45)]"
                    : "border-mf-border",
                )}
              >
                <p className="text-sm font-semibold text-mf-text">{plan.label}</p>
                {"promo" in plan && plan.promo ? (
                  <DiagnosisPromoPrice className="mt-3" size="md" />
                ) : (
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-mf-gph">
                    {plan.priceLabel}
                  </p>
                )}
                <p className="mt-2 text-xs font-medium text-mf-text-muted">{plan.period}</p>
                <p className="mt-3 text-sm leading-6 text-mf-text-secondary">
                  {plan.description}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs text-mf-text-muted">{DIAGNOSIS_PRODUCT.footnote}</p>

          <div
            id="agendar"
            className="mt-8 flex flex-col gap-4 rounded-xl border border-mf-gph/20 bg-mf-gph-soft px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          >
            <div className="max-w-md">
              <p className="text-sm font-semibold text-mf-gph-ink">
                {bookingIsCalendar
                  ? "Elige horario o paga ahora"
                  : "Agenda por WhatsApp o paga ahora"}
              </p>
              <p className="mt-1 text-xs leading-5 text-mf-text-secondary">
                Grupo o dudas:{" "}
                <a
                  href={whatsapp}
                  className="font-semibold text-mf-gph hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp {GPH_WHATSAPP_DISPLAY}
                </a>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={bookingHref}
                className="mf-btn-gph"
                target="_blank"
                rel="noopener noreferrer"
              >
                {!bookingIsCalendar ? <MessageCircle className="h-4 w-4" /> : null}
                {diagnosisBookingCtaLabel(`WhatsApp ${GPH_WHATSAPP_DISPLAY}`)}
              </a>
              <Link href="/fut/pagar?sku=diagnosis" className="mf-btn-gph-ghost">
                Pagar diagnóstico
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Banda en home: refuerzo corto; el precio vive en el hero. */
export function HomeGphAllianceBand() {
  const whatsapp = diagnosisWhatsAppHref();

  return (
    <section id="diagnosticos-gph" className="scroll-mt-24 border-t border-mf-border bg-mf-gph-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <div className="inline-block rounded-md bg-white px-2 py-1.5">
            <AllianceLockup size="sm" />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph-hot">
            Disponible ahora
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
            ¿Listo para el diagnóstico GPH?
          </h2>
          <p className="mt-2 text-sm leading-7 text-white/75">
            Sesión en Querétaro, informe en la ficha y 12 meses de plataforma.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/fut/pagar?sku=diagnosis" className="mf-btn-gph">
            Continuar al pago
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={whatsapp}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
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
