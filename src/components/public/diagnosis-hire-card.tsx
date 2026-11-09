import Link from "next/link";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { DiagnosisPromoPrice } from "@/components/marketing/diagnosis-promo-price";
import { AllianceLockup } from "@/components/ui/gph-logo";
import { diagnosisWhatsAppHref, GPH_WHATSAPP_DISPLAY } from "@/lib/gph-alliance";
import { DIAGNOSIS_PROMO } from "@/lib/gph-commerce";
import { DIAGNOSIS_PRODUCT } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const HIGHLIGHTS = [
  "Sesión presencial · técnica, táctica, físico, mental y hábitos",
  "Etapa + 3 a 5 objetivos claros para entrenar con rumbo",
  "Informe digital ligado a esta ficha · 12 meses de MiFicha",
] as const;

export function DiagnosisHireCard({
  playerName,
  className,
  compact = false,
}: {
  playerName?: string;
  className?: string;
  /** CTA corto para fichas públicas (no empuja la venta sobre el perfil). */
  compact?: boolean;
}) {
  const name = playerName?.trim() || "";
  const whatsapp = diagnosisWhatsAppHref(name || undefined);
  const payHref = name
    ? `${DIAGNOSIS_PRODUCT.checkoutHref}&player=${encodeURIComponent(name)}`
    : DIAGNOSIS_PRODUCT.checkoutHref;

  if (compact) {
    return (
      <section
        className={cn(
          "flex flex-col gap-3 rounded-2xl border border-mf-border bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 print:hidden",
          className,
        )}
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-gph">
            Diagnóstico GPH · {DIAGNOSIS_PROMO.badgeShort}
          </p>
          <p className="mt-1 text-sm leading-6 text-mf-text-secondary">
            {name
              ? `Evalúa el punto de partida de ${name} y deja objetivos en la ficha.`
              : "Evalúa el punto de partida y deja objetivos en la ficha."}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mf-btn-gph"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <Link href={payHref} className="mf-btn-gph-ghost">
            Pagar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-mf-gph/25 bg-white shadow-[var(--mf-shadow)] print:hidden",
        className,
      )}
    >
      <div className="h-1.5 bg-mf-gph" aria-hidden />
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              Diagnóstico GPH · promoción
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-mf-gph-ink">
              {name
                ? `¿Quieres el diagnóstico de ${name}?`
                : "Contratar diagnóstico GPH"}
            </h2>
            <DiagnosisPromoPrice className="mt-3" size="md" />
            <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
              Mide el punto de partida, identifica fortalezas y deja objetivos concretos
              en la ficha. No promete beca ni selección: orienta el desarrollo.
            </p>
          </div>
          <div className="rounded-md bg-white px-2 py-1.5 ring-1 ring-mf-border">
            <AllianceLockup size="sm" />
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {HIGHLIGHTS.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-6 text-mf-text-secondary">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-mf-gph" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mf-btn-gph"
          >
            <MessageCircle className="h-4 w-4" />
            Agendar por WhatsApp
          </a>
          <Link href={payHref} className="mf-btn-gph-ghost">
            Pagar diagnóstico
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/fut/evaluaciones" className="mf-btn-gph-ghost">
            Ver todo el detalle
          </Link>
        </div>
        <p className="mt-3 text-xs text-mf-text-muted">
          WhatsApp GPH: {GPH_WHATSAPP_DISPLAY}
        </p>
      </div>
    </section>
  );
}
