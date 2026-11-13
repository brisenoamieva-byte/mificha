"use client";

import { MessageCircle, Trophy } from "lucide-react";
import { useMemo } from "react";
import {
  formatMatchDate,
  getMatchResultLabel,
} from "@/lib/match-utils";
import { buildLastMatchShareText } from "@/lib/player-mode";
import type { TutorLastMatchHighlight } from "@/lib/tutor-linked-performance";
import { cn } from "@/lib/utils";

export function PlayerModeLastMatch({
  playerName,
  publicCode,
  lastMatch,
  shareHref,
  absoluteShareUrl,
  linked,
  className,
}: {
  playerName: string;
  publicCode?: string | null;
  lastMatch: TutorLastMatchHighlight | null;
  shareHref?: string | null;
  absoluteShareUrl?: string | null;
  /** Si ya hay vínculo con academia pero aún no hay partido. */
  linked?: boolean;
  className?: string;
}) {
  const resolvedUrl = useMemo(() => {
    if (absoluteShareUrl) return absoluteShareUrl;
    if (!shareHref) return "";
    if (typeof window === "undefined") return shareHref;
    try {
      return new URL(shareHref, window.location.origin).toString();
    } catch {
      return shareHref;
    }
  }, [absoluteShareUrl, shareHref]);

  const whatsappHref = useMemo(() => {
    if (!lastMatch || !resolvedUrl) return null;
    const text = buildLastMatchShareText({
      playerName,
      publicCode,
      lastMatch,
      url: resolvedUrl,
    });
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [lastMatch, playerName, publicCode, resolvedUrl]);

  if (!lastMatch) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-dashed border-mf-border bg-white px-4 py-4 sm:px-5",
          className,
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Este partido
        </p>
        <p className="mt-2 text-sm font-semibold text-mf-gph-ink">
          {linked
            ? "Aún no hay jornada con tus minutos"
            : "Cuando tu academia registre un partido, aquí aparece tu carta"}
        </p>
        <p className="mt-1 text-xs leading-5 text-mf-text-muted">
          {linked
            ? "Pide al entrenador que capture el acta: minutos, goles y asistencias se encienden solos."
            : "Con el código MF tu plantel y tu carta son la misma persona."}
        </p>
      </section>
    );
  }

  const score =
    lastMatch.goalsFor != null && lastMatch.goalsAgainst != null
      ? `${lastMatch.goalsFor} – ${lastMatch.goalsAgainst}`
      : null;
  const resultLabel = getMatchResultLabel(lastMatch.result);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-mf-gph/25 bg-gradient-to-br from-mf-gph-soft via-white to-white shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            <Trophy className="h-3.5 w-3.5" />
            Este partido
          </p>
          <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-mf-gph-ink">
            vs {lastMatch.opponent}
          </h2>
          <p className="mt-1 text-sm text-mf-text-secondary">
            {formatMatchDate(lastMatch.matchDate)}
            {score ? ` · ${score}` : ""}
            {lastMatch.result ? ` · ${resultLabel}` : ""}
          </p>
        </div>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-mf-accent-dark px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#047857]"
          >
            <MessageCircle className="h-4 w-4" />
            Compartir jornada
          </a>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-px border-t border-mf-gph/15 bg-mf-gph/10">
        {(
          [
            ["Minutos", lastMatch.minutes],
            ["Goles", lastMatch.goals],
            ["Asistencias", lastMatch.assists],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="bg-white/90 px-3 py-3 text-center sm:px-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-mf-text-muted">
              {label}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-mf-gph-ink">
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
