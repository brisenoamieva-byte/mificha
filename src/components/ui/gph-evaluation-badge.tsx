import Link from "next/link";
import { cn } from "@/lib/utils";

type GphEvaluationBadgeProps = {
  href?: string;
  /** `solid` sobre fotos oscuras (landing de academia). */
  variant?: "soft" | "solid";
  className?: string;
  /** Evita anidar un <a> dentro de otra tarjeta-enlace. */
  asSpan?: boolean;
};

export function GphEvaluationBadge({
  href,
  variant = "soft",
  className,
  asSpan = false,
}: GphEvaluationBadgeProps) {
  const classes = cn(
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
    variant === "solid"
      ? "bg-mf-gph text-white"
      : "bg-mf-gph-soft text-mf-gph ring-1 ring-mf-gph/30",
    className,
  );

  const label = (
    <>
      <span aria-hidden className="font-black">
        GPH
      </span>{" "}
      Evaluación
    </>
  );

  if (href && !asSpan) {
    return (
      <Link href={href} className={classes} title="Ver evaluación GPH">
        {label}
      </Link>
    );
  }

  return (
    <span className={classes} title="Tiene evaluación GPH">
      {label}
    </span>
  );
}
