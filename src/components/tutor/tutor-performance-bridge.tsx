import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GphPublicStrip } from "@/components/public/gph-public-strip";
import { buildPublicGphEvaluationPath } from "@/lib/gph-player-link";
import type { TutorLinkedPerformance } from "@/lib/tutor-linked-performance";
import { cn } from "@/lib/utils";

function Cell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-mf-canvas px-2.5 py-2 text-center">
      <p className="text-lg font-semibold tabular-nums text-mf-gph-ink">{value}</p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-mf-text-muted">
        {label}
      </p>
    </div>
  );
}

export function TutorPerformanceBridge({
  performance,
  className,
}: {
  performance: TutorLinkedPerformance;
  className?: string;
}) {
  const stats = performance.stats;
  const hasStats =
    stats != null && (stats.total_matches > 0 || stats.total_minutes > 0);
  const officialHref = performance.slug ? `/fut/j/${performance.slug}` : null;
  const gphHref =
    performance.slug && performance.gph
      ? buildPublicGphEvaluationPath(performance.slug)
      : null;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-mf-border bg-white shadow-[var(--mf-shadow)]",
        className,
      )}
    >
      <div className="border-b border-mf-border-subtle bg-mf-canvas/60 px-4 py-3 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Rendimiento oficial
        </p>
        <p className="mt-1 text-sm text-mf-text-secondary">
          {performance.seasonName
            ? `${performance.seasonName}`
            : "Temporada activa"}
          {performance.academyName ? ` · ${performance.academyName}` : ""}
        </p>
      </div>

      {hasStats && stats ? (
        <div className="grid grid-cols-3 gap-2 px-4 py-4 sm:grid-cols-6 sm:px-5">
          <Cell label="Partidos" value={stats.total_matches} />
          <Cell label="Goles" value={stats.total_goals} />
          <Cell label="Asistencias" value={stats.total_assists} />
          <Cell label="Minutos" value={stats.total_minutes} />
          <Cell label="Amarillas" value={stats.total_yellow_cards} />
          <Cell label="Rojas" value={stats.total_red_cards} />
        </div>
      ) : (
        <p className="px-4 py-4 text-sm text-mf-text-secondary sm:px-5">
          Aún no hay stats de torneo publicadas para esta temporada. El material del
          tutor y la evaluación GPH sí pueden mostrarse aquí.
        </p>
      )}

      {performance.gph && gphHref ? (
        <div className="px-4 pb-2 sm:px-5">
          <GphPublicStrip summary={performance.gph} href={gphHref} />
        </div>
      ) : null}

      {officialHref ? (
        <div className="border-t border-mf-border-subtle px-4 py-3 sm:px-5">
          {performance.isPublicFicha ? (
            <Link
              href={officialHref}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-mf-gph hover:underline"
            >
              Ver ficha completa de torneo
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <p className="text-xs leading-6 text-mf-text-muted">
              Hay vínculo con academia. Cuando activen consentimiento y ficha pública,
              aquí aparecerá el enlace completo de torneo.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
