"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MatchScheduleCard } from "@/components/marketing/match-schedule-card";
import type { PublicUpcomingMatch } from "@/lib/public-schedule";
import { buildMatchCategoryFilterOptions } from "@/lib/player-category";

interface PublicScheduleExploreSectionProps {
  matches: PublicUpcomingMatch[];
}

export function PublicScheduleExploreSection({
  matches,
}: PublicScheduleExploreSectionProps) {
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categoryOptions = useMemo(
    () => buildMatchCategoryFilterOptions(matches.map((match) => match.category)),
    [matches],
  );

  const filteredMatches = useMemo(() => {
    if (categoryFilter === "all") return matches;
    return matches.filter((match) => match.category?.trim() === categoryFilter);
  }, [categoryFilter, matches]);

  if (matches.length === 0) return null;

  return (
    <section className="border-b border-mf-border bg-mf-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="max-w-2xl">
          <p className="mf-marketing-eyebrow">Calendario</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text sm:text-3xl">
            Próximos amistosos y entrenamientos
          </h2>
          <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
            Eventos publicados por academias en MiFicha. El calendario oficial de
            liga o torneo lo publica el organizador — enlázalo desde cada academia.
          </p>
        </div>

        {categoryOptions.length > 1 ? (
          <label className="mt-6 block max-w-sm">
            <span className="text-sm font-medium text-mf-text">
              Categoría del partido
            </span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="mf-input mt-2"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {filteredMatches.length === 0 ? (
            <div className="mf-card border-dashed p-8 text-center text-sm text-mf-text-secondary lg:col-span-2">
              No hay partidos en esta categoría. Prueba otra o vuelve a «Todas».
            </div>
          ) : (
            filteredMatches.map((match) => (
              <MatchScheduleCard
                key={match.id}
                match={match}
                academyName={match.academy_name}
                academyHref={`/a/${match.academy_slug}`}
                variant="light"
              />
            ))
          )}
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
