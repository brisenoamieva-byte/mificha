import Link from "next/link";
import { Award, ExternalLink, MapPin, Shield, Trophy, Users } from "lucide-react";
import { AcademyScheduleSection } from "@/components/marketing/match-schedule-card";
import { PassportSegments } from "@/components/ui/passport-score-display";
import { BrandLogoLink } from "@/components/ui/brand-logo";
import { getPositionLabel } from "@/lib/dashboard-utils";
import {
  formatWhatsAppUrl,
  type PublicAcademyData,
} from "@/lib/public-academy";
import { getPlayerInitials } from "@/lib/player-utils";

interface AcademyLandingProps {
  data: PublicAcademyData;
}

function StatBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-center backdrop-blur-sm">
      <p className="text-4xl font-black tracking-tight text-white sm:text-5xl">
        {value}
      </p>
      <p
        className="mt-2 text-xs font-bold uppercase tracking-[0.2em]"
        style={{ color: accent }}
      >
        {label}
      </p>
    </div>
  );
}

export function AcademyLanding({ data }: AcademyLandingProps) {
  const { academy, stats, featuredPlayers, upcomingMatches } = data;
  const accent = academy.primary_color || "#1B4F8C";
  const location = [academy.city, academy.state].filter(Boolean).join(", ");
  const whatsappUrl = formatWhatsAppUrl(academy.phone);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, #0a0f1a 55%)`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_40%)]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-10 sm:pt-14">
          <BrandLogoLink variant="onDark" size="sm" className="mb-10" />
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              {academy.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={academy.logo_url}
                  alt={academy.name}
                  className="mb-8 h-24 w-24 rounded-2xl border border-white/20 bg-white/10 object-cover shadow-2xl"
                />
              ) : (
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl font-black shadow-2xl">
                  {academy.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              {academy.is_certified ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-gradient-to-r from-amber-400/20 to-[#1B4F8C]/30 px-4 py-2 text-sm font-bold text-amber-100">
                  <Award className="h-4 w-4 text-amber-300" />
                  Academia Certificada MiFicha
                </span>
              ) : null}

              <h1 className="mt-6 text-5xl font-black uppercase tracking-tight sm:text-7xl">
                {academy.name}
              </h1>

              {location ? (
                <p className="mt-4 inline-flex items-center gap-2 text-lg text-white/80">
                  <MapPin className="h-5 w-5" />
                  {location}
                </p>
              ) : null}

              {academy.description ? (
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
                  {academy.description}
                </p>
              ) : null}
            </div>

            <div className="grid min-w-[280px] grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <StatBlock label="Jugadores" value={stats.totalPlayers} accent="#93c5fd" />
              <StatBlock label="Temporadas" value={stats.totalSeasons} accent="#fcd34d" />
              <StatBlock label="Partidos" value={stats.totalMatches} accent="#86efac" />
            </div>
          </div>
        </div>
      </section>

      <AcademyScheduleSection
        matches={upcomingMatches}
        academyName={academy.name}
        academySlug={academy.slug}
        variant="dark"
      />

      {academy.league_calendar_url?.trim() ? (
        <section className="border-y border-slate-800 bg-slate-950/80">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Liga oficial
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">
                {academy.league_name?.trim() || "Calendario de competición"}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Resultados y clasificación institucionales de tu federación o liga.
              </p>
            </div>
            <a
              href={academy.league_calendar_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-900"
            >
              Ver calendario oficial
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
              Plantel destacado
            </p>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">
              Jugadores MiFicha
            </h2>
          </div>
          <Trophy className="hidden h-10 w-10 text-slate-600 sm:block" />
        </div>

        {featuredPlayers.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-700 bg-slate-900/50 px-8 py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-4 text-lg font-medium text-slate-400">
              Próximamente jugadores destacados.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {featuredPlayers.map((player) => {
              const fullName = `${player.first_name} ${player.last_name}`;

              return (
                <Link
                  key={player.slug}
                  href={`/j/${player.slug}`}
                  className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 transition hover:-translate-y-1 hover:border-slate-600 hover:shadow-2xl hover:shadow-black/40"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-900">
                    {player.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={player.photo_url}
                        alt={fullName}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-5xl font-black text-slate-600">
                        {getPlayerInitials(player.first_name, player.last_name)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-2xl font-black uppercase tracking-tight">
                        {fullName}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-300">
                        <Shield className="h-4 w-4" />
                        {getPositionLabel(player.position)}
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Passport Score
                    </p>
                    <PassportSegments
                      score={player.passport_score}
                      surface="dark"
                      className="mt-3"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:px-10">
          <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
            ¿Quieres que tu hijo entre aquí?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Contáctanos y conoce nuestro proceso de formación con fichas técnicas
            digitales verificadas.
          </p>
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              Escríbenos por WhatsApp
            </a>
          ) : (
            <p className="mt-8 text-sm text-slate-500">
              Contacto disponible próximamente.
            </p>
          )}
        </div>
      </section>

      <footer className="border-t border-slate-800 px-6 py-8 text-center text-sm text-slate-500">
        <BrandLogoLink
          className="justify-center"
          variant="onDark"
          size="sm"
        />
        <p className="mt-2">mificha.mx</p>
      </footer>
    </div>
  );
}
