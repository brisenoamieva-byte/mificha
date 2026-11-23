import { DIAGNOSIS_PROMO } from "@/lib/gph-commerce";
import { cn } from "@/lib/utils";

type PromoSize = "sm" | "md" | "lg";
type PromoTone = "light" | "dark" | "gph";

/**
 * Badge de promo del diagnóstico sin montos en UI pública.
 * El cobro concreto vive en Mercado Pago al pagar.
 */
export function DiagnosisPromoPrice({
  size = "md",
  tone = "light",
  showBadge = true,
  className,
}: {
  size?: PromoSize;
  tone?: PromoTone;
  /** Si el contenedor ya dice “promoción”, evita repetir el badge. */
  showBadge?: boolean;
  className?: string;
}) {
  const percent = DIAGNOSIS_PROMO.discountPercent;

  const headlineSize =
    size === "lg"
      ? "text-2xl sm:text-3xl"
      : size === "sm"
        ? "text-lg"
        : "text-xl sm:text-2xl";

  const muted =
    tone === "dark"
      ? "text-white/70"
      : tone === "gph"
        ? "text-mf-gph-ink/70"
        : "text-mf-text-secondary";
  const saleColor =
    tone === "dark" ? "text-white" : tone === "gph" ? "text-mf-gph-ink" : "text-mf-gph-ink";

  return (
    <div className={cn("min-w-0", className)}>
      {showBadge ? (
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]",
              "bg-[#e11d48] text-white shadow-sm",
            )}
          >
            {percent}% de descuento
          </span>
          <span
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.14em]",
              tone === "dark" ? "text-[#fda4af]" : "text-[#e11d48]",
            )}
          >
            Precio promocional
          </span>
        </div>
      ) : null}

      <p
        className={cn(
          "font-bold tracking-tight leading-tight",
          saleColor,
          headlineSize,
          showBadge ? "mt-3" : "mt-0",
        )}
      >
        Promo del diagnóstico
      </p>
      <p className={cn("mt-1.5 text-sm leading-6", muted)}>
        Evaluación presencial + 12 meses de MiFicha. El monto se confirma al pagar.
      </p>
    </div>
  );
}
