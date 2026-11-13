import Link from "next/link";
import {
  Award,
  ExternalLink,
  Globe,
  MapPin,
  Phone,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import { CERTIFIED_ACADEMY_LABEL } from "@/lib/academy-certification";
import { academyMembershipPublicCopy } from "@/lib/academy-membership";
import { AcademyScheduleSection } from "@/components/marketing/match-schedule-card";
import { AcademyPlayerPhoto } from "@/components/public/academy-player-photo";
import { ProgressTierBadge } from "@/components/ui/passport-score-display";
import { BrandLogoLink } from "@/components/ui/brand-logo";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { GphEvaluationBadge } from "@/components/ui/gph-evaluation-badge";
import { getPositionLabel } from "@/lib/dashboard-utils";
import { isDemoAcademySlug } from "@/lib/explore-demo-data";
import {
  formatWhatsAppUrl,
  type PublicAcademyData,
} from "@/lib/public-academy";

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

function Fact({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string | null;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-white hover:underline"
        >
          {value}
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
        </a>
      ) : (
        <p className="mt-1 text-sm font-medium text-white">{value}</p>
      )}
    </div>
  );
}

export function AcademyLanding({ data }: AcademyLandingProps) {
  const { academy, stats, featuredPlayers, upcomingMatches } = data;
  const accent = academy.primary_color || "#1B4F8C";
  const location = [academy.city, academy.state].filter(Boolean).join(", ");
  const whatsappUrl = formatWhatsAppUrl(academy.phone);
  const planCopy = academyMembershipPublicCopy();
  const coverUrl = academy.cover_url?.trim() || null;

  const facts: Array<{ label: string; value: string; href?: string | null }> = [];
  if (location) facts.push({ label: "Ubicación", value: location });
  if (academy.address?.trim()) {
    facts.push({ label: "Dirección", value: academy.address.trim() });
  }
  if (academy.phone?.trim()) {
    facts.push({
      label: "WhatsApp / teléfono",
      value: academy.phone.trim(),
      href: whatsappUrl,
    });
  }
  if (academy.website?.trim()) {
    facts.push({
      label: "Sitio web",
      value: academy.website.replace(/^https?:\/\//, ""),
      href: academy.website.startsWith("http")
        ? academy.website
        : `https://${academy.website}`,
    });
  }
  if (academy.league_name?.trim()) {
    facts.push({
      label: "Liga / torneo",
      value: academy.league_name.trim(),
      href: academy.league_calendar_url,
    });
  }
  facts.push({
    label: "Plan MiFicha",
    value: planCopy.priceLine,
  });

  return (
    <div className="min-h-dvh bg-[#0a0f1a] text-white">
      <section className="relative overflow-hidden">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          />
        ) : null}
        <div
          className={
            coverUrl
              ? "absolute inset-0 bg-gradient-to-b from-black/75 via-black/70 to-[#0a0f1a]"
              : "absolute inset-0"
          }
          style={
            coverUrl
              ? undefined
              : {
                  background: `linear-gradient(135deg, ${accent} 0%, #0a0f1a 55%)`,
                }
          }
        />
        {!coverUrl ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_40%)]" />
        ) : null}

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 mf-page-bottom sm:px-6 sm:pt-14">
          <BrandLogoLink variant="onDark" size="sm" className="mb-10" />
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              {academy.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={academy.logo_url}
                  alt={academy.name}
                  className="mb-8 h-28 w-28 rounded-2xl border border-white/20 bg-white object-contain p-2 shadow-2xl"
                />
              ) : (
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl font-black shadow-2xl">
                  {academy.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              {academy.is_certified ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-gradient-to-r from-amber-400/20 to-[#1B4F8C]/30 px-4 py-2 text-sm font-bold text-amber-100">
                  <Award className="h-4 w-4 text-amber-300" />
                  {CERTIFIED_ACADEMY_LABEL}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80">
                  En proceso de certificación
                </span>
              )}

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
              ) : (
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/55">
                  Academia en MiFicha: plantel, fichas y seguimiento digital.
                </p>
              )}
            </div>

            <div className="grid min-w-[280px] grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <StatBlock label="Jugadores" value={stats.totalPlayers} accent="#93c5fd" />
              <StatBlock label="Temporadas" value={stats.totalSeasons} accent="#fcd34d" />
              <StatBlock label="Partidos" value={stats.totalMatches} accent="#86efac" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-950/90">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
            Ficha de la academia
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Datos básicos
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((fact) => (
              <Fact key={fact.label} {...fact} />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white"
                style={{ backgroundColor: accent }}
              >
                <Phone className="h-4 w-4" />
                Contactar
              </a>
            ) : null}
            {academy.website?.trim() ? (
              <a
                href={
                  academy.website.startsWith("http")
                    ? academy.website
                    : `https://${academy.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-900"
              >
                <Globe className="h-4 w-4" />
                Sitio web
              </a>
            ) : null}
            <Link
              href="/fut/signup"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-900"
            >
              Registrar mi academia
            </Link>
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
              Jugadores <BrandWordmark className="text-white" />
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
              const playerHref = isDemoAcademySlug(academy.slug)
                ? "/#demo-ficha-documento"
                : `/fut/j/${player.slug}`;

              return (
                <Link
                  key={player.slug}
                  href={playerHref}
                  className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 transition hover:-translate-y-1 hover:border-slate-600 hover:shadow-2xl hover:shadow-black/40"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-900">
                    <AcademyPlayerPhoto
                      photoUrl={player.photo_url}
                      firstName={player.first_name}
                      lastName={player.last_name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    {player.has_gph_evaluation ? (
                      <div className="absolute right-3 top-3">
                        <GphEvaluationBadge variant="solid" asSpan />
                      </div>
                    ) : null}
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
                      Progreso de ficha
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <ProgressTierBadge
                        score={player.passport_score}
                        surface="dark"
                        className="text-xs"
                      />
                      <span className="text-xs text-slate-400">Stats verificadas</span>
                    </div>
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
        <BrandLogoLink className="justify-center" variant="onDark" size="sm" />
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
          <Link href="/fut/explorar" className="text-slate-400 transition hover:text-white">
            Explorar directorio
          </Link>
          <Link href="/fut/tutor" className="text-slate-400 transition hover:text-white">
            Crear cuenta de tutor
          </Link>
        </div>
        <p className="mt-2">mificha.mx</p>
      </footer>
    </div>
  );
}
