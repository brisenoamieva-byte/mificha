"use client";

import Image from "next/image";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import QRCode from "react-qr-code";
import { FichaCoachBlock, hasFichaCoachContent } from "@/components/ficha/ficha-coach-block";
import { FichaSeasonBlock } from "@/components/ficha/ficha-season-block";
import { GphEvaluationBadge } from "@/components/ui/gph-evaluation-badge";
import { PlayerPortraitImage } from "@/components/ui/player-portrait-image";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { FICHA_COPY, computeSeasonSummary } from "@/lib/ficha-content";
import type { FichaDocumentModel } from "@/lib/ficha-document-model";
import { cn } from "@/lib/utils";

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
      {children}
    </p>
  );
}

interface FichaDocumentProps {
  model: FichaDocumentModel;
  className?: string;
  priorityPhoto?: boolean;
  /** Versión recortada para hero de marketing — menos altura, sin evaluación ni footer. */
  variant?: "full" | "hero";
}

export function FichaDocument({
  model,
  className,
  priorityPhoto = false,
  variant = "full",
}: FichaDocumentProps) {
  const isHero = variant === "hero";
  const summary = computeSeasonSummary(model.seasonStats);
  const showCoach = hasFichaCoachContent({
    position: model.coach.primary,
    secondary_position: model.coach.secondary ?? null,
    coach_notes: model.coach.notes ?? null,
    trait_technical: model.coach.traits.technical,
    trait_tactical: model.coach.traits.tactical,
    trait_physical: model.coach.traits.physical,
    trait_attitude: model.coach.traits.attitude,
  });

  const showSeason =
    (model.seasonStats?.total_matches ?? 0) > 0 || (model.seasonStats?.total_minutes ?? 0) > 0;

  return (
    <article
      id={model.documentId}
      className={cn(
        "demo-ficha-document min-w-0 overflow-hidden rounded-xl border border-mf-border bg-white shadow-[0_20px_50px_-24px_rgba(15,45,82,0.35)]",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-mf-brand-dark/20 bg-mf-brand px-4 py-2.5 text-white sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-white/80" aria-hidden />
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85">
            {FICHA_COPY.documentTitle}
          </p>
          <span className="hidden h-3 w-px bg-white/25 sm:block" aria-hidden />
          <p className="hidden truncate text-[10px] text-white/60 sm:block">
            {model.seasonLabel}
          </p>
        </div>
        <BrandWordmark className="shrink-0 text-xs text-white" />
      </header>

      <div className="demo-ficha-identity grid grid-cols-[96px_minmax(0,1fr)] border-b border-mf-border-subtle sm:grid-cols-[148px_minmax(0,1fr)_auto]">
        <div className="relative row-span-2 aspect-[3/4] w-full max-h-[128px] overflow-hidden border-r border-mf-border-subtle bg-slate-100 sm:row-span-2 sm:max-h-none">
          {model.photoSrc ? (
            model.photoIsLocal ? (
              <Image
                src={model.photoSrc}
                alt={`Retrato de ${model.fullName}`}
                fill
                priority={priorityPhoto}
                className="object-cover"
                style={{ objectPosition: "50% 18%" }}
                sizes="(max-width: 640px) 96px, 148px"
              />
            ) : (
              <PlayerPortraitImage
                src={model.photoSrc}
                alt={`Retrato de ${model.fullName}`}
                className="object-cover"
                objectPosition="50% 18%"
                sizes="(max-width: 640px) 96px, 148px"
                priority={priorityPhoto}
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-base font-semibold text-mf-text-muted">
              {model.fullName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
          )}
        </div>

        <div className="relative col-start-2 row-start-1 min-w-0 px-3 pt-3 sm:px-5 sm:py-4">
          {model.academyLogoUrl ? (
            <div className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-md bg-white p-1 ring-1 ring-mf-border-subtle sm:hidden">
              {model.academyLogoUrl.startsWith("/") ? (
                <Image
                  src={model.academyLogoUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={model.academyLogoUrl}
                  alt=""
                  className="h-full w-full object-contain"
                />
              )}
            </div>
          ) : null}

          <div className={cn(model.academyLogoUrl && "pr-12 sm:pr-0")}>
            <h1 className="text-lg font-semibold leading-tight tracking-tight text-mf-text sm:text-[1.35rem]">
              {model.fullName}
            </h1>
            <p className="mt-1 text-sm text-mf-text-secondary">
              {model.age} años · {model.categoryLabel}
            </p>
            <p className="mt-0.5 text-sm text-mf-text-secondary">
              {model.positionLabel}
              {model.secondaryPositionLabel
                ? ` · también ${model.secondaryPositionLabel.toLowerCase()}`
                : null}
            </p>
            <p className="mt-0.5 text-sm text-mf-text-secondary">{model.academyName}</p>
            {model.metaLine ? (
              <p className="mt-1 text-xs text-mf-text-muted">{model.metaLine}</p>
            ) : null}
          </div>
        </div>

        <div className="col-start-2 row-start-2 flex flex-wrap gap-1.5 self-end px-3 pb-3 sm:px-5 sm:pb-4">
          {model.showVerified ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
              <BadgeCheck className="h-3 w-3" aria-hidden />
              {FICHA_COPY.verified}
            </span>
          ) : null}
          {model.showConsent ? (
            <span className="rounded-md bg-mf-canvas px-2 py-0.5 text-[10px] font-medium text-mf-text-secondary ring-1 ring-mf-border-subtle">
              {FICHA_COPY.parentalConsent}
            </span>
          ) : null}
          {model.showGph ? (
            <GphEvaluationBadge href={model.gphHref ?? undefined} />
          ) : null}
          {model.isDemo ? (
            <span className="rounded-md bg-mf-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mf-brand">
              Ejemplo
            </span>
          ) : null}
        </div>

        {model.academyLogoUrl ? (
          <div className="demo-ficha-academy-logo col-start-3 row-span-2 row-start-1 hidden w-[88px] shrink-0 items-center justify-center border-l border-mf-border-subtle bg-white px-2 py-4 sm:flex sm:w-[104px] sm:px-3">
            {model.academyLogoUrl.startsWith("/") ? (
              <Image
                src={model.academyLogoUrl}
                alt={`Logo ${model.academyName}`}
                width={80}
                height={80}
                className="h-auto w-full max-w-[76px] object-contain sm:max-w-[84px]"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={model.academyLogoUrl}
                alt={`Logo ${model.academyName}`}
                className="h-auto w-full max-w-[76px] object-contain sm:max-w-[84px]"
              />
            )}
          </div>
        ) : null}
      </div>

      {showSeason ? <FichaSeasonBlock stats={model.seasonStats} summary={summary} compact /> : null}

      {model.lastMatch || (!isHero && model.participation) ? (
        <section
          className={cn(
            "demo-ficha-context grid border-mf-border-subtle sm:grid-cols-2",
            !isHero && "border-b",
          )}
        >
          {model.lastMatch ? (
            <div
              className={cn(
                "px-4 py-3 sm:px-5",
                !isHero && "border-b border-mf-border-subtle sm:border-b-0 sm:border-r",
              )}
            >
              <SectionLabel>{FICHA_COPY.lastMatch}</SectionLabel>
              <p className="mt-1.5 text-sm font-semibold text-mf-text">
                {model.lastMatch.headline}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-mf-text-secondary">
                {model.lastMatch.detail}
              </p>
            </div>
          ) : (
            <div className="hidden sm:block" />
          )}

          {!isHero && model.participation ? (
            <div className="px-4 py-3 sm:px-5">
              <SectionLabel>{FICHA_COPY.role}</SectionLabel>
              <dl className="mt-1.5 space-y-1 text-xs">
                {[
                  { term: "Titular (45+ min)", value: model.participation.starts },
                  { term: "Suplente", value: model.participation.subs },
                  { term: "Sin minutos", value: model.participation.noMinutes },
                ].map((item) => (
                  <div key={item.term} className="flex items-center justify-between gap-3">
                    <dt className="text-mf-text-secondary">{item.term}</dt>
                    <dd className="font-semibold tabular-nums text-mf-text">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </section>
      ) : null}

      {showCoach && !isHero ? (
        <FichaCoachBlock
          primary={model.coach.primary}
          secondary={model.coach.secondary}
          traits={model.coach.traits}
          coachNotes={model.coach.notes}
        />
      ) : null}

      {!isHero && model.achievements.length > 0 ? (
        <section className="px-4 py-3 sm:px-5">
          <SectionLabel>{FICHA_COPY.insignias}</SectionLabel>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {model.achievements.map((item) => (
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

      {!isHero ? (
        <footer className="demo-ficha-footer border-t border-mf-border-subtle bg-mf-canvas px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] leading-4 text-mf-text-muted">
              Ficha compartida con autorización parental.
              <br className="sm:hidden" />
              <span className="break-all font-medium text-mf-brand">{model.publicUrlDisplay}</span>
            </p>
            <div className="demo-ficha-qr hidden items-center gap-3 sm:flex">
              <div className="rounded-md bg-white p-1.5 ring-1 ring-mf-border-subtle">
                <QRCode value={model.publicUrlQr} size={52} />
              </div>
              <p className="text-[10px] leading-4 text-mf-text-muted">Escanea para abrir la ficha</p>
            </div>
          </div>
        </footer>
      ) : null}
    </article>
  );
}
