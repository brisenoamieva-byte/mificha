import { fetchAcademyWeeklyRankSnapshots } from "@/lib/academy-weekly-stats";
import { computeConsecutiveMatchStreak } from "@/lib/match-streak";
import {
  evaluateNewAchievementKeys,
  getAchievementDefinition,
  resolveTeamMvpPlayerIds,
  type MatchCaptureAchievementInput,
} from "@/lib/player-achievements";
import type { PlayerSeasonStat } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface EvaluateMatchAchievementsResult {
  player_id: string;
  unlocked: Array<{
    key: string;
    title: string;
    description: string;
    rarity: string;
    emoji: string;
  }>;
  weekly?: {
    rank: number;
    total: number;
    weekly_score: number;
    positions_delta: number | null;
    week_label: string;
  };
}

async function computeConsecutiveStreak(
  supabase: SupabaseClient,
  playerId: string,
  seasonId: string,
) {
  const { data: rows } = await supabase
    .from("match_stats")
    .select("matches!inner(match_date, season_id, status)")
    .eq("player_id", playerId)
    .eq("matches.season_id", seasonId)
    .eq("matches.status", "completed");

  const dates = (rows ?? [])
    .map((row) => {
      const related = row.matches as unknown;
      if (Array.isArray(related)) {
        return related[0]?.match_date as string | undefined;
      }
      return (related as { match_date?: string } | null)?.match_date;
    })
    .filter((date): date is string => Boolean(date));

  return computeConsecutiveMatchStreak(dates);
}

export async function evaluateMatchAchievements(
  supabase: SupabaseClient,
  input: {
    matchId: string;
    seasonId: string;
    academyId: string;
    captures: MatchCaptureAchievementInput[];
  },
): Promise<
  | { ok: true; players: EvaluateMatchAchievementsResult[] }
  | { ok: false; error: string; migrationPending?: boolean }
> {
  const { matchId, seasonId, academyId, captures } = input;

  if (captures.length === 0) {
    return { ok: true, players: [] };
  }

  const playerIds = captures.map((capture) => capture.player_id);
  const mvpPlayerIds = resolveTeamMvpPlayerIds(captures);

  const [{ data: seasonStatsRows }, { data: existingRows }] = await Promise.all([
    supabase
      .from("player_season_stats")
      .select("*")
      .eq("season_id", seasonId)
      .in("player_id", playerIds),
    supabase
      .from("player_achievements")
      .select("player_id, achievement_key")
      .in("player_id", playerIds),
  ]);

  const seasonStatsByPlayer = new Map<string, PlayerSeasonStat | null>();
  for (const playerId of playerIds) {
    seasonStatsByPlayer.set(
      playerId,
      seasonStatsRows?.find((row) => row.player_id === playerId) ?? null,
    );
  }

  const existingKeysByPlayer = new Map<string, Set<string>>();
  for (const playerId of playerIds) {
    existingKeysByPlayer.set(playerId, new Set());
  }
  for (const row of existingRows ?? []) {
    existingKeysByPlayer.get(row.player_id)?.add(row.achievement_key);
  }

  const streakMatchesByPlayer = new Map<string, number>();
  await Promise.all(
    playerIds.map(async (playerId) => {
      streakMatchesByPlayer.set(
        playerId,
        await computeConsecutiveStreak(supabase, playerId, seasonId),
      );
    }),
  );

  const results: EvaluateMatchAchievementsResult[] = [];

  for (const capture of captures) {
    const newKeys = evaluateNewAchievementKeys(capture, {
      matchId,
      seasonId,
      seasonStats: seasonStatsByPlayer.get(capture.player_id),
      existingKeys: existingKeysByPlayer.get(capture.player_id) ?? new Set(),
      streakMatches: streakMatchesByPlayer.get(capture.player_id) ?? 0,
      isTeamMvp: mvpPlayerIds.has(capture.player_id),
    });

    if (newKeys.length === 0) {
      results.push({ player_id: capture.player_id, unlocked: [] });
      continue;
    }

    const { error: insertError } = await supabase.from("player_achievements").insert(
      newKeys.map((key) => ({
        player_id: capture.player_id,
        academy_id: academyId,
        achievement_key: key,
        match_id: matchId,
      })),
    );

    if (insertError && insertError.code !== "23505") {
      if (insertError.code === "42P01") {
        return {
          ok: false,
          error: "Ejecuta player-achievements.sql en Supabase.",
          migrationPending: true,
        };
      }

      return { ok: false, error: insertError.message };
    }

    results.push({
      player_id: capture.player_id,
      unlocked: newKeys
        .map((key) => getAchievementDefinition(key))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map((item) => ({
          key: item.key,
          title: item.title,
          description: item.description,
          rarity: item.rarity,
          emoji: item.emoji,
        })),
    });
  }

  const weeklySnapshots = await fetchAcademyWeeklyRankSnapshots(
    supabase,
    academyId,
    playerIds,
  );

  for (const result of results) {
    const weekly = weeklySnapshots.get(result.player_id);
    if (weekly) {
      result.weekly = weekly;
    }
  }

  return { ok: true, players: results };
}

export async function evaluateAchievementsAfterActa(
  supabase: SupabaseClient,
  matchId: string,
) {
  const { data: match } = await supabase
    .from("matches")
    .select("id, academy_id, season_id")
    .eq("id", matchId)
    .maybeSingle();

  if (!match?.season_id) return { ok: true as const, players: [] };

  const { data: statsRows } = await supabase
    .from("match_stats")
    .select("player_id, goals, assists, minutes_played")
    .eq("match_id", matchId);

  const playedRows = (statsRows ?? []).filter((row) => row.minutes_played > 0);
  if (playedRows.length === 0) return { ok: true as const, players: [] };

  const { data: players } = await supabase
    .from("players")
    .select("id, passport_score")
    .in(
      "id",
      playedRows.map((row) => row.player_id),
    );

  const passportByPlayer = new Map(
    (players ?? []).map((player) => [player.id, player.passport_score]),
  );

  return evaluateMatchAchievements(supabase, {
    matchId,
    seasonId: match.season_id,
    academyId: match.academy_id,
    captures: playedRows.map((row) => ({
      player_id: row.player_id,
      goals: row.goals,
      assists: row.assists,
      minutes: row.minutes_played,
      passport_score: passportByPlayer.get(row.player_id) ?? 0,
      previous_passport_score: passportByPlayer.get(row.player_id) ?? 0,
    })),
  });
}
