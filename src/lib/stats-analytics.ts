import type { PlayerSeasonStat } from "@/types/database";

export type StatMetric =
  | "total_matches"
  | "total_goals"
  | "total_assists"
  | "total_minutes"
  | "total_yellow_cards"
  | "total_red_cards";

export const COMPARISON_METRICS: {
  key: StatMetric;
  label: string;
  shortLabel: string;
}[] = [
  { key: "total_matches", label: "Partidos", shortLabel: "PJ" },
  { key: "total_goals", label: "Goles", shortLabel: "G" },
  { key: "total_assists", label: "Asistencias", shortLabel: "A" },
  { key: "total_minutes", label: "Minutos", shortLabel: "MIN" },
  { key: "total_yellow_cards", label: "Amarillas", shortLabel: "TA" },
  { key: "total_red_cards", label: "Rojas", shortLabel: "TR" },
];

export interface TeamAverages {
  total_matches: number;
  total_goals: number;
  total_assists: number;
  total_minutes: number;
  total_yellow_cards: number;
  total_red_cards: number;
}

export interface ComparisonInsight {
  metric: StatMetric;
  label: string;
  playerValue: number;
  teamAverage: number;
  rank: number;
  totalPlayers: number;
  delta: number;
  percentVsAverage: number;
}

export function computeTeamAverages(
  stats: Pick<PlayerSeasonStat, StatMetric>[],
): TeamAverages {
  if (stats.length === 0) {
    return {
      total_matches: 0,
      total_goals: 0,
      total_assists: 0,
      total_minutes: 0,
      total_yellow_cards: 0,
      total_red_cards: 0,
    };
  }

  const totals = stats.reduce(
    (acc, item) => ({
      total_matches: acc.total_matches + item.total_matches,
      total_goals: acc.total_goals + item.total_goals,
      total_assists: acc.total_assists + item.total_assists,
      total_minutes: acc.total_minutes + item.total_minutes,
      total_yellow_cards: acc.total_yellow_cards + item.total_yellow_cards,
      total_red_cards: acc.total_red_cards + item.total_red_cards,
    }),
    {
      total_matches: 0,
      total_goals: 0,
      total_assists: 0,
      total_minutes: 0,
      total_yellow_cards: 0,
      total_red_cards: 0,
    },
  );

  const count = stats.length;

  return {
    total_matches: roundOne(totals.total_matches / count),
    total_goals: roundOne(totals.total_goals / count),
    total_assists: roundOne(totals.total_assists / count),
    total_minutes: roundOne(totals.total_minutes / count),
    total_yellow_cards: roundOne(totals.total_yellow_cards / count),
    total_red_cards: roundOne(totals.total_red_cards / count),
  };
}

export function getMetricRank(
  stats: PlayerSeasonStat[],
  playerId: string,
  metric: StatMetric,
) {
  const sorted = [...stats].sort((a, b) => b[metric] - a[metric]);
  const index = sorted.findIndex((item) => item.player_id === playerId);
  return index === -1 ? stats.length : index + 1;
}

export function getComparisonInsights(
  stats: PlayerSeasonStat[],
  playerId: string,
): ComparisonInsight[] {
  const playerStats = stats.find((item) => item.player_id === playerId);
  const averages = computeTeamAverages(stats);

  if (!playerStats) return [];

  return COMPARISON_METRICS.map(({ key, label }) => {
    const playerValue = playerStats[key];
    const teamAverage = averages[key];
    const delta = roundOne(playerValue - teamAverage);
    const percentVsAverage =
      teamAverage === 0
        ? playerValue > 0
          ? 100
          : 0
        : roundOne(((playerValue - teamAverage) / teamAverage) * 100);

    return {
      metric: key,
      label,
      playerValue,
      teamAverage,
      rank: getMetricRank(stats, playerId, key),
      totalPlayers: stats.length,
      delta,
      percentVsAverage,
    };
  });
}

export function getMaxMetricValue(
  stats: Pick<PlayerSeasonStat, StatMetric>[],
  metric: StatMetric,
) {
  return Math.max(1, ...stats.map((item) => item[metric]));
}

export function getAveragePassportScore(scores: number[]) {
  if (scores.length === 0) return 0;
  return roundOne(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

export function formatDeltaLabel(delta: number) {
  if (delta > 0) return `+${delta}`;
  return `${delta}`;
}

export function getDeltaTone(delta: number, invert = false) {
  const positive = invert ? delta < 0 : delta > 0;
  const negative = invert ? delta > 0 : delta < 0;

  if (positive) return "positive" as const;
  if (negative) return "negative" as const;
  return "neutral" as const;
}
