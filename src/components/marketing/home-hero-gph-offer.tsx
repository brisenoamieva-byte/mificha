import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { DiagnosisPromoPrice } from "@/components/marketing/diagnosis-promo-price";
import { AllianceLockup } from "@/components/ui/gph-logo";
import {
  diagnosisBookingCtaLabel,
  diagnosisBookingHref,
  diagnosisBookingIsCalendar,
  diagnosisWhatsAppHref,
  GPH_WHATSAPP_DISPLAY,
} from "@/lib/gph-alliance";
import { DIAGNOSIS_PRODUCT } from "@/lib/pricing";
import { cn } from "@/lib/utils";

/** Oferta de conversión del hero: bloque compacto bajo el copy. */
export function HomeHeroGphOffer({ className }: { className?: string }) {
  const bookingHref = diagnosisBookingHref();
  const bookingIsCalendar = diagnosisBookingIsCalendar();
  const whatsapp = diagnosisWhatsAppHref();

  return (
    <aside
      aria-label="Contratar diagnóstico GPH"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-mf-gph/30 bg-mf-gph-soft/70 px-4 py-4 sm:px-5 sm:py-4",
        className,
      )}
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-mf-gph" aria-hidden />

      <div className="w-fit rounded-md bg-white px-2 py-1 ring-1 ring-mf-border">
        <AllianceLockup size="sm" />
      </div>

      <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-mf-gph">
        Diagnóstico GPH · Querétaro
      </p>
      <p className="mt-1.5 text-sm font-semibold leading-snug text-mf-gph-ink">
        Evaluación presencial de futbol: mide el punto de partida y deja objetivos en la
        ficha.
      </p>

      <DiagnosisPromoPrice className="mt-3" size="sm" tone="gph" />

      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={DIAGNOSIS_PRODUCT.checkoutHref} className="mf-btn-gph">
          Pagar diagnóstico
          <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href={bookingHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mf-btn-gph-ghost"
        >
          {!bookingIsCalendar ? <MessageCircle className="h-4 w-4" /> : null}
          {diagnosisBookingCtaLabel(`WhatsApp ${GPH_WHATSAPP_DISPLAY}`)}
        </a>
        {bookingIsCalendar ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mf-btn-gph-ghost"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        ) : null}
      </div>
    </aside>
  );
}
