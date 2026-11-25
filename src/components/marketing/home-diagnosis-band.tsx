import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { DiagnosisPromoPrice } from "@/components/marketing/diagnosis-promo-price";
import { GphAnnualPassBenefits } from "@/components/marketing/gph-annual-pass-benefits";
import { AllianceLockup } from "@/components/ui/gph-logo";
import {
  diagnosisBookingCtaLabel,
  diagnosisBookingHref,
  diagnosisBookingIsCalendar,
  diagnosisWhatsAppHref,
  GPH_WHATSAPP_DISPLAY,
} from "@/lib/gph-alliance";
import { GPH_ANNUAL_PASS } from "@/lib/gph-commerce";
import { DIAGNOSIS_PRODUCT } from "@/lib/pricing";

/** Oferta de pago principal en home: Pase Anual = diagnóstico + proyección. */
export function HomeDiagnosisBand() {
  const bookingHref = diagnosisBookingHref();
  const bookingIsCalendar = diagnosisBookingIsCalendar();
  const whatsapp = diagnosisWhatsAppHref();

  return (
    <section
      id="diagnostico-gph"
      aria-label={GPH_ANNUAL_PASS.title}
      className="scroll-mt-24 border-b border-mf-border bg-white"
    >
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-10">
        <div className="min-w-0">
          <div className="inline-flex rounded-md bg-mf-canvas px-2 py-1.5 ring-1 ring-mf-border">
            <AllianceLockup size="sm" />
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-mf-gph">
            Único producto de pago · un solo pago anual
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-mf-gph-ink sm:text-3xl">
            {GPH_ANNUAL_PASS.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-mf-text-secondary sm:text-[15px]">
            {GPH_ANNUAL_PASS.lead}
          </p>

          <GphAnnualPassBenefits className="mt-5" compact />

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              href={DIAGNOSIS_PRODUCT.checkoutHref}
              className="mf-btn-gph w-full justify-center sm:w-auto"
            >
              Adquirir pase · $2,030
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/fut/evaluaciones"
              className="mf-btn-gph-ghost w-full justify-center sm:w-auto"
            >
              Ver detalle
            </Link>
            <a
              href={bookingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mf-btn-gph-ghost w-full justify-center sm:w-auto"
            >
              {!bookingIsCalendar ? <MessageCircle className="h-4 w-4" /> : null}
              {diagnosisBookingCtaLabel(`WhatsApp ${GPH_WHATSAPP_DISPLAY}`)}
            </a>
            {bookingIsCalendar ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mf-btn-gph-ghost w-full justify-center sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>

        <aside className="rounded-2xl border border-[#fda4af]/70 bg-[#fff1f2] p-5 sm:p-6">
          <DiagnosisPromoPrice size="lg" tone="gph" />
          <p className="mt-4 text-sm font-medium leading-6 text-mf-gph-ink">
            {GPH_ANNUAL_PASS.closing}
          </p>
        </aside>
      </div>
    </section>
  );
}
