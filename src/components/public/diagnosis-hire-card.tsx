import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { AllianceLockup } from "@/components/ui/gph-logo";
import { diagnosisWhatsAppHref, GPH_WHATSAPP_DISPLAY } from "@/lib/gph-alliance";
import { DIAGNOSIS_PRODUCT } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function DiagnosisHireCard({
  playerName,
  className,
}: {
  playerName?: string;
  className?: string;
}) {
  const name = playerName?.trim() || "";
  const whatsapp = diagnosisWhatsAppHref(name || undefined);
  const payHref = name
    ? `${DIAGNOSIS_PRODUCT.checkoutHref}&player=${encodeURIComponent(name)}`
    : DIAGNOSIS_PRODUCT.checkoutHref;

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
              Diagnóstico GPH
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-mf-gph-ink">
              {name
                ? `Contratar evaluación para ${name}`
                : "Contratar evaluación GPH"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
              Sesión presencial, ficha visual y lectura de entrenador.{" "}
              {DIAGNOSIS_PRODUCT.publicPriceLabel} · incluye 12 meses de MiFicha. El
              informe queda ligado a esta ficha.
            </p>
          </div>
          <div className="rounded-md bg-white px-2 py-1.5 ring-1 ring-mf-border">
            <AllianceLockup size="sm" />
          </div>
        </div>

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
            Ir a pagar {DIAGNOSIS_PRODUCT.publicPriceLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/fut/evaluaciones" className="mf-btn-gph-ghost">
            Ver detalle
          </Link>
        </div>
        <p className="mt-3 text-xs text-mf-text-muted">
          WhatsApp GPH: {GPH_WHATSAPP_DISPLAY}
        </p>
      </div>
    </section>
  );
}
