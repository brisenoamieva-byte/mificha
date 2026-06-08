import {
  aggregateAcademyWeeklyRows,
  getPreviousWeekRange,
  getWeekRangeFromReference,
  rankAcademyWeeklyRows,
  type AcademyWeeklyRow,
} from "@/lib/competition";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchAcademyWeekStats(
  supabase: SupabaseClient,
  academyId: string,
  start: string,
  end: string,
) {
  const { data: matches } = await supabase
    .from("matches")
    .select("id")
    .eq("academy_id", academyId)
    .gte("match_date", start)
    .lte("match_date", end);

  if (!matches?.length) return [];

  const { data: stats } = await supabase
    .from("match_stats")
    .select(
      "goals, assists, minutes_played, player_id, players(slug, first_name, last_name, position, photo_url)",
    )
    .in(
      "match_id",
      matches.map((match) => match.id),
    );

  type WeekStatRow = Parameters<typeof aggregateAcademyWeeklyRows>[0][number];

  return aggregateAcademyWeeklyRows((stats ?? []) as unknown as WeekStatRow[]);
}

export interface PlayerWeeklyRankSnapshot {
  rank: number;
  total: number;
  weekly_score: number;
  positions_delta: number | null;
  week_label: string;
}

export function getPlayerWeeklyRankSnapshot(
  rankedRows: AcademyWeeklyRow[],
  playerId: string,
  previousRows: ReturnType<typeof aggregateAcademyWeeklyRows>,
): PlayerWeeklyRankSnapshot | null {
  const playerRow = rankedRows.find((row) => row.player_id === playerId);
  if (!playerRow) return null;

  const previousSorted = [...previousRows].sort(
    (a, b) => b.weekly_score - a.weekly_score,
  );
  const previousIndex = previousSorted.findIndex((row) => row.player_id === playerId);
  const previousRank = previousIndex >= 0 ? previousIndex + 1 : null;

  return {
    rank: playerRow.rank,
    total: rankedRows.length,
    weekly_score: playerRow.weekly_score,
    positions_delta:
      previousRank !== null ? previousRank - playerRow.rank : null,
    week_label: getWeekRangeFromReference().label,
  };
}

export async function fetchAcademyWeeklyRankSnapshots(
  supabase: SupabaseClient,
  academyId: string,
  playerIds: string[],
) {
  const currentWeek = getWeekRangeFromReference();
  const previousWeek = getPreviousWeekRange();

  const [current, previous] = await Promise.all([
    fetchAcademyWeekStats(supabase, academyId, currentWeek.start, currentWeek.end),
    fetchAcademyWeekStats(supabase, academyId, previousWeek.start, previousWeek.end),
  ]);

  const ranked = rankAcademyWeeklyRows(current, previous);
  const snapshots = new Map<string, PlayerWeeklyRankSnapshot>();

  for (const playerId of playerIds) {
    const snapshot = getPlayerWeeklyRankSnapshot(ranked, playerId, previous);
    if (snapshot) {
      snapshots.set(playerId, snapshot);
    }
  }

  return snapshots;
}
