import { DIAGNOSIS_PROMO, FAMILY_PRODUCTS, formatMxn } from "@/lib/gph-commerce";
import { cn } from "@/lib/utils";

type PromoSize = "sm" | "md" | "lg";
type PromoTone = "light" | "dark" | "gph";

export function DiagnosisPromoPrice({
  size = "md",
  tone = "light",
  showCaption = true,
  className,
}: {
  size?: PromoSize;
  tone?: PromoTone;
  showCaption?: boolean;
  className?: string;
}) {
  const list = formatMxn(FAMILY_PRODUCTS.diagnosis.listPriceMxn);
  const sale = formatMxn(FAMILY_PRODUCTS.diagnosis.priceMxn);
  const percent = DIAGNOSIS_PROMO.discountPercent;

  const saleSize =
    size === "lg"
      ? "text-4xl sm:text-5xl"
      : size === "sm"
        ? "text-2xl"
        : "text-3xl sm:text-[2.15rem]";
  const listSize = size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-base";

  const muted =
    tone === "dark"
      ? "text-white/55"
      : tone === "gph"
        ? "text-mf-gph-ink/55"
        : "text-mf-text-muted";
  const saleColor =
    tone === "dark" ? "text-white" : tone === "gph" ? "text-mf-gph-ink" : "text-mf-gph-ink";
  const captionColor =
    tone === "dark" ? "text-white/70" : "text-mf-text-secondary";

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]",
            tone === "dark"
              ? "bg-[#e11d48] text-white"
              : "bg-[#e11d48] text-white shadow-sm",
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
          Solo por tiempo limitado
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
        <p className={cn("relative font-semibold tabular-nums leading-none", muted, listSize)}>
          <span aria-hidden className="relative">
            {list}
            <span
              className="absolute left-[-4%] right-[-4%] top-1/2 h-[2.5px] -translate-y-1/2 rotate-[-8deg] rounded-full bg-[#e11d48]"
              aria-hidden
            />
          </span>
          <span className="sr-only">Precio anterior {list}</span>
        </p>
        <p
          className={cn(
            "font-bold tracking-tight tabular-nums leading-none",
            saleColor,
            saleSize,
          )}
        >
          {sale}
          <span className="sr-only"> precio promocional</span>
        </p>
      </div>

      {showCaption ? (
        <p className={cn("mt-2 text-sm leading-6", captionColor)}>
          Evaluación GPH + 12 meses de MiFicha · ahorras{" "}
          <span className="font-semibold text-[#e11d48]">
            {formatMxn(FAMILY_PRODUCTS.diagnosis.listPriceMxn - FAMILY_PRODUCTS.diagnosis.priceMxn)}
          </span>
        </p>
      ) : null}
    </div>
  );
}
