import Link from "next/link";
import { CalendarDays, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoFixturesStateProps {
  backHref?: string | null;
  backLabel?: string;
  className?: string;
}

export function NoFixturesState({
  backHref = "/dashboard/partidos",
  backLabel = "← Volver a partidos",
  className,
}: NoFixturesStateProps) {
  return (
    <div className={cn("mx-auto max-w-lg space-y-6", className)}>
      {backHref ? (
        <Link href={backHref} className="text-sm font-medium text-mf-brand hover:underline">
          {backLabel}
        </Link>
      ) : null}

      <div className="rounded-2xl border border-mf-brand/15 bg-gradient-to-br from-mf-brand-soft to-white p-8 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mf-brand text-white">
          <CalendarDays className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-mf-text">
          Aún no hay jornadas publicadas
        </h1>
        <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
          MiFicha publicará el calendario oficial de tu competición (rival, fecha,
          sede y categoría). Cuando aparezca aquí, capturas convocados y minutos en ~1
          minuto post-partido (tras marcador y acta oficial).
        </p>
        <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
          Los amistosos fuera de torneo también los agenda el equipo MiFicha para
          evitar duplicados en el calendario.
        </p>
        <a
          href="mailto:hola@mificha.mx?subject=Jornada%20oficial%20MiFicha"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-mf-brand/20 bg-white px-4 py-2.5 text-sm font-semibold text-mf-brand transition hover:bg-mf-brand-soft"
        >
          <Mail className="h-4 w-4" />
          Consultar calendario
        </a>
      </div>
    </div>
  );
}
