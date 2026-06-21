import Image from "next/image";
import {
  BadgeCheck,
  FileText,
  MapPin,
  Printer,
  Share2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { PositionFieldMark } from "@/components/ui/position-field-mark";
import { ProfileRadarChart } from "@/components/ui/profile-radar-chart";
import { PassportScoreDisplay } from "@/components/ui/passport-score-display";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { DEMO_FICHA_PREVIEW } from "@/lib/demo-ficha-preview";
import {
  buildVerifiedRadarSeries,
  TRAIT_LABELS,
  VERIFIED_RADAR_LABELS,
} from "@/lib/player-visual-profile";
import type { PlayerSeasonStat } from "@/types/database";

const demo = DEMO_FICHA_PREVIEW;

const demoSeasonStats = {
  total_matches: demo.stats.matches,
  total_goals: demo.stats.goals,
  total_assists: demo.stats.assists,
  total_minutes: demo.stats.minutes,
  total_yellow_cards: demo.stats.yellowCards,
  total_red_cards: demo.stats.redCards,
} as PlayerSeasonStat;

function TraitBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="font-medium text-mf-text-secondary">{label}</span>
        <span className="font-semibold tabular-nums text-mf-brand">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#1B4F8C]"
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-mf-border-subtle bg-mf-canvas px-2.5 py-2.5 text-center">
      <p className="text-lg font-semibold tabular-nums leading-none text-mf-text">{value}</p>
      <p className="mt-1 text-[10px] font-medium text-mf-text-muted">{label}</p>
    </div>
  );
}

export function HomeFichaPreview() {
  const verifiedSeries = buildVerifiedRadarSeries(demoSeasonStats);

  return (
    <div className="relative mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-none">
      <article
        id="demo-ficha-documento"
        className="demo-ficha-document overflow-hidden rounded-2xl border border-mf-border bg-mf-surface shadow-[0_24px_48px_-20px_rgba(15,45,82,0.28)]"
      >
        {/* Encabezado tipo documento */}
        <header className="relative bg-gradient-to-br from-mf-brand to-mf-brand-dark px-5 pb-5 pt-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
                Ficha verificada
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight">{demo.fullName}</p>
              <p className="mt-1 text-sm text-white/80">
                {demo.positionLabel} · {demo.category} · {demo.academy}
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-white/60">
                <MapPin className="h-3 w-3" />
                {demo.city}
              </p>
            </div>
            <BrandWordmark className="text-sm text-white" />
          </div>

          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="relative h-[96px] w-[96px] overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-lg ring-4 ring-mf-brand/20">
              <Image
                src={demo.photoSrc}
                alt={demo.fullName}
                fill
                className="object-cover"
                style={{ objectPosition: "55% 35%" }}
                sizes="96px"
              />
            </div>
          </div>
        </header>

        <div className="px-5 pb-5 pt-16">
          {/* Passport */}
          <div className="rounded-xl border border-mf-border-subtle bg-white p-4 shadow-sm">
            <PassportScoreDisplay
              score={demo.passportScore}
              variant="hero"
              scoreLabel="Progreso verificado"
            />
          </div>

          {/* Stats del acta */}
          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-mf-text-muted">
              Temporada · acta oficial
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              <StatCell label="Partidos" value={demo.stats.matches} />
              <StatCell label="Goles" value={demo.stats.goals} />
              <StatCell label="Asist." value={demo.stats.assists} />
              <StatCell label="Minutos" value={demo.stats.minutes} />
            </div>
          </div>

          {/* Última jornada */}
          <div className="mt-4 rounded-xl border border-mf-border-subtle bg-mf-canvas px-4 py-3">
            <div className="flex items-start gap-2.5">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-mf-brand" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-mf-text-muted">
                  Última jornada
                </p>
                <p className="mt-0.5 text-sm font-semibold text-mf-text">
                  vs {demo.lastMatch.opponent} · {demo.lastMatch.score}
                </p>
                <p className="mt-0.5 text-xs text-mf-text-secondary">{demo.lastMatch.detail}</p>
              </div>
            </div>
          </div>

          {/* Participación + campo */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-mf-text-muted">
                Participación
              </p>
              <div className="mt-2 space-y-1.5">
                {[
                  { label: "Titular (45+ min)", value: demo.participation.starts },
                  { label: "Suplente", value: demo.participation.subs },
                  { label: "Sin minutos", value: demo.participation.noMinutes },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg bg-mf-canvas px-2.5 py-1.5 text-xs"
                  >
                    <span className="text-mf-text-secondary">{item.label}</span>
                    <span className="font-semibold tabular-nums text-mf-text">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-mf-text-muted">
                Posiciones
              </p>
              <PositionFieldMark
                primary={demo.position}
                secondary={demo.secondaryPosition}
                compact
                className="mt-1"
              />
            </div>
          </div>

          {/* Perfil visual — dos capas */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                Del acta oficial
              </p>
              <ProfileRadarChart
                axes={VERIFIED_RADAR_LABELS}
                series={[verifiedSeries]}
                size={160}
                className="mt-2"
              />
            </div>
            <div className="rounded-xl border border-mf-brand/15 bg-[#1B4F8C]/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-mf-brand">
                Evaluación academia
              </p>
              <div className="mt-3 space-y-2.5">
                <TraitBar label={TRAIT_LABELS.technical} value={demo.traits.technical} />
                <TraitBar label={TRAIT_LABELS.tactical} value={demo.traits.tactical} />
                <TraitBar label={TRAIT_LABELS.physical} value={demo.traits.physical} />
                <TraitBar label={TRAIT_LABELS.attitude} value={demo.traits.attitude} />
              </div>
            </div>
          </div>

          {/* Observaciones + tags */}
          <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-900">
              Observaciones del entrenador
            </p>
            <p className="mt-2 text-xs leading-6 text-amber-950">{demo.coachNotes}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {demo.traitTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-amber-900 ring-1 ring-amber-200/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Insignias */}
          <div className="mt-4 flex flex-wrap gap-2">
            {demo.achievements.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-800 ring-1 ring-violet-200/80"
              >
                <Sparkles className="h-3 w-3" />
                {item}
              </span>
            ))}
          </div>

          {/* Pie de documento */}
          <footer className="mt-5 border-t border-mf-border-subtle pt-4">
            <div className="flex flex-wrap gap-2">
              <span className="mf-badge-accent text-[10px]">
                <BadgeCheck className="h-3 w-3" />
                {demo.badges[0]}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-800 ring-1 ring-sky-200/80">
                <TrendingUp className="h-3 w-3" />
                {demo.badges[1]}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-mf-text-muted">
              <span className="font-medium text-mf-brand">{demo.publicUrl}</span>
              <span className="inline-flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Share2 className="h-3 w-3" />
                  WhatsApp / link
                </span>
                <span className="inline-flex items-center gap-1">
                  <Printer className="h-3 w-3" />
                  Imprimible
                </span>
              </span>
            </div>
          </footer>
        </div>
      </article>

      <p className="mt-3 text-center text-[11px] leading-5 text-mf-text-muted lg:text-left">
        Ejemplo de ficha completa · stats del acta + perfil visual del entrenador · lista para
        compartir o imprimir
      </p>
    </div>
  );
}
