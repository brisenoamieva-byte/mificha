"use client";

import { useEffect, useState } from "react";
import { Printer, Share2 } from "lucide-react";
import { CoachBriefSection } from "@/components/diagnosis/coach-brief-section";
import { DiagnosisScoreRing } from "@/components/diagnosis/diagnosis-score-ring";
import { FieldSessionReport } from "@/components/diagnosis/field-session-report";
import { AllianceLockup } from "@/components/ui/gph-logo";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { GPH_ALLIANCE } from "@/lib/gph-alliance";
import { toast } from "@/components/ui/toast";
import { calculateAge, getPositionLabel } from "@/lib/dashboard-utils";
import { formatPlayerCategory } from "@/lib/player-category";
import {
  DIAGNOSIS_DOMAIN_LABELS,
  DIAGNOSIS_DOMAIN_WEIGHTS,
  DIAGNOSIS_DOMAINS,
  DIAGNOSIS_GROUP_LABELS,
  DIAGNOSIS_KIND_LABELS,
  DIAGNOSIS_MONTH_META,
  DIAGNOSIS_MONTHS,
  DIAGNOSIS_SCALE,
  DIAGNOSIS_STAGE_LABELS,
  formatDiagnosisDate,
  indicatorsForModule,
  rankedIndicators,
  scoreTone,
  type DiagnosisAcademySnapshot,
  type DiagnosisDomain,
  type DiagnosisPlayerSnapshot,
  type PlayerDiagnosisRecord,
} from "@/lib/player-diagnosis";
import { getDominantFootLabel } from "@/lib/player-utils";
import { cn } from "@/lib/utils";

const TONE_SOFT: Record<ReturnType<typeof scoreTone>, string> = {
  danger: "bg-mf-gph text-white",
  warning: "bg-mf-gph-muted text-mf-gph-ink",
  success: "bg-mf-gph-ink text-white",
  neutral: "bg-mf-canvas text-mf-text-muted",
};

function DomainBar({
  domain,
  value,
}: {
  domain: DiagnosisDomain;
  value: number | null;
}) {
  const pct = value == null ? 0 : (value / 5) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-mf-gph-ink">
          {DIAGNOSIS_DOMAIN_LABELS[domain]}
        </p>
        <p className="text-sm font-semibold tabular-nums text-mf-gph">
          {value == null ? "—" : value.toFixed(1)}
          <span className="ml-1 text-[11px] font-medium text-mf-text-muted">
            {Math.round(DIAGNOSIS_DOMAIN_WEIGHTS[domain] * 100)}%
          </span>
        </p>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-mf-gph-muted">
        <div className="h-full rounded-full bg-mf-gph" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function IndicatorCell({
  label,
  score,
  flagged,
}: {
  label: string;
  score: number | null;
  flagged: boolean;
}) {
  const tone = scoreTone(score);
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-mf-gph-soft/60 px-2.5 py-2">
      <p className="min-w-0 truncate text-[13px] text-mf-gph-ink">{label}</p>
      <span
        className={cn(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums",
          TONE_SOFT[tone],
          flagged && "ring-2 ring-mf-gph",
        )}
      >
        {score ?? "·"}
      </span>
    </div>
  );
}

interface DiagnosisReportProps {
  diagnosis: PlayerDiagnosisRecord;
  player: DiagnosisPlayerSnapshot;
  academy: DiagnosisAcademySnapshot;
  shareUrl?: string | null;
  onCreateShareLink?: () => Promise<string | null>;
}

