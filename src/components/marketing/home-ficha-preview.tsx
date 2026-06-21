"use client";

import Image from "next/image";
import { BadgeCheck, Printer, ShieldCheck } from "lucide-react";
import QRCode from "react-qr-code";
import { FichaCoachBlock } from "@/components/ficha/ficha-coach-block";
import { FichaSeasonBlock } from "@/components/ficha/ficha-season-block";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { DEMO_FICHA_PREVIEW } from "@/lib/demo-ficha-preview";
import { FICHA_COPY, computeSeasonSummary } from "@/lib/ficha-content";
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

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
      {children}
    </p>
  );
}

export function HomeFichaPreview() {
  const summary = computeSeasonSummary(demoSeasonStats);
  const publicUrl = `https://${demo.publicUrl}`;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="demo-ficha-shell relative mx-auto w-full max-w-[780px] lg:mx-0">
      <article
        id="demo-ficha-documento"
        className="demo-ficha-document overflow-hidden rounded-xl border border-mf-border bg-white shadow-[0_20px_50px_-24px_rgba(15,45,82,0.35)]"
      >
        <header className="flex items-center justify-between gap-3 border-b border-mf-brand-dark/20 bg-mf-brand px-4 py-2.5 text-white sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-white/80" aria-hidden />
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85">
              {FICHA_COPY.documentTitle}
            </p>
            <span className="hidden h-3 w-px bg-white/25 sm:block" aria-hidden />
            <p className="hidden truncate text-[10px] text-white/60 sm:block">{demo.seasonLabel}</p>
          </div>
          <BrandWordmark className="shrink-0 text-xs text-white" />
        </header>

        <div className="demo-ficha-identity grid border-b border-mf-border-subtle sm:grid-cols-[148px_1fr]">
          <div className="relative aspect-[3/4] w-full max-h-[196px] border-b border-mf-border-subtle bg-slate-100 sm:max-h-none sm:border-b-0 sm:border-r">
            <Image
              src={demo.photoSrc}
              alt={`Retrato de ${demo.fullName}`}
              fill
              priority
              className="object-cover"
              style={{ objectPosition: "50% 18%" }}
              sizes="(max-width: 640px) 100vw, 148px"
            />
          </div>

          <div className="flex min-w-0 border-b border-mf-border-subtle sm:border-b-0">
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 px-4 py-4 sm:px-5">
              <div>
                <h3 className="text-xl font-semibold leading-tight tracking-tight text-mf-text sm:text-[1.35rem]">
                  {demo.fullName}
                </h3>
                <p className="mt-1.5 text-sm text-mf-text-secondary">
                  {demo.age} años · {demo.category}
                </p>
                <p className="mt-0.5 text-sm text-mf-text-secondary">
                  {demo.positionLabel}
                  {demo.secondaryLabel ? ` · también ${demo.secondaryLabel.toLowerCase()}` : null}
                </p>
                <p className="mt-0.5 text-sm text-mf-text-secondary">{demo.academy}</p>
                <p className="mt-1 text-xs text-mf-text-muted">
                  {demo.city}
                  {" · "}
                  Dorsal {demo.jerseyNumber}
                  {" · "}
                  {demo.dominantFootLabel}
                  {demo.heightCm ? ` · ${demo.heightCm} cm` : null}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
                  <BadgeCheck className="h-3 w-3" aria-hidden />
                  {FICHA_COPY.verified}
                </span>
                <span className="rounded-md bg-mf-canvas px-2 py-0.5 text-[10px] font-medium text-mf-text-secondary ring-1 ring-mf-border-subtle">
                  {FICHA_COPY.parentalConsent}
                </span>
              </div>
            </div>

            <div className="demo-ficha-academy-logo flex w-[88px] shrink-0 items-center justify-center border-l border-mf-border-subtle bg-white px-2 py-4 sm:w-[104px] sm:px-3">
              <Image
                src={demo.academyLogoSrc}
                alt={`Logo ${demo.academy}`}
                width={80}
                height={80}
                className="h-auto w-full max-w-[76px] object-contain sm:max-w-[84px]"
              />
            </div>
          </div>
        </div>

        <FichaSeasonBlock stats={demoSeasonStats} summary={summary} compact />

        <section className="demo-ficha-context grid border-b border-mf-border-subtle sm:grid-cols-2">
          <div className="border-b border-mf-border-subtle px-4 py-3 sm:border-b-0 sm:border-r sm:px-5">
            <SectionLabel>{FICHA_COPY.lastMatch}</SectionLabel>
            <p className="mt-1.5 text-sm font-semibold text-mf-text">
              vs {demo.lastMatch.opponent} · {demo.lastMatch.score}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-mf-text-secondary">{demo.lastMatch.detail}</p>
          </div>
          <div className="px-4 py-3 sm:px-5">
            <SectionLabel>{FICHA_COPY.role}</SectionLabel>
            <dl className="mt-1.5 space-y-1 text-xs">
              {[
                { term: "Titular (45+ min)", value: demo.participation.starts },
                { term: "Suplente", value: demo.participation.subs },
                { term: "Sin minutos", value: demo.participation.noMinutes },
              ].map((item) => (
                <div key={item.term} className="flex items-center justify-between gap-3">
                  <dt className="text-mf-text-secondary">{item.term}</dt>
                  <dd className="font-semibold tabular-nums text-mf-text">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <FichaCoachBlock
          primary={demo.position}
          secondary={demo.secondaryPosition}
          traits={demo.traits}
          coachNotes={demo.coachNotes}
        />

        {demo.achievements.length > 0 ? (
          <section className="px-4 py-3 sm:px-5">
            <SectionLabel>{FICHA_COPY.insignias}</SectionLabel>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {demo.achievements.map((item) => (
                <span
                  key={item.key}
                  className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900 ring-1 ring-amber-200/80"
                >
                  <span aria-hidden>{item.emoji}</span>
                  {item.title}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <footer className="demo-ficha-footer border-t border-mf-border-subtle bg-mf-canvas px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] leading-4 text-mf-text-muted">
              Ficha compartida con autorización parental.
              <br className="sm:hidden" />
              <span className="font-medium text-mf-brand">{demo.publicUrl}</span>
            </p>
            <div className="demo-ficha-qr hidden items-center gap-3 sm:flex">
              <div className="rounded-md bg-white p-1.5 ring-1 ring-mf-border-subtle">
                <QRCode value={publicUrl} size={52} />
              </div>
              <p className="text-[10px] leading-4 text-mf-text-muted">Escanea para abrir la ficha</p>
            </div>
          </div>
        </footer>
      </article>

      <div className="demo-ficha-actions mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] leading-5 text-mf-text-muted">
          Ejemplo · formato carta · stats del torneo + evaluación del entrenador
        </p>
        <button
          type="button"
          onClick={handlePrint}
          className="demo-ficha-print-btn inline-flex items-center gap-1.5 rounded-lg border border-mf-border bg-white px-3 py-1.5 text-[11px] font-semibold text-mf-brand shadow-sm transition hover:bg-mf-canvas"
        >
          <Printer className="h-3.5 w-3.5" aria-hidden />
          Imprimir ejemplo
        </button>
      </div>
    </div>
  );
}
