import { GPH_ANNUAL_PASS } from "@/lib/gph-commerce";
import { cn } from "@/lib/utils";

/** Lista de beneficios del Pase Anual (producto de pago = diagnóstico + proyección). */
export function GphAnnualPassBenefits({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      {!compact ? (
        <>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mf-gph">
            {GPH_ANNUAL_PASS.eyebrow}
          </p>
          <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
            {GPH_ANNUAL_PASS.lead}
          </p>
        </>
      ) : null}
      <ul className={cn("space-y-2", compact ? "mt-0" : "mt-4")}>
        {GPH_ANNUAL_PASS.benefits.map((item) => (
          <li
            key={item}
            className="flex gap-2 text-sm leading-6 text-mf-text-secondary"
          >
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mf-gph"
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-5 text-mf-text-muted">
        {GPH_ANNUAL_PASS.certificateNote}
      </p>
      {!compact ? (
        <p className="mt-2 text-sm font-medium leading-6 text-mf-gph-ink">
          {GPH_ANNUAL_PASS.closing}
        </p>
      ) : null}
    </div>
  );
}
