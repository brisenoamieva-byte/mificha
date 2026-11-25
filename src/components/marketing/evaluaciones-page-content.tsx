import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  LineChart,
  MessageCircle,
} from "lucide-react";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { DiagnosisPromoPrice } from "@/components/marketing/diagnosis-promo-price";
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
        title="Proyecta su talento. Impulsa su sueño."
        description="Diagnóstico anual de proyección 2027 · un solo pago. Conoce dónde está hoy y construye el camino para llevarlo más lejos."
        actions={
          <>
            <Link href={DIAGNOSIS_PRODUCT.checkoutHref} className="mf-btn-gph">
              Solicitar e inscribir · {DIAGNOSIS_PRODUCT.publicPriceLabel}
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
          <div className="space-y-5">
            <div className="rounded-xl border border-mf-border bg-mf-gph-soft/50 px-4 py-3.5">
              <AllianceLockup size="sm" />
              <DiagnosisPromoPrice className="mt-3" size="md" tone="gph" showBadge />
            </div>
            <p className="text-sm leading-6 text-mf-gph-ink">
              <span className="font-bold">{GPH_ANNUAL_PASS.featuredBenefit}.</span>{" "}
              <span className="text-mf-text-secondary">
                Además: diagnóstico integral, selectivos CRACKS y especialización mensual.
              </span>
            </p>
            <p className="text-sm text-mf-text-secondary">
              <Link href="/fut/d/demo" className="font-semibold text-mf-gph hover:underline">
                Ver ejemplo de informe
              </Link>
              <span className="text-mf-text-muted"> · certificado PDF al pagar</span>
            </p>
          </div>
        }
        asideAlign="start"
        asideClassName="lg:max-w-[440px]"
        aside={
          <figure className="overflow-hidden rounded-2xl border border-mf-border bg-white shadow-[var(--mf-shadow)]">
            <Image
              src={GPH_ANNUAL_PASS.flyerSrc}
              alt={GPH_ANNUAL_PASS.flyerAlt}
              width={1080}
              height={1350}
              className="h-auto w-full"
              priority
              sizes="(max-width: 1024px) 100vw, 440px"
            />
            <figcaption className="px-4 py-3 text-[11px] leading-5 text-mf-text-muted">
              {GPH_ANNUAL_PASS.clubsDisclaimer}
            </figcaption>
          </figure>
        }
      />

      <section className="border-b border-mf-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <p className="mf-marketing-eyebrow">Proceso</p>
          <h2 className="mt-2 max-w-xl text-xl font-semibold tracking-[-0.02em] text-mf-gph-ink sm:text-2xl">
            Tres pasos hasta su proyección 2027
          </h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-10">
            {STEPS.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mf-gph text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <Icon className="h-4 w-4 text-mf-gph" aria-hidden />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-mf-gph-ink">{item.title}</p>
                  <p className="mt-1.5 text-sm leading-6 text-mf-text-secondary">
                    {item.description}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section id="agendar" className="scroll-mt-24 border-b border-mf-border bg-mf-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
          <div className="min-w-0">
            <p className="mf-marketing-eyebrow">Listo para empezar</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-mf-gph-ink sm:text-2xl">
              {GPH_ANNUAL_PASS.title}
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-mf-text-secondary">
              {DIAGNOSIS_PRODUCT.publicPriceLabel} (antes {DIAGNOSIS_PRODUCT.listPriceLabel}).
              Al pagar recibes el certificado formal 2027 por correo.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={DIAGNOSIS_PRODUCT.checkoutHref} className="mf-btn-gph">
                Solicitar e inscribir · {DIAGNOSIS_PRODUCT.publicPriceLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={whatsapp}
                className="mf-btn-gph-ghost"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp {GPH_WHATSAPP_DISPLAY}
              </a>
            </div>
          </div>

          <div
            id="clase-muestra"
            className="scroll-mt-24 border-t border-mf-border pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mf-gph">
              {GPH_SAMPLE_CLASS.badge} · alternativa
            </p>
            <h3 className="mt-2 text-base font-semibold text-mf-gph-ink">
              {GPH_SAMPLE_CLASS.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
              Sesión práctica sin evaluación formal ni informe. Conoce el estilo GPH antes
              del pase.
            </p>
            <a
              href={trainingHref}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-mf-gph hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {trainingBookingCtaLabel()}
              <ArrowRight className="h-4 w-4" />
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
            Solicitar e inscribir · {DIAGNOSIS_PRODUCT.publicPriceLabel}
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
