import { DIAGNOSIS_PROMO, formatMxn } from "@/lib/gph-commerce";
import { cn } from "@/lib/utils";

type PromoSize = "sm" | "md" | "lg";
type PromoTone = "light" | "dark" | "gph";

/**
 * Precio del diagnóstico con promo: lista tachada + precio actual.
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
  const listLabel = formatMxn(DIAGNOSIS_PROMO.listPriceMxn);
  const saleLabel = formatMxn(DIAGNOSIS_PROMO.priceMxn);

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
  const listColor =
    tone === "dark" ? "text-white/55" : tone === "gph" ? "text-mf-gph-ink/45" : "text-mf-text-muted";

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

      <div className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1", showBadge ? "mt-3" : "mt-0")}>
        <p className={cn("font-bold tracking-tight leading-none", saleColor, headlineSize)}>
          {saleLabel}
        </p>
        <p className={cn("text-base font-semibold line-through sm:text-lg", listColor)}>
          {listLabel}
        </p>
      </div>
      <p className={cn("mt-1.5 text-sm leading-6", muted)}>
        Pase Anual GPH–CRACKS · un solo pago · {listLabel} con {percent}% de descuento.
      </p>
    </div>
  );
}
