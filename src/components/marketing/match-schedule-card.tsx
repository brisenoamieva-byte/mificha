import Link from "next/link";
import { Calendar, Clock, MapPin, Navigation } from "lucide-react";
import {
  buildVenueMapsUrl,
  formatKickoffDateTime,
  getMatchStatusLabel,
} from "@/lib/match-utils";
import type { Match } from "@/types/database";

interface MatchScheduleCardProps {
  match: Pick<
    Match,
    | "id"
    | "opponent"
    | "match_date"
    | "kickoff_at"
    | "venue_name"
    | "venue_address"
    | "category"
    | "notes"
    | "status"
  >;
  academyName?: string;
  academyHref?: string;
  showCaptureLink?: boolean;
  variant?: "dark" | "light";
}

export function MatchScheduleCard({
  match,
  academyName,
  academyHref,
  showCaptureLink,
  variant = "light",
}: MatchScheduleCardProps) {
  const mapsUrl = buildVenueMapsUrl(match.venue_name, match.venue_address);
  const isDark = variant === "dark";

  return (
    <article
      className={
        isDark
          ? "rounded-2xl border border-slate-800 bg-slate-950 p-5"
          : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {academyName && academyHref ? (
            <Link
              href={academyHref}
              className={
                isDark
                  ? "text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-white"
                  : "text-xs font-semibold uppercase tracking-wide text-[#1B4F8C] hover:underline"
              }
            >
              {academyName}
            </Link>
          ) : null}
          <h3
            className={
              isDark
                ? "mt-1 text-lg font-bold text-white"
                : "text-lg font-bold text-slate-900"
            }
          >
            vs {match.opponent}
          </h3>
          {match.category ? (
            <p className={isDark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-500"}>
              {match.category}
            </p>
          ) : null}
        </div>
        <span
          className={
            isDark
              ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300"
              : "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
          }
        >
          {getMatchStatusLabel(match.status)}
        </span>
      </div>

      <dl className="mt-4 space-y-3">
        <div className="flex items-start gap-3">
          <Calendar className={isDark ? "mt-0.5 h-4 w-4 text-slate-500" : "mt-0.5 h-4 w-4 text-[#1B4F8C]"} />
          <dd className={isDark ? "text-sm text-slate-200" : "text-sm text-slate-700"}>
            {formatKickoffDateTime(match.kickoff_at, match.match_date)}
          </dd>
        </div>

        {match.venue_name ? (
          <div className="flex items-start gap-3">
            <MapPin className={isDark ? "mt-0.5 h-4 w-4 text-slate-500" : "mt-0.5 h-4 w-4 text-[#1B4F8C]"} />
            <dd className={isDark ? "text-sm text-slate-200" : "text-sm text-slate-700"}>
              <span className="font-medium">{match.venue_name}</span>
              {match.venue_address ? (
                <span className="block text-slate-500">{match.venue_address}</span>
              ) : null}
            </dd>
          </div>
        ) : null}

        {match.notes ? (
          <div className="flex items-start gap-3">
            <Clock className={isDark ? "mt-0.5 h-4 w-4 text-slate-500" : "mt-0.5 h-4 w-4 text-[#1B4F8C]"} />
            <dd className={isDark ? "text-sm text-slate-400" : "text-sm text-slate-600"}>
              {match.notes}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-4 flex flex-wrap gap-3">
        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={
              isDark
                ? "inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
                : "inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            }
          >
            <Navigation className="h-4 w-4" />
            Cómo llegar
          </a>
        ) : null}

        {showCaptureLink ? (
          <Link
            href={`/dashboard/partidos/nuevo?matchId=${match.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-[#1B4F8C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#164278]"
          >
            Registrar resultado
          </Link>
        ) : null}
      </div>
    </article>
  );
}

interface AcademyScheduleSectionProps {
  matches: MatchScheduleCardProps["match"][];
  academyName?: string;
  academySlug?: string;
  variant?: "dark" | "light";
}

export function AcademyScheduleSection({
  matches,
  academyName,
  academySlug,
  variant = "dark",
}: AcademyScheduleSectionProps) {
  if (matches.length === 0) return null;

  const isDark = variant === "dark";
  const academyHref = academySlug ? `/a/${academySlug}` : undefined;

  return (
    <section className={isDark ? "mx-auto max-w-6xl px-6 py-16 sm:px-10" : ""}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p
            className={
              isDark
                ? "text-sm font-bold uppercase tracking-[0.24em] text-slate-400"
                : "mf-marketing-eyebrow"
            }
          >
            Calendario
          </p>
          <h2
            className={
              isDark
                ? "mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl"
                : "mt-2 text-2xl font-semibold tracking-tight text-mf-text"
            }
          >
            Próximos partidos
          </h2>
        </div>
        <Calendar className={isDark ? "hidden h-10 w-10 text-slate-600 sm:block" : "hidden h-8 w-8 text-mf-brand sm:block"} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {matches.map((match) => (
          <MatchScheduleCard
            key={match.id}
            match={match}
            academyName={academyName}
            academyHref={academyHref}
            variant={variant}
          />
        ))}
      </div>
    </section>
  );
}
