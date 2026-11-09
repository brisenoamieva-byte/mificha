import { summarizeTutorSeasons, type TutorSeasonStat } from "@/lib/tutor-family";
import type { TutorLinkedPerformance } from "@/lib/tutor-linked-performance";

export type TutorCareerSource = {
  id: string;
  kind: "academy" | "tutor";
  title: string;
  subtitle: string | null;
  matches: number;
  goals: number;
  assists: number;
  minutes: number;
  notes: string | null;
};

export type TutorCareerSummary = {
  matches: number;
  goals: number;
  assists: number;
  minutes: number;
  yellow_cards: number;
  red_cards: number;
  tournamentCount: number;
  sources: TutorCareerSource[];
  hasAcademy: boolean;
  hasTutorStats: boolean;
};

export function buildTutorCareerSummary(input: {
  seasons?: TutorSeasonStat[] | null;
  performance?: TutorLinkedPerformance | null;
}): TutorCareerSummary {
  const seasons = input.seasons ?? [];
  const performance = input.performance ?? null;
  const tutorTotals = summarizeTutorSeasons(seasons);
  const academy = performance?.stats ?? null;

  const sources: TutorCareerSource[] = [];

  if (performance && academy) {
    const hasNumbers =
      academy.total_matches > 0 ||
      academy.total_minutes > 0 ||
      academy.total_goals > 0 ||
      academy.total_assists > 0;
    if (hasNumbers) {
      sources.push({
        id: `academy-${performance.playerId}`,
        kind: "academy",
        title: performance.academyName
          ? `Academia · ${performance.academyName}`
          : "Academia ligada",
        subtitle: [performance.seasonName, "Stats oficiales"]
          .filter(Boolean)
          .join(" · "),
        matches: academy.total_matches,
        goals: academy.total_goals,
        assists: academy.total_assists,
        minutes: academy.total_minutes,
        notes: null,
      });
    }
  }

  for (const row of seasons) {
    if (!row.tournament_name.trim()) continue;
    if (!(row.matches > 0 || row.minutes > 0 || row.goals > 0 || row.assists > 0)) {
      continue;
    }
    sources.push({
      id: row.id,
      kind: "tutor",
      title: row.tournament_name,
      subtitle: [row.season_label, row.team_name].filter(Boolean).join(" · ") || null,
      matches: row.matches,
      goals: row.goals,
      assists: row.assists,
      minutes: row.minutes,
      notes: row.notes,
    });
  }

  return {
    matches: tutorTotals.matches + (academy?.total_matches ?? 0),
    goals: tutorTotals.goals + (academy?.total_goals ?? 0),
    assists: tutorTotals.assists + (academy?.total_assists ?? 0),
    minutes: tutorTotals.minutes + (academy?.total_minutes ?? 0),
    yellow_cards: academy?.total_yellow_cards ?? 0,
    red_cards: academy?.total_red_cards ?? 0,
    tournamentCount: sources.length,
    sources,
    hasAcademy: sources.some((row) => row.kind === "academy"),
    hasTutorStats: sources.some((row) => row.kind === "tutor"),
  };
}
