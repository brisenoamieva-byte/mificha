import type { PlayerPosition } from "@/types/database";

export type TrendDirection = "up" | "down" | "stable" | "new";

export interface WeeklyPlayerPerformance {
  player_id: string;
  slug: string;
  first_name: string;
  last_name: string;
  position: PlayerPosition;
  photo_url: string | null;
  birth_date: string;
  passport_score: number;
  academy_name: string;
  academy_city: string | null;
  academy_state: string | null;
  goals: number;
  assists: number;
  minutes: number;
  matches: number;
  weekly_score: number;
}

export interface PerformanceTrend {
  direction: TrendDirection;
  delta: number;
  previousScore: number;
  currentScore: number;
}

export interface RankedWeeklyPerformance extends WeeklyPlayerPerformance {
  rank: number;
  trend: PerformanceTrend;
}

export function getPreviousWeekRange(reference = new Date()) {
  const current = getWeekRangeFromReference(reference);
  const monday = new Date(`${current.start}T12:00:00`);
  monday.setDate(monday.getDate() - 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatter = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    timeZone: "America/Mexico_City",
  });

  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
    label: `${formatter.format(monday)} – ${formatter.format(sunday)}`,
  };
}

export function getWeekRangeFromReference(reference = new Date()) {
  const todayStr = reference.toLocaleDateString("en-CA", {
    timeZone: "America/Mexico_City",
  });
  const today = new Date(`${todayStr}T12:00:00`);
  const weekday = today.getDay();
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatter = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    timeZone: "America/Mexico_City",
  });

  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
    label: `${formatter.format(monday)} – ${formatter.format(sunday)}`,
  };
}

export function computeWeeklyScore(
  goals: number,
  assists: number,
  minutes: number,
  matches: number,
) {
  const minutesBonus = Math.min(minutes / 90, matches);
  return goals * 5 + assists * 3 + minutesBonus;
}

export function computePerformanceTrend(
  currentScore: number,
  previousScore: number | undefined,
): PerformanceTrend {
  if (previousScore === undefined) {
    return {
      direction: currentScore > 0 ? "new" : "stable",
      delta: currentScore,
      previousScore: 0,
      currentScore,
    };
  }

  const delta = roundScore(currentScore - previousScore);

  if (delta >= 2) {
    return { direction: "up", delta, previousScore, currentScore };
  }

  if (delta <= -2) {
    return { direction: "down", delta, previousScore, currentScore };
  }

  return { direction: "stable", delta, previousScore, currentScore };
}

export function attachPerformanceTrends(
  current: WeeklyPlayerPerformance[],
  previous: WeeklyPlayerPerformance[],
): RankedWeeklyPerformance[] {
  const previousById = new Map(
    previous.map((player) => [player.player_id, player.weekly_score]),
  );

  return [...current]
    .sort((a, b) => b.weekly_score - a.weekly_score)
    .map((player, index) => ({
      ...player,
      rank: index + 1,
      trend: computePerformanceTrend(
        player.weekly_score,
        previousById.get(player.player_id),
      ),
    }));
}

export function getRisingPerformances(
  ranked: RankedWeeklyPerformance[],
  limit = 5,
) {
  return ranked
    .filter(
      (player) =>
        player.trend.direction === "up" || player.trend.direction === "new",
    )
    .sort((a, b) => b.trend.delta - a.trend.delta)
    .slice(0, limit);
}

export function getWeeklyLeaderboard(
  ranked: RankedWeeklyPerformance[],
  limit = 10,
) {
  return ranked.slice(0, limit);
}

export function getTrendLabel(trend: PerformanceTrend) {
  switch (trend.direction) {
    case "up":
      return `+${Math.round(trend.delta)} pts`;
    case "down":
      return `${Math.round(trend.delta)} pts`;
    case "new":
      return "Primera aparición";
    default:
      return "Estable";
  }
}

function roundScore(value: number) {
  return Math.round(value * 10) / 10;
}

export interface AcademyWeeklyRow {
  player_id: string;
  slug: string;
  first_name: string;
  last_name: string;
  position: WeeklyPlayerPerformance["position"];
  photo_url: string | null;
  goals: number;
  assists: number;
  minutes: number;
  matches: number;
  weekly_score: number;
  rank: number;
  trend: PerformanceTrend;
}

export function aggregateAcademyWeeklyRows(
  stats: Array<{
    goals: number;
    assists: number;
    minutes_played: number;
    player_id: string;
    players: {
      slug: string;
      first_name: string;
      last_name: string;
      position: WeeklyPlayerPerformance["position"];
      photo_url: string | null;
    } | null;
  }>,
): Omit<AcademyWeeklyRow, "rank" | "trend">[] {
  const aggregated = new Map<string, Omit<AcademyWeeklyRow, "rank" | "trend">>();

  for (const row of stats) {
    if (!row.players) continue;

    const existing = aggregated.get(row.player_id);
    if (existing) {
      existing.goals += row.goals;
      existing.assists += row.assists;
      existing.minutes += row.minutes_played;
      existing.matches += 1;
      existing.weekly_score = computeWeeklyScore(
        existing.goals,
        existing.assists,
        existing.minutes,
        existing.matches,
      );
      continue;
    }

    aggregated.set(row.player_id, {
      player_id: row.player_id,
      slug: row.players.slug,
      first_name: row.players.first_name,
      last_name: row.players.last_name,
      position: row.players.position,
      photo_url: row.players.photo_url,
      goals: row.goals,
      assists: row.assists,
      minutes: row.minutes_played,
      matches: 1,
      weekly_score: computeWeeklyScore(
        row.goals,
        row.assists,
        row.minutes_played,
        1,
      ),
    });
  }

  return Array.from(aggregated.values()).sort(
    (a, b) => b.weekly_score - a.weekly_score,
  );
}

export function rankAcademyWeeklyRows(
  current: Omit<AcademyWeeklyRow, "rank" | "trend">[],
  previous: Omit<AcademyWeeklyRow, "rank" | "trend">[],
): AcademyWeeklyRow[] {
  const previousScores = new Map(
    previous.map((player) => [player.player_id, player.weekly_score]),
  );

  return current.map((player, index) => ({
    ...player,
    rank: index + 1,
    trend: computePerformanceTrend(
      player.weekly_score,
      previousScores.get(player.player_id),
    ),
  }));
}
