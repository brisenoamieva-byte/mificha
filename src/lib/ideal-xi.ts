import type { PlayerPosition } from "@/types/database";
import {
  attachPerformanceTrends,
  computeWeeklyScore,
  getPreviousWeekRange,
  getRisingPerformances,
  getWeekRangeFromReference,
  getWeeklyLeaderboard,
  type RankedWeeklyPerformance,
  type WeeklyPlayerPerformance,
} from "@/lib/competition";
import { locationMatches } from "@/lib/mexico-locations";
import {
  matchesCategoryFilter,
  parseCategoryFilter,
} from "@/lib/player-category";
import { signPlayerPhotoUrl } from "@/lib/supabase-admin";

export type { RankedWeeklyPerformance, WeeklyPlayerPerformance } from "@/lib/competition";

export function getCurrentWeekRange(reference = new Date()) {
  return getWeekRangeFromReference(reference);
}

export type IdealXIScope = "mexico" | "state" | "city";

export interface IdealXIResult {
  lineup: WeeklyPlayerPerformance[];
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  scopeLabel: string;
}

const FORMATION: { position: PlayerPosition; count: number }[] = [
  { position: "goalkeeper", count: 1 },
  { position: "defender", count: 4 },
  { position: "midfielder", count: 3 },
  { position: "forward", count: 3 },
];

function getSupabaseHeaders() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }

  return { url, key };
}

interface RawWeeklyStatRow {
  goals: number;
  assists: number;
  minutes_played: number;
  player_id: string;
  players: {
    slug: string;
    first_name: string;
    last_name: string;
    position: PlayerPosition;
    photo_url: string | null;
    passport_score: number;
    birth_date: string;
    is_public: boolean;
    academies: {
      name: string;
      city: string | null;
      state: string | null;
      is_public: boolean;
    } | null;
  } | null;
  matches: {
    match_date: string;
    academy_id: string;
  } | null;
}

function aggregateWeeklyRows(rows: RawWeeklyStatRow[]) {
  const aggregated = new Map<string, WeeklyPlayerPerformance>();

  for (const row of rows) {
    const player = row.players;
    const academy = player?.academies;

    if (!player || !academy?.is_public) continue;

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
      slug: player.slug,
      first_name: player.first_name,
      last_name: player.last_name,
      position: player.position,
      photo_url: player.photo_url,
      birth_date: player.birth_date,
      passport_score: player.passport_score,
      academy_name: academy.name,
      academy_city: academy.city,
      academy_state: academy.state,
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

async function fetchPerformancesForRange(start: string, end: string) {
  const { url, key } = getSupabaseHeaders();

  const query = [
    "select=goals,assists,minutes_played,player_id,players!inner(slug,first_name,last_name,birth_date,position,photo_url,passport_score,is_public,is_discoverable,public_consent_at,academies(name,city,state,is_public)),matches!inner(match_date,academy_id)",
    "players.is_public=eq.true",
    "players.is_discoverable=eq.true",
    "players.public_consent_at=not.is.null",
    `matches.match_date=gte.${start}`,
    `matches.match_date=lte.${end}`,
  ].join("&");

  const response = await fetch(`${url}/rest/v1/match_stats?${query}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) return [];

  const rows = (await response.json()) as RawWeeklyStatRow[];
  const performances = aggregateWeeklyRows(rows);

  return Promise.all(
    performances.map(async (player) => ({
      ...player,
      photo_url: await signPlayerPhotoUrl(player.photo_url),
    })),
  );
}

export async function fetchWeeklyCompetitionData() {
  const week = getCurrentWeekRange();
  const previousWeek = getPreviousWeekRange();

  const [current, previous] = await Promise.all([
    fetchPerformancesForRange(week.start, week.end),
    fetchPerformancesForRange(previousWeek.start, previousWeek.end),
  ]);

  const ranked = attachPerformanceTrends(current, previous);

  return {
    performances: current,
    ranked,
    rising: getRisingPerformances(ranked),
    leaderboard: getWeeklyLeaderboard(ranked),
    weekLabel: week.label,
    weekStart: week.start,
    weekEnd: week.end,
  };
}

export async function fetchWeeklyPlayerPerformances() {
  const data = await fetchWeeklyCompetitionData();
  return {
    performances: data.performances,
    ranked: data.ranked,
    rising: data.rising,
    leaderboard: data.leaderboard,
    weekLabel: data.weekLabel,
    weekStart: data.weekStart,
    weekEnd: data.weekEnd,
  };
}

export function buildIdealXI(
  performances: WeeklyPlayerPerformance[],
  scope: IdealXIScope,
  state = "",
  city = "",
  categoryFilter = "all",
): IdealXIResult {
  const week = getCurrentWeekRange();
  const category = parseCategoryFilter(categoryFilter);

  let filtered = performances.filter((player) =>
    matchesCategoryFilter(player.birth_date, category),
  );
  let scopeLabel = "México";

  if (scope === "state" && state) {
    filtered = filtered.filter((player) =>
      locationMatches(player.academy_state, state),
    );
    scopeLabel = state;
  }

  if (scope === "city" && city) {
    filtered = filtered.filter(
      (player) =>
        locationMatches(player.academy_city, city) &&
        (!state || locationMatches(player.academy_state, state)),
    );
    scopeLabel = state ? `${city}, ${state}` : city;
  }

  const categoryLabel = category.kind === "all" ? null : category;
  if (categoryLabel?.kind === "age") {
    scopeLabel = `${scopeLabel} · Sub-${categoryLabel.age}`;
  } else if (categoryLabel?.kind === "generation") {
    scopeLabel = `${scopeLabel} · Gen. ${categoryLabel.year}`;
  }

  const used = new Set<string>();
  const lineup: WeeklyPlayerPerformance[] = [];

  for (const slot of FORMATION) {
    const candidates = filtered
      .filter(
        (player) =>
          player.position === slot.position && !used.has(player.player_id),
      )
      .sort((a, b) => b.weekly_score - a.weekly_score);

    for (let index = 0; index < slot.count && index < candidates.length; index++) {
      lineup.push(candidates[index]);
      used.add(candidates[index].player_id);
    }
  }

  return {
    lineup,
    weekLabel: week.label,
    weekStart: week.start,
    weekEnd: week.end,
    scopeLabel,
  };
}

export function getIdealXIPitchRows(lineup: WeeklyPlayerPerformance[]) {
  return {
    goalkeeper: lineup.filter((player) => player.position === "goalkeeper"),
    defenders: lineup.filter((player) => player.position === "defender"),
    midfielders: lineup.filter((player) => player.position === "midfielder"),
    forwards: lineup.filter((player) => player.position === "forward"),
  };
}
