import type { MatchResult } from "@/types/database";
import type { ComparisonInsight } from "@/lib/stats-analytics";

export interface MatchPerformanceRow {
  matchId: string;
  matchDate: string;
  opponent: string;
  result: MatchResult | null;
  goalsFor: number | null;
  goalsAgainst: number | null;
  goals: number;
  assists: number;
  minutes: number;
  yellowCards: number;
  redCards: number;
}

export interface TrendPoint {
  index: number;
  label: string;
  cumulative: number;
  matchValue: number;
}

export interface PerformanceHighlights {
  totalMatches: number;
  totalContributions: number;
  bestMatch: MatchPerformanceRow | null;
  recentForm: number;
  positiveMetrics: number;
  lastMatch: MatchPerformanceRow | null;
}

export function normalizeMatchPerformanceRows(
  rows: Array<{
    goals: number;
    assists: number;
    minutes_played: number;
    yellow_cards: number;
    red_cards: number;
    matches: {
      id: string;
      opponent: string;
      match_date: string;
      result: MatchResult | null;
      goals_for: number | null;
      goals_against: number | null;
    } | null;
  }>,
): MatchPerformanceRow[] {
  return rows
    .filter((row) => row.matches)
    .map((row) => ({
      matchId: row.matches!.id,
      matchDate: row.matches!.match_date,
      opponent: row.matches!.opponent,
      result: row.matches!.result,
      goalsFor: row.matches!.goals_for,
      goalsAgainst: row.matches!.goals_against,
      goals: row.goals,
      assists: row.assists,
      minutes: row.minutes_played,
      yellowCards: row.yellow_cards,
      redCards: row.red_cards,
    }))
    .sort(
      (a, b) =>
        new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
    );
}

export function buildTrendSeries(
  rows: MatchPerformanceRow[],
  metric: "goals" | "assists" | "minutes" | "contributions",
): TrendPoint[] {
  let cumulative = 0;

  return rows.map((row, index) => {
    const matchValue =
      metric === "contributions"
        ? row.goals + row.assists
        : row[metric === "minutes" ? "minutes" : metric];

    cumulative += matchValue;

    return {
      index: index + 1,
      label: row.opponent,
      cumulative,
      matchValue,
    };
  });
}

export function buildSparklinePath(
  values: number[],
  width = 128,
  height = 40,
  padding = 4,
): string {
  if (values.length === 0) return "";
  if (values.length === 1) {
    const y = height / 2;
    return `M ${padding} ${y} L ${width - padding} ${y}`;
  }

  const max = Math.max(1, ...values);
  const step = (width - padding * 2) / (values.length - 1);

  const points = values.map((value, index) => {
    const x = padding + index * step;
    const y = height - padding - (value / max) * (height - padding * 2);
    return `${x},${y}`;
  });

  return `M ${points.join(" L ")}`;
}

export function buildAreaPath(
  values: number[],
  width = 280,
  height = 88,
  padding = 6,
): { line: string; area: string } {
  if (values.length === 0) {
    return { line: "", area: "" };
  }

  const max = Math.max(1, ...values);
  const step =
    values.length === 1 ? 0 : (width - padding * 2) / (values.length - 1);
  const baseline = height - padding;

  const points = values.map((value, index) => {
    const x = padding + index * step;
    const y = height - padding - (value / max) * (height - padding * 2);
    return { x, y };
  });

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const first = points[0];
  const last = points[points.length - 1];
  const area = `${line} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;

  return { line, area };
}

export function getPerformanceHighlights(
  rows: MatchPerformanceRow[],
  insights: ComparisonInsight[],
): PerformanceHighlights {
  const positiveMetrics = insights.filter(
    (item) =>
      item.metric !== "total_yellow_cards" &&
      item.metric !== "total_red_cards" &&
      item.delta > 0,
  ).length;

  const bestMatch =
    rows.length === 0
      ? null
      : [...rows].sort(
          (a, b) =>
            b.goals + b.assists - (a.goals + a.assists) ||
            b.minutes - a.minutes,
        )[0] ?? null;

  const recent = rows.slice(-3);
  const recentForm =
    recent.length === 0
      ? 0
      : recent.reduce((sum, row) => sum + row.goals + row.assists, 0);

  return {
    totalMatches: rows.length,
    totalContributions: rows.reduce(
      (sum, row) => sum + row.goals + row.assists,
      0,
    ),
    bestMatch,
    recentForm,
    positiveMetrics,
    lastMatch: rows[rows.length - 1] ?? null,
  };
}

export function formatMatchShortDate(isoDate: string) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

export function getResultTone(result: MatchResult | null) {
  if (result === "win") return "win" as const;
  if (result === "draw") return "draw" as const;
  if (result === "loss") return "loss" as const;
  return "neutral" as const;
}
