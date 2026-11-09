"use client";

import { GphPublicStrip } from "@/components/public/gph-public-strip";
import { buildPublicGphEvaluationPath } from "@/lib/gph-player-link";
import {
  buildTutorCareerSummary,
} from "@/lib/tutor-career-summary";
import type { TutorSeasonStat } from "@/lib/tutor-family";
import type { TutorLinkedPerformance } from "@/lib/tutor-linked-performance";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

function StatCell({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string | number;
  emphasize?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl px-2.5 py-3 text-center",
        emphasize ? "bg-mf-gph text-white" : "bg-mf-canvas",
      )}
    >
      <p
        className={cn(
          "text-2xl font-semibold tabular-nums",
          emphasize ? "text-white" : "text-mf-gph-ink",
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "mt-0.5 text-[10px] font-medium uppercase tracking-[0.08em]",
          emphasize ? "text-white/80" : "text-mf-text-muted",
        )}
      >
        {label}
      </p>
    </div>
  );
}

function MiniCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-mf-canvas px-2 py-1.5 text-center">
      <p className="text-sm font-semibold tabular-nums text-mf-gph-ink">{value}</p>
      <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-mf-text-muted">
        {label}
      </p>
    </div>
  );
}

export function TutorCareerSummaryCard({
  seasons,
  performance,
  className,
  title = "Resumen de carrera",
  onAddTournament,
  exploreOptIn,
}: {
  seasons?: TutorSeasonStat[] | null;
  performance?: TutorLinkedPerformance | null;
  className?: string;
  title?: string;
  onAddTournament?: () => void;
  exploreOptIn?: boolean;
}) {
  const summary = buildTutorCareerSummary({ seasons, performance });
  const hasNumbers =
    summary.matches > 0 ||
    summary.minutes > 0 ||
    summary.goals > 0 ||
    summary.assists > 0;
  const officialHref = performance?.slug ? `/fut/j/${performance.slug}` : null;
  const gphHref =
    performance?.slug && performance.gph
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
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              {title}
            </p>
            <p className="mt-1 text-sm text-mf-text-secondary">
              {hasNumbers
                ? [
                    summary.tournamentCount === 1
                      ? "1 fuente"
                      : `${summary.tournamentCount} fuentes`,
                    summary.hasAcademy ? "incluye academia" : null,
                    summary.hasTutorStats ? "incluye captura del tutor" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : "Aquí se acumulan torneos, partidos y minutos de la ficha."}
              {typeof exploreOptIn === "boolean"
                ? exploreOptIn
                  ? " · visible en Explorar"
                  : " · solo con link"
                : ""}
            </p>
          </div>
          {onAddTournament ? (
            <button
              type="button"
              onClick={onAddTournament}
              className="inline-flex items-center gap-1.5 rounded-full border border-mf-gph/35 bg-white px-3 py-1.5 text-xs font-semibold text-mf-gph-ink transition hover:border-mf-gph hover:bg-mf-gph-soft"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar torneo
            </button>
          ) : null}
        </div>
      </div>

      {hasNumbers ? (
        <div className="grid grid-cols-2 gap-2 px-4 py-4 sm:grid-cols-4 sm:px-5">
          <StatCell label="Partidos" value={summary.matches} emphasize />
          <StatCell label="Goles" value={summary.goals} />
          <StatCell label="Asistencias" value={summary.assists} />
          <StatCell label="Minutos" value={summary.minutes} />
        </div>
      ) : (
        <div className="px-4 py-5 sm:px-5">
          <p className="text-sm leading-6 text-mf-text-secondary">
            Todavía no hay números acumulados. Agrega un torneo en Rendimiento
            {performance ? " o espera stats oficiales de la academia ligada" : ""}.
          </p>
          {onAddTournament ? (
            <button type="button" onClick={onAddTournament} className="mf-btn-gph mt-3">
              <Plus className="h-4 w-4" />
              Capturar primer torneo
            </button>
          ) : null}
        </div>
      )}

      {summary.sources.length ? (
        <ul className="divide-y divide-mf-border-subtle border-t border-mf-border-subtle">
          {summary.sources.map((source) => (
            <li key={source.id} className="px-4 py-3.5 sm:px-5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-mf-gph-ink">{source.title}</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                    source.kind === "academy"
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-mf-gph-soft text-mf-gph",
                  )}
                >
                  {source.kind === "academy" ? "Oficial" : "Tutor"}
                </span>
              </div>
              {source.subtitle ? (
                <p className="mt-0.5 text-xs text-mf-text-muted">{source.subtitle}</p>
              ) : null}
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                <MiniCell label="PJ" value={source.matches} />
                <MiniCell label="Goles" value={source.goals} />
                <MiniCell label="Asist." value={source.assists} />
                <MiniCell label="Min" value={source.minutes} />
              </div>
              {source.notes ? (
                <p className="mt-2 text-xs leading-5 text-mf-text-secondary">{source.notes}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {summary.hasAcademy &&
      (summary.yellow_cards > 0 || summary.red_cards > 0) ? (
        <div className="grid grid-cols-2 gap-2 border-t border-mf-border-subtle px-4 py-3 sm:px-5">
          <MiniCell label="Amarillas" value={summary.yellow_cards} />
          <MiniCell label="Rojas" value={summary.red_cards} />
        </div>
      ) : null}

      {performance?.gph && gphHref ? (
        <div className="border-t border-mf-border-subtle px-4 py-3 sm:px-5">
          <GphPublicStrip summary={performance.gph} href={gphHref} />
        </div>
      ) : null}

      {officialHref && performance?.isPublicFicha ? (
        <div className="border-t border-mf-border-subtle px-4 py-3 sm:px-5">
          <Link
            href={officialHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-mf-gph hover:underline"
          >
            Ver ficha oficial de academia
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}
