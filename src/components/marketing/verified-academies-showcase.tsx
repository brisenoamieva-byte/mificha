import Link from "next/link";
import { ArrowRight, Award, Building2, ShieldCheck, Users } from "lucide-react";
import {
  formatShowcaseLocation,
  getShowcaseStats,
  prepareShowcaseAcademies,
  type ShowcaseAcademy,
} from "@/lib/participating-academies";
import type { DirectoryAcademy } from "@/lib/public-directory";
import { cn } from "@/lib/utils";

interface VerifiedAcademiesShowcaseProps {
  academies: DirectoryAcademy[];
  playerCount?: number;
  variant?: "feature" | "marquee";
  className?: string;
}

function AcademyLogoMark({
  academy,
  size = "md",
  showName = false,
}: {
  academy: ShowcaseAcademy;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}) {
  const sizeClasses = {
    sm: "h-14 w-14 rounded-xl",
    md: "h-[4.5rem] w-[4.5rem] rounded-2xl",
    lg: "h-20 w-20 rounded-2xl",
  }[size];

  const initials = academy.name.slice(0, 2).toUpperCase();
  const location = formatShowcaseLocation(academy);

  return (
    <div className="group/logo flex shrink-0 flex-col items-center gap-3">
      <div className="relative">
        {academy.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={academy.logo_url}
            alt={academy.name}
            className={cn(
              sizeClasses,
              "border border-white/80 bg-white object-cover shadow-[0_8px_24px_rgba(15,45,82,0.12)] ring-1 ring-black/[0.04] transition duration-300 group-hover/logo:scale-[1.04] group-hover/logo:shadow-[0_12px_32px_rgba(15,45,82,0.18)]",
            )}
          />
        ) : (
          <div
            className={cn(
              sizeClasses,
              "flex items-center justify-center border border-white/20 bg-gradient-to-br from-mf-brand to-mf-brand-dark text-sm font-bold text-white shadow-lg",
            )}
          >
            {initials}
          </div>
        )}

        {academy.is_certified ? (
          <span
            className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0f2d52] bg-amber-400 text-[#0f2d52] shadow-md"
            title="Academia certificada MiFicha"
          >
            <Award className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span
            className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0f2d52] bg-mf-accent text-[#0f2d52] shadow-md"
            title="Academia verificada en MiFicha"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      {showName ? (
        <div className="max-w-[9rem] text-center">
          <p className="truncate text-sm font-semibold text-white">{academy.name}</p>
          {location ? (
            <p className="mt-0.5 truncate text-xs text-white/55">{location}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MarqueeRow({
  academies,
  reverse = false,
}: {
  academies: ShowcaseAcademy[];
  reverse?: boolean;
}) {
  if (academies.length === 0) return null;

  const loop = [...academies, ...academies];

  return (
    <div className="mf-marquee-mask relative overflow-hidden py-2">
      <div
        className={cn(
          "mf-marquee-track flex w-max items-center gap-5",
          reverse && "mf-marquee-track-reverse",
        )}
      >
        {loop.map((academy, index) => (
          <Link
            key={`${academy.id}-${index}`}
            href={`/a/${academy.slug}`}
            className="group flex shrink-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm transition hover:border-mf-accent/40 hover:bg-white/[0.1]"
          >
            <AcademyLogoMark academy={academy} size="sm" />
            <div className="min-w-0 pr-2">
              <p className="truncate text-sm font-semibold text-white">{academy.name}</p>
              {formatShowcaseLocation(academy) ? (
                <p className="truncate text-xs text-white/55">
                  {formatShowcaseLocation(academy)}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function VerifiedAcademiesShowcase({
  academies,
  playerCount = 0,
  variant = "feature",
  className,
}: VerifiedAcademiesShowcaseProps) {
  const showcase = prepareShowcaseAcademies(academies);
  const stats = getShowcaseStats(showcase, playerCount);

  if (showcase.length === 0) {
    return null;
  }

  if (variant === "marquee") {
    return (
      <section
        className={cn(
          "relative overflow-hidden border-y border-mf-brand/20 bg-gradient-to-r from-[#0a1f3d] via-mf-brand-dark to-[#123d68] py-8",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_2px,transparent_2px,transparent_12px)]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mf-accent-bright">
                Red verificada
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {stats.academyCount} academias ya compiten en MiFicha
              </p>
            </div>
            <Link
              href="/explorar"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-mf-accent-bright hover:text-white"
            >
              Ver directorio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <MarqueeRow academies={showcase} />
        </div>
      </section>
    );
  }

  const featured = showcase.slice(0, 8);
  const marqueePool =
    showcase.length >= 4 ? showcase : [...showcase, ...showcase, ...showcase];

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-[#08182f] via-[#0f2d52] to-[#134271] py-16 sm:py-20",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.14),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.025)_0px,rgba(255,255,255,0.025)_2px,transparent_2px,transparent_14px)]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mf-accent-bright">
              Academias que ya participan
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Reconoce a quienes ya compiten contigo
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
              Logos verificados, fichas públicas y stats reales. Cuando una academia
              ve a sus rivales aquí, entiende que MiFicha ya es parte del juego.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4 text-center">
              <Building2 className="mx-auto h-5 w-5 text-mf-accent-bright" />
              <p className="mt-3 text-2xl font-semibold tabular-nums text-white">
                {stats.academyCount}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-white/50">
                Academias
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4 text-center">
              <Award className="mx-auto h-5 w-5 text-amber-300" />
              <p className="mt-3 text-2xl font-semibold tabular-nums text-white">
                {stats.certifiedCount}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-white/50">
                Certificadas
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4 text-center">
              <Users className="mx-auto h-5 w-5 text-mf-accent-bright" />
              <p className="mt-3 text-2xl font-semibold tabular-nums text-white">
                {stats.playerCount}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-white/50">
                Fichas
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          <MarqueeRow academies={marqueePool} />
          <MarqueeRow academies={[...marqueePool].reverse()} reverse />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((academy) => (
            <Link
              key={academy.id}
              href={`/a/${academy.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-sm transition hover:border-mf-accent/35 hover:bg-white/[0.08] hover:shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
            >
              <AcademyLogoMark academy={academy} size="lg" showName />
              {academy.is_certified ? (
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-100">
                  <Award className="h-3.5 w-3.5" />
                  Certificada
                </span>
              ) : (
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-mf-accent/25 bg-mf-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-mf-accent-bright">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verificada
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/explorar" className="mf-btn-accent-solid">
            Explorar la red completa
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Tu academia también puede aparecer aquí
          </Link>
        </div>
      </div>
    </section>
  );
}
