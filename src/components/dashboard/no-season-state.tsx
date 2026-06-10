import Link from "next/link";
import { CalendarClock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoSeasonStateProps {
  title?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function NoSeasonState({
  title = "Temporada MiFicha pendiente",
  backHref,
  backLabel = "← Volver",
  className,
}: NoSeasonStateProps) {
  return (
    <div className={cn("mx-auto max-w-lg space-y-6", className)}>
      {backHref ? (
        <Link href={backHref} className="text-sm font-medium text-mf-brand hover:underline">
          {backLabel}
        </Link>
      ) : null}

      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-8 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
          <CalendarClock className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-mf-text">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
          Para capturar partidos tu academia necesita la{" "}
          <strong className="font-semibold text-mf-text">temporada escolar MiFicha</strong>{" "}
          activa. Esto no tiene que ver con el email de avisos a padres — es el calendario
          oficial de la red.
        </p>
        <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
          Si acabas de registrarte, la temporada se asigna en cuanto MiFicha publica el ciclo
          escolar (por ejemplo <strong className="font-semibold text-mf-text">Escolar 2025–2026</strong>
          ). Luego publicamos jornadas en Partidos.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/interno/temporadas"
            className="inline-flex items-center gap-2 rounded-full bg-mf-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mf-brand-dark"
          >
            Activar temporada (interno)
          </Link>
          <a
            href="mailto:hola@mificha.mx?subject=Temporada%20MiFicha"
            className="inline-flex items-center gap-2 rounded-full border border-mf-brand/20 bg-mf-brand-soft px-4 py-2.5 text-sm font-semibold text-mf-brand transition hover:bg-mf-brand/10"
          >
            <Mail className="h-4 w-4" />
            Contactar soporte
          </a>
        </div>
      </div>
    </div>
  );
}
