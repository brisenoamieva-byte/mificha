import Link from "next/link";
import {
  ArrowDown,
  BarChart3,
  Building2,
  MapPin,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplorePageHeroProps {
  playerCount: number;
  academyCount: number;
  weeklyActiveCount: number;
  weekLabel: string;
}

interface StatCardProps {
  icon: typeof Users;
  value: string;
  label: string;
  hint?: string;
  accent?: "brand" | "accent" | "neutral";
}

function StatCard({ icon: Icon, value, label, hint, accent = "brand" }: StatCardProps) {
  const iconStyles = {
    brand: "bg-mf-brand-soft text-mf-brand",
    accent: "bg-mf-accent-soft text-mf-accent-dark",
    neutral: "bg-mf-canvas text-mf-text-secondary",
  } as const;

  return (
    <div className="flex items-start gap-3.5 rounded-xl border border-mf-border bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          iconStyles[accent],
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tabular-nums leading-none tracking-tight text-mf-text">
          {value}
        </p>
        <p className="mt-1.5 text-sm font-medium text-mf-text">{label}</p>
        {hint ? (
          <p className="mt-0.5 text-xs leading-5 text-mf-text-muted">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export function ExplorePageHero({
  playerCount,
  academyCount,
  weeklyActiveCount,
  weekLabel,
}: ExplorePageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-mf-border bg-mf-surface">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_0%_0%,rgba(27,79,140,0.07),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,rgba(52,211,153,0.06),transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-12">
          <div className="max-w-xl">
            <p className="mf-marketing-eyebrow">Visorías · Temporada 2026</p>
            <h1 className="mt-4 text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-mf-text sm:text-[2.5rem]">
              Encuentra jugadores verificados
            </h1>
            <p className="mt-5 text-base leading-8 text-mf-text-secondary sm:text-[1.0625rem]">
              Busca por categoría, posición y ciudad. Cada ficha incluye stats del torneo
              y evaluación de la academia.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {[
                { icon: ShieldCheck, label: "Consentimiento parental" },
                { icon: BarChart3, label: "Stats del torneo" },
                { icon: MapPin, label: "Querétaro y zona metropolitana" },
              ].map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-mf-border-subtle bg-mf-canvas px-3 py-1.5 text-xs font-medium text-mf-text-secondary"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-mf-brand" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>

            <Link
              href="#directorio"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-mf-brand transition hover:text-mf-brand-dark"
            >
              Ir al directorio
              <ArrowDown className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <StatCard
              icon={Users}
              value={String(playerCount)}
              label="Jugadores en directorio"
              hint="Perfiles públicos con ficha activa"
              accent="brand"
            />
            <StatCard
              icon={Building2}
              value={String(academyCount)}
              label="Academias certificadas"
              hint={
                academyCount === 0
                  ? "Próximamente más sedes en el directorio"
                  : "Sedes con plantel verificado"
              }
              accent="neutral"
            />
            <StatCard
              icon={Trophy}
              value={String(weeklyActiveCount)}
              label="Con actividad esta semana"
              hint={weekLabel}
              accent="accent"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
