"use client";

import { DIAGNOSIS_DOMAIN_LABELS, DIAGNOSIS_DOMAINS, type DiagnosisCoachBrief } from "@/lib/player-diagnosis";

export function CoachBriefSection({
  brief,
  compact = false,
  hideFamily = false,
}: {
  brief: DiagnosisCoachBrief;
  compact?: boolean;
  hideFamily?: boolean;
}) {
  const sourceLabel = brief.source === "ai" ? "IA · staff GPH" : "Staff GPH";

  return (
    <div className="space-y-4">
      {!hideFamily && brief.family ? (
        <div className="rounded-xl bg-mf-gph-soft px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            Para la familia
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-mf-gph-ink">{brief.family}</p>
        </div>
      ) : null}

      {brief.sessionFocus.length > 0 ? (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            Próxima sesión
          </p>
          <ol className="mt-3 space-y-2">
            {brief.sessionFocus.map((item, index) => (
              <li key={item.slice(0, 48)} className="flex gap-3 text-sm leading-relaxed text-mf-gph-ink">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-mf-gph text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {brief.warnings.length > 0 ? (
        <div className="rounded-xl border border-mf-gph/30 bg-mf-gph-soft px-3 py-3">
          <p className="text-xs font-semibold text-mf-gph">Alertas de staff</p>
          <ul className="mt-1.5 space-y-1 text-sm text-mf-text-secondary">
            {brief.warnings.map((item) => (
              <li key={item.slice(0, 48)}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <details className="rounded-xl border border-mf-border-subtle px-4 py-3">
        <summary className="cursor-pointer text-xs font-semibold text-mf-gph-ink">
          Lectura para el staff · {sourceLabel}
        </summary>
        <div className="mt-4 space-y-4">
          {brief.stageRationale ? (
            <div>
              <p className="text-xs font-semibold text-mf-gph">Por qué esta etapa</p>
              <p className="mt-1 text-sm leading-relaxed text-mf-text-secondary">
                {brief.stageRationale}
              </p>
            </div>
          ) : null}
          {brief.overall ? (
            <div>
              <p className="text-xs font-semibold text-mf-gph-ink">Criterio de entrenador</p>
              <p className="mt-1 text-sm leading-relaxed text-mf-text-secondary">{brief.overall}</p>
            </div>
          ) : null}
          {!compact && DIAGNOSIS_DOMAINS.some((domain) => brief.domains[domain]) ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {DIAGNOSIS_DOMAINS.map((domain) =>
                brief.domains[domain] ? (
                  <div key={domain} className="rounded-xl bg-mf-gph-soft/70 px-3 py-3">
                    <p className="text-xs font-semibold text-mf-gph">
                      {DIAGNOSIS_DOMAIN_LABELS[domain]}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-mf-text-secondary">
                      {brief.domains[domain]}
                    </p>
                  </div>
                ) : null,
              )}
            </div>
          ) : null}
        </div>
      </details>
    </div>
  );
}