export function DiagnosisReport({
  diagnosis,
  player,
  academy,
  shareUrl,
  onCreateShareLink,
}: DiagnosisReportProps) {
  const stage = diagnosis.assigned_stage ?? diagnosis.computed_stage;
  const moduleIndicators = indicatorsForModule(diagnosis.module);
  const strengths = rankedIndicators(diagnosis.scores, diagnosis.module, "high", 3);
  const gaps = rankedIndicators(diagnosis.scores, diagnosis.module, "low", 3);
  const focus = gaps[0] ?? null;
  const groups = (["comun", diagnosis.module, "fisico", "mental"] as const).map(
    (group) => ({
      group,
      items: moduleIndicators.filter((item) => item.group === group),
    }),
  );
  const hasPlan = DIAGNOSIS_MONTHS.some(
    (month) =>
      diagnosis.monthly_plan[month]?.objective ||
      diagnosis.monthly_plan[month]?.actions,
  );
  const priorities = diagnosis.program_priorities.filter((item) => item.title);
  const brief = diagnosis.field_session.coachBrief;
  const remainingGaps = focus ? gaps.filter((item) => item.id !== focus.id) : gaps;
  const showSecondaryGaps = remainingGaps.length > 0 && priorities.length === 0;
  const showFamilyGoal = Boolean(diagnosis.family_goal) && !brief?.family;
  const hasContext = Boolean(
    diagnosis.why_join ||
      diagnosis.player_goal ||
      showFamilyGoal ||
      diagnosis.injuries ||
      diagnosis.medical_notes ||
      diagnosis.years_experience != null ||
      diagnosis.sessions_per_week != null ||
      diagnosis.session_days ||
      diagnosis.assigned_group ||
      diagnosis.field_session.currentClub,
  );
  const age = calculateAge(player.birth_date);

  const [link, setLink] = useState(shareUrl ?? null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    setLink(shareUrl ?? null);
  }, [shareUrl]);

  async function copyShare() {
    let url = link;
    if (!url && onCreateShareLink) {
      setSharing(true);
      try {
        url = await onCreateShareLink();
        if (url) setLink(url);
      } finally {
        setSharing(false);
      }
    }
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link de la ficha copiado.");
    } catch {
      toast.error("No se pudo copiar el link.");
    }
  }

  return (
    <article className="diagnosis-report overflow-hidden rounded-2xl border border-mf-gph/15 bg-white">
      <header className="border-b border-mf-gph/15 bg-white">
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <div className="min-w-0">
            <AllianceLockup size="sm" className="min-w-0" />
          </div>
          <div className="min-w-0 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mf-gph">
              Diagnóstico GPH
            </p>
            <p className="mt-0.5 text-xs text-mf-text-secondary">
              {DIAGNOSIS_KIND_LABELS[diagnosis.kind]} ·{" "}
              {formatDiagnosisDate(diagnosis.evaluated_at)}
            </p>
          </div>
        </div>
        <div className="h-1 bg-mf-gph" aria-hidden />
      </header>

      <div className="diagnosis-report-toolbar flex flex-wrap items-center justify-end gap-2 border-b border-mf-border-subtle bg-white px-5 py-2 print:hidden">
        {link || onCreateShareLink ? (
          <button
            type="button"
            onClick={() => void copyShare()}
            disabled={sharing}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-mf-gph-ink hover:bg-mf-gph-soft"
          >
            <Share2 className="h-3.5 w-3.5" />
            {sharing ? "Generando…" : "Copiar ficha"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-mf-text-secondary hover:bg-mf-canvas"
        >
          <Printer className="h-3.5 w-3.5" />
          Imprimir
        </button>
      </div>

      <section className="border-b border-mf-gph/15 bg-mf-gph-soft/70 px-5 py-6">
        <div className="grid gap-6 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <div className="overflow-hidden rounded-2xl ring-1 ring-mf-gph/35 ring-offset-2 ring-offset-mf-gph-soft">
            <PlayerAvatar
              firstName={player.first_name}
              lastName={player.last_name}
              photoUrl={player.photo_url}
              size="xl"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mf-gph">
              {academy.name}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-mf-gph-ink sm:text-4xl">
              {player.first_name} {player.last_name}
            </h1>
            <p className="mt-2 text-sm text-mf-text-secondary">
              {formatPlayerCategory(player.birth_date)} · {age} años ·{" "}
              {getPositionLabel(player.position)} ·{" "}
              {getDominantFootLabel(player.dominant_foot as "left" | "right" | "both")}
              {player.jersey_number != null ? ` · #${player.jersey_number}` : ""}
            </p>
            {stage ? (
              <p className="mt-3 text-sm font-medium text-mf-gph-ink">
                Etapa {DIAGNOSIS_STAGE_LABELS[stage]}
                {diagnosis.assigned_group ? ` · ${diagnosis.assigned_group}` : ""}
                {diagnosis.session_days ? ` · ${diagnosis.session_days}` : ""}
              </p>
            ) : null}
            {diagnosis.assigned_stage &&
            diagnosis.computed_stage &&
            diagnosis.assigned_stage !== diagnosis.computed_stage ? (
              <p className="mt-1 text-[11px] text-mf-text-muted">
                Promedio sugería {DIAGNOSIS_STAGE_LABELS[diagnosis.computed_stage]}; se asignó
                por contexto.
              </p>
            ) : null}
            <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-mf-text-muted">
              Evaluó {diagnosis.evaluator_name}
              {diagnosis.venue ? ` · ${diagnosis.venue}` : ""}
            </p>
          </div>
          <DiagnosisScoreRing score={diagnosis.global_score} tone="gph" />
        </div>

        {focus ? (
          <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-mf-gph/25 bg-white px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                Foco del ciclo
              </p>
              <p className="mt-1 text-lg font-semibold text-mf-gph-ink">{focus.label}</p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-mf-gph">
              {focus.score}/5
            </p>
          </div>
        ) : null}
      </section>

      {brief?.family ? (
        <section className="border-b border-mf-gph-muted bg-mf-gph-soft px-5 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            Para la familia
          </p>
          <p className="mt-2 text-sm leading-7 text-mf-gph-ink sm:text-[15px]">{brief.family}</p>
        </section>
      ) : null}

      <section className="px-5 py-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Perfil ponderado
        </p>
        <div className="mt-4 space-y-4">
          {DIAGNOSIS_DOMAINS.map((domain) => (
            <DomainBar
              key={domain}
              domain={domain}
              value={diagnosis.domain_averages[domain]}
            />
          ))}
        </div>
      </section>

      <section
        className={cn(
          "grid gap-4 border-t border-mf-border-subtle px-5 py-6",
          showSecondaryGaps && "sm:grid-cols-2",
        )}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mf-gph-ink">
            Fortalezas
          </p>
          <ul className="mt-3 space-y-2">
            {strengths.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-mf-border-subtle bg-mf-canvas px-3 py-2.5"
              >
                <span className="text-sm">{item.label}</span>
                <span className="text-sm font-bold tabular-nums text-mf-gph">{item.score}</span>
              </li>
            ))}
          </ul>
        </div>
        {showSecondaryGaps ? (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              Siguiente foco
            </p>
            <ul className="mt-3 space-y-2">
              {remainingGaps.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-mf-gph-soft px-3 py-2.5"
                >
                  <span className="text-sm text-mf-gph-ink">{item.label}</span>
                  <span className="text-sm font-bold tabular-nums text-mf-gph">{item.score}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {brief ? (
        <section className="border-t border-mf-border-subtle px-5 py-6">
          <CoachBriefSection brief={brief} hideFamily />
        </section>
      ) : diagnosis.assignment_notes ? (
        <section className="mx-5 mb-6 rounded-xl bg-mf-canvas px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mf-text-muted">
            Nota de asignación
          </p>
          <p className="mt-1 text-sm text-mf-text-secondary">{diagnosis.assignment_notes}</p>
        </section>
      ) : null}

      <FieldSessionReport session={diagnosis.field_session} module={diagnosis.module} />

      <section className="border-t border-mf-border-subtle px-5 py-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Mapa de indicadores
        </p>
        <p className="mt-1 text-xs text-mf-text-muted">
          Escala 1–5 · {DIAGNOSIS_SCALE.map((s) => `${s.value} ${s.label}`).join(" · ")}
          {diagnosis.flagged.length > 0
            ? " · El marco naranja es prioridad de trabajo, no un puntaje distinto."
            : ""}
        </p>
        <div className="mt-4 space-y-5">
          {groups.map(({ group, items }) =>
            items.length === 0 ? null : (
              <div key={group}>
                <p className="mb-2 text-xs font-semibold text-mf-gph-ink">
                  {DIAGNOSIS_GROUP_LABELS[group]}
                </p>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {items.map((item) => (
                    <IndicatorCell
                      key={item.id}
                      label={item.label}
                      score={diagnosis.scores[item.id] ?? null}
                      flagged={diagnosis.flagged.includes(item.id)}
                    />
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      {priorities.length > 0 ? (
        <section className="border-t border-mf-border-subtle px-5 py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            Prioridades a diciembre
          </p>
          <div className="mt-4 grid gap-3">
            {priorities.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="grid gap-3 rounded-xl border border-mf-gph-muted bg-mf-gph-soft/40 px-4 py-3 sm:grid-cols-[auto_1fr]"
              >
                <span className="text-lg font-semibold tabular-nums text-mf-gph">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-medium text-mf-gph-ink">{item.title}</p>
                  <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                    {item.baseline ? (
                      <div>
                        <dt className="text-[11px] text-mf-text-muted">Línea base</dt>
                        <dd>{item.baseline}</dd>
                      </div>
                    ) : null}
                    {item.december_goal ? (
                      <div>
                        <dt className="text-[11px] text-mf-text-muted">Meta diciembre</dt>
                        <dd>{item.december_goal}</dd>
                      </div>
                    ) : null}
                    {item.progress_indicator ? (
                      <div>
                        <dt className="text-[11px] text-mf-text-muted">Indicador de avance</dt>
                        <dd>{item.progress_indicator}</dd>
                      </div>
                    ) : null}
                    {item.main_action ? (
                      <div className="sm:col-span-2">
                        <dt className="text-[11px] text-mf-text-muted">Acción</dt>
                        <dd>{item.main_action}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {hasPlan ? (
        <section className="border-t border-mf-border-subtle px-5 py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            Ruta septiembre–diciembre
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DIAGNOSIS_MONTHS.map((month, index) => {
              const plan = diagnosis.monthly_plan[month];
              const meta = DIAGNOSIS_MONTH_META[month];
              return (
                <div
                  key={month}
                  className={cn(
                    "rounded-xl border px-3 py-3",
                    index === 0
                      ? "border-mf-gph/30 bg-mf-gph-soft"
                      : "border-transparent bg-mf-canvas",
                  )}
                >
                  <p className="text-xs font-semibold text-mf-gph">{meta.label}</p>
                  <p className="mt-0.5 text-[11px] text-mf-text-muted">{meta.focus}</p>
                  {plan.objective ? (
                    <p className="mt-2 text-sm font-medium text-mf-gph-ink">{plan.objective}</p>
                  ) : null}
                  {plan.actions ? (
                    <p className="mt-1 text-xs text-mf-text-secondary">{plan.actions}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {hasContext ? (
        <section className="border-t border-mf-border-subtle px-5 py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mf-text-muted">
            Contexto
          </p>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            {diagnosis.field_session.currentClub ? (
              <div>
                <dt className="text-[11px] text-mf-text-muted">Equipo / escuela actual</dt>
                <dd className="mt-0.5">{diagnosis.field_session.currentClub}</dd>
              </div>
            ) : null}
            {diagnosis.years_experience != null ? (
              <div>
                <dt className="text-[11px] text-mf-text-muted">Años de experiencia</dt>
                <dd className="mt-0.5">{diagnosis.years_experience}</dd>
              </div>
            ) : null}
            {diagnosis.sessions_per_week != null ? (
              <div>
                <dt className="text-[11px] text-mf-text-muted">Sesiones por semana</dt>
                <dd className="mt-0.5">{diagnosis.sessions_per_week}</dd>
              </div>
            ) : null}
            {diagnosis.session_days ? (
              <div>
                <dt className="text-[11px] text-mf-text-muted">Días</dt>
                <dd className="mt-0.5">{diagnosis.session_days}</dd>
              </div>
            ) : null}
            {diagnosis.player_goal ? (
              <div>
                <dt className="text-[11px] text-mf-text-muted">Objetivo del jugador</dt>
                <dd className="mt-0.5">{diagnosis.player_goal}</dd>
              </div>
            ) : null}
            {showFamilyGoal ? (
              <div>
                <dt className="text-[11px] text-mf-text-muted">Objetivo de la familia</dt>
                <dd className="mt-0.5">{diagnosis.family_goal}</dd>
              </div>
            ) : null}
            {diagnosis.why_join ? (
              <div className="sm:col-span-2">
                <dt className="text-[11px] text-mf-text-muted">Motivo de ingreso</dt>
                <dd className="mt-0.5">{diagnosis.why_join}</dd>
              </div>
            ) : null}
            {diagnosis.injuries ? (
              <div>
                <dt className="text-[11px] text-mf-text-muted">Lesiones / restricciones</dt>
                <dd className="mt-0.5">{diagnosis.injuries}</dd>
              </div>
            ) : null}
            {diagnosis.medical_notes ? (
              <div>
                <dt className="text-[11px] text-mf-text-muted">Antecedentes</dt>
                <dd className="mt-0.5">{diagnosis.medical_notes}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      <footer className="border-t border-mf-border-subtle bg-mf-canvas px-5 py-4 text-[11px] leading-relaxed text-mf-text-muted">
        <p className="font-medium text-mf-text-secondary">{GPH_ALLIANCE.methodology}</p>
        <p className="mt-1.5">{GPH_ALLIANCE.reportDisclaimer}</p>
        <p className="mt-1.5">
          Nutrición y hábitos se reportan aparte; no se integran como una sola calificación
          futbolística.
        </p>
        {diagnosis.field_session.closing?.feedbackDate ? (
          <p className="mt-1.5">
            Retroalimentación: {formatDiagnosisDate(diagnosis.field_session.closing.feedbackDate)}
          </p>
        ) : null}
        <div className="mt-6 hidden grid-cols-2 gap-8 print:grid">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">
              Firma del evaluador
            </p>
            <div className="mt-10 border-t border-mf-border-subtle pt-2">
              {diagnosis.evaluator_name}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">
              Enterado padre, madre o tutor
            </p>
            <div className="mt-10 border-t border-mf-border-subtle pt-2">Nombre y firma</div>
          </div>
        </div>
      </footer>
    </article>
  );
}
