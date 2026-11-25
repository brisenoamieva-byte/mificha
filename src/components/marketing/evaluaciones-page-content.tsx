import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  LineChart,
  MessageCircle,
} from "lucide-react";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { AllianceLockup, GphLogo } from "@/components/ui/gph-logo";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { CURRENT_SEASON_LABEL } from "@/lib/marketing-season";
import {
  GPH_ALLIANCE,
  GPH_SAMPLE_CLASS,
  GPH_WHATSAPP_DISPLAY,
  diagnosisBookingCtaLabel,
  diagnosisBookingHref,
  diagnosisBookingIsCalendar,
  diagnosisWhatsAppHref,
  trainingBookingCtaLabel,
  trainingBookingHref,
} from "@/lib/gph-alliance";
import { DiagnosisPromoPrice } from "@/components/marketing/diagnosis-promo-price";
import { GphAnnualPassBenefits } from "@/components/marketing/gph-annual-pass-benefits";
import { GPH_ANNUAL_PASS } from "@/lib/gph-commerce";
import { DIAGNOSIS_PRODUCT } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: MessageCircle,
    title: "Paga y agenda",
    description: "Un solo pago anual. Luego eliges horario del diagnóstico en Querétaro.",
  },
  {
    icon: ClipboardList,
    title: "Evaluación presencial",
    description: "Técnica, táctica, físico, mental y hábitos · escala 1–5.",
  },
  {
    icon: LineChart,
    title: "Informe + proyección",
    description:
      "Resultados en tu ficha. Visorías, selectivos y especialización según el pase 2027.",
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
        title={GPH_ANNUAL_PASS.title}
        description={`${GPH_ANNUAL_PASS.lead} Un solo pago anual.`}
        actions={
          <>
            <Link href="/fut/pagar?sku=diagnosis" className="mf-btn-gph">
              Adquirir pase · {DIAGNOSIS_PRODUCT.publicPriceLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={bookingHref}
              className="mf-btn-gph-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              {diagnosisBookingCtaLabel(
                bookingIsCalendar ? "Agendar diagnóstico" : `WhatsApp ${GPH_WHATSAPP_DISPLAY}`,
              )}
            </a>
          </>
        }
        belowActions={
          <p className="text-sm text-mf-text-secondary">
            <Link href="/fut/d/demo" className="font-semibold text-mf-gph hover:underline">
              Ver ejemplo de informe
            </Link>
          </p>
        }
        aside={
          <div className="mf-card overflow-hidden p-0 sm:p-0">
            <div className="bg-[#fff1f2] px-5 py-3 sm:px-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e11d48]">
                Precio promocional · −{DIAGNOSIS_PRODUCT.discountPercent}%
              </p>
            </div>
            <div className="p-6 sm:p-8">
              <AllianceLockup size="lg" showCaption />
              <DiagnosisPromoPrice className="mt-5" size="lg" showBadge={false} />
              <p className="mt-4 text-sm font-medium leading-6 text-mf-gph-ink">
                {GPH_ANNUAL_PASS.closing}
              </p>
            </div>
          </div>
        }
      />

      <section className="border-b border-mf-border bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="mf-marketing-eyebrow">Incluye</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-mf-gph-ink sm:text-2xl">
              Qué obtienes con el pase
            </h2>
            <GphAnnualPassBenefits className="mt-5" compact />
          </div>
          <div>
            <p className="mf-marketing-eyebrow">Proceso</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-mf-gph-ink sm:text-2xl">
              Tres pasos
            </h2>
            <ol className="mt-5 space-y-3">
              {STEPS.map((item, index) => (
                <li
                  key={item.title}
                  className="flex gap-3 rounded-xl border border-mf-border bg-mf-canvas/60 p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mf-gph text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-mf-gph-ink">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-mf-text-secondary">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        id="clase-muestra"
        className="scroll-mt-24 border-b border-mf-border bg-mf-canvas"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-10">
          <div className="max-w-xl">
            <p className="mf-marketing-eyebrow">{GPH_SAMPLE_CLASS.badge}</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-mf-gph-ink">
              {GPH_SAMPLE_CLASS.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
              {GPH_SAMPLE_CLASS.summary} {GPH_SAMPLE_CLASS.ctaHint}
            </p>
          </div>
          <a
            href={trainingHref}
            className="mf-btn-gph-ghost self-start sm:self-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            {trainingBookingCtaLabel()}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section id="agendar" className="scroll-mt-24 bg-mf-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-12">
          <div className="max-w-lg">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-mf-gph-ink">
              Listo para el pase
            </h2>
            <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
              {DIAGNOSIS_PRODUCT.publicPriceLabel} (antes {DIAGNOSIS_PRODUCT.listPriceLabel}).
              Dudas o grupo: WhatsApp {GPH_WHATSAPP_DISPLAY}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/fut/pagar?sku=diagnosis" className="mf-btn-gph">
              Pagar pase · {DIAGNOSIS_PRODUCT.publicPriceLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsapp}
              className="mf-btn-gph-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

/** Banda en home: refuerzo corto; el precio vive en el hero. */
export function HomeGphAllianceBand() {
  const whatsapp = diagnosisWhatsAppHref();
  const trainingHref = trainingBookingHref();

  return (
    <section id="diagnosticos-gph" className="scroll-mt-24 border-t border-mf-border bg-mf-gph-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <div className="inline-block rounded-md bg-white px-2 py-1.5">
            <AllianceLockup size="sm" />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph-hot">
            Alianza GPH · disponible ahora
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
            Pase Anual {DIAGNOSIS_PRODUCT.publicPriceLabel} · o clase muestra gratis
          </h2>
          <p className="mt-2 text-sm leading-7 text-white/75">
            Diagnóstico + proyección 2027. Certificado PDF al pagar. La clase muestra es
            sin costo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/fut/pagar?sku=diagnosis" className="mf-btn-gph">
            Adquirir pase · {DIAGNOSIS_PRODUCT.publicPriceLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={trainingHref}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            target="_blank"
            rel="noopener noreferrer"
          >
            Clase muestra
          </a>
          <a
            href={whatsapp}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
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
              Pase Anual GPH–CRACKS o clase muestra
            </h2>
            <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
              Un solo pago anual con certificado formal, o prueba gratis. Todo ligado a la
              ficha de <BrandWordmark className="text-sm" />.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <GphLogo size="sm" />
              <span className={cn("text-xs text-mf-text-muted")}>
                Metodología GPH · ficha en mificha.mx
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3 self-start sm:self-center">
            <Link href="/fut/evaluaciones" className="mf-btn-gph">
              Ver pase
            </Link>
            <a
              href={whatsapp}
              className="mf-btn-gph-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
