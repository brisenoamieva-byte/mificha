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

export type TutorCareerBucket = {
  matches: number;
  goals: number;
  assists: number;
  minutes: number;
};

export type TutorCareerSummary = {
  /** Totales de encabezado: preferimos oficiales si hay academia ligada. */
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
  /** Stats oficiales del plantel (si hay vínculo). */
  official: TutorCareerBucket | null;
  /** Torneos capturados por el tutor (aparte del plantel). */
  tutorReported: TutorCareerBucket;
  /** Si hay ambas fuentes, el encabezado no las mezcla. */
  headlineKind: "academy" | "tutor" | "empty";
};

function bucketFromAcademy(
  academy: NonNullable<TutorLinkedPerformance["stats"]>,
): TutorCareerBucket {
  return {
    matches: academy.total_matches,
    goals: academy.total_goals,
    assists: academy.total_assists,
    minutes: academy.total_minutes,
  };
}

export function buildTutorCareerSummary(input: {
  seasons?: TutorSeasonStat[] | null;
  performance?: TutorLinkedPerformance | null;
  /** Si hay varias academias ligadas, se listan todas como fuentes oficiales. */
  performances?: TutorLinkedPerformance[] | null;
}): TutorCareerSummary {
  const seasons = input.seasons ?? [];
  const performances =
    input.performances && input.performances.length > 0
      ? input.performances
      : input.performance
        ? [input.performance]
        : [];
  const tutorTotals = summarizeTutorSeasons(seasons);

  const sources: TutorCareerSource[] = [];
  let official: TutorCareerBucket | null = null;

  for (const performance of performances) {
    const academy = performance.stats ?? null;
    if (!academy) continue;
    const hasNumbers =
      academy.total_matches > 0 ||
      academy.total_minutes > 0 ||
      academy.total_goals > 0 ||
      academy.total_assists > 0;
    if (!hasNumbers) continue;
    const bucket = bucketFromAcademy(academy);
    if (!official) {
      official = { ...bucket };
    } else {
      official = {
        matches: official.matches + bucket.matches,
        goals: official.goals + bucket.goals,
        assists: official.assists + bucket.assists,
        minutes: official.minutes + bucket.minutes,
      };
    }
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

  const academy = official
    ? {
        total_matches: official.matches,
        total_goals: official.goals,
        total_assists: official.assists,
        total_minutes: official.minutes,
        total_yellow_cards: performances.reduce(
          (sum, row) => sum + (row.stats?.total_yellow_cards ?? 0),
          0,
        ),
        total_red_cards: performances.reduce(
          (sum, row) => sum + (row.stats?.total_red_cards ?? 0),
          0,
        ),
      }
      : null;

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

  const tutorReported: TutorCareerBucket = {
    matches: tutorTotals.matches,
    goals: tutorTotals.goals,
    assists: tutorTotals.assists,
    minutes: tutorTotals.minutes,
  };

  const hasOfficial =
    official != null &&
    (official.matches > 0 ||
      official.goals > 0 ||
      official.assists > 0 ||
      official.minutes > 0);
  const hasTutor =
    tutorReported.matches > 0 ||
    tutorReported.goals > 0 ||
    tutorReported.assists > 0 ||
    tutorReported.minutes > 0;

  // No mezclar: el encabezado muestra oficiales si existen; si no, captura del tutor.
  const headline = hasOfficial ? official! : hasTutor ? tutorReported : null;
  const headlineKind: TutorCareerSummary["headlineKind"] = hasOfficial
    ? "academy"
    : hasTutor
      ? "tutor"
      : "empty";

  return {
    matches: headline?.matches ?? 0,
    goals: headline?.goals ?? 0,
    assists: headline?.assists ?? 0,
    minutes: headline?.minutes ?? 0,
    yellow_cards: academy?.total_yellow_cards ?? 0,
    red_cards: academy?.total_red_cards ?? 0,
    tournamentCount: sources.length,
    sources,
    hasAcademy: sources.some((row) => row.kind === "academy"),
    hasTutorStats: sources.some((row) => row.kind === "tutor"),
    official,
    tutorReported,
    headlineKind,
  };
}
