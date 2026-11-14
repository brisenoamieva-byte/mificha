import Link from "next/link";
import { cn } from "@/lib/utils";

type GphEvaluationBadgeProps = {
  href?: string;
  /** `solid` sobre fotos oscuras (landing de academia). */
  variant?: "soft" | "solid";
  className?: string;
  /** Evita anidar un <a> dentro de otra tarjeta-enlace. */
  asSpan?: boolean;
  /** Calificación global 1–5, si se quiere mostrar en el sello. */
  score?: number | null;
};

export function GphEvaluationBadge({
  href,
  variant = "soft",
  className,
  asSpan = false,
  score = null,
}: GphEvaluationBadgeProps) {
  const classes = cn(
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
    variant === "solid"
      ? "bg-mf-gph text-white"
      : "bg-mf-gph-soft text-mf-gph ring-1 ring-mf-gph/30",
    className,
  );

  const scoreLabel =
    score != null && Number.isFinite(score)
      ? ` · ${Number(score).toFixed(1)}`
      : "";

  const label = (
    <>
      <span aria-hidden className="font-black">
        GPH
      </span>{" "}
      {scoreLabel ? (
        <span className="normal-case tracking-normal tabular-nums">
          {Number(score).toFixed(1)}
        </span>
      ) : (
        "Evaluación"
      )}
    </>
  );

  if (href && !asSpan) {
    return (
      <Link
        href={href}
        className={classes}
        title={`Evaluación GPH${scoreLabel}`}
      >
        {label}
      </Link>
    );
  }

  return (
    <span className={classes} title={`Evaluación GPH${scoreLabel || ""}`}>
      {label}
    </span>
  );
}
