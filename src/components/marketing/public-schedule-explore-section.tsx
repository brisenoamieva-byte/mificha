import Link from "next/link";
import { MatchScheduleCard } from "@/components/marketing/match-schedule-card";
import type { PublicUpcomingMatch } from "@/lib/public-schedule";

interface PublicScheduleExploreSectionProps {
  matches: PublicUpcomingMatch[];
}

export function PublicScheduleExploreSection({
  matches,
}: PublicScheduleExploreSectionProps) {
  if (matches.length === 0) return null;

  return (
    <section className="border-b border-mf-border bg-mf-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="max-w-2xl">
          <p className="mf-marketing-eyebrow">Calendario</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text sm:text-3xl">
            Próximos partidos en MiFicha
          </h2>
          <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
            Fecha, hora y sede publicados por academias. Padres, jugadores y scouts
            pueden consultar cuándo y dónde hay juego.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {matches.map((match) => (
            <MatchScheduleCard
              key={match.id}
              match={match}
              academyName={match.academy_name}
              academyHref={`/a/${match.academy_slug}`}
              variant="light"
            />
          ))}
        </div>

        <p className="mt-6 text-sm text-mf-text-muted">
          ¿Eres academia?{" "}
          <Link href="/signup" className="font-semibold text-mf-brand hover:underline">
            Publica tu calendario en MiFicha
          </Link>
        </p>
      </div>
    </section>
  );
}
