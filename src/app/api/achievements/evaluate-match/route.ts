import { NextResponse } from "next/server";
import {
  evaluateNewAchievementKeys,
  getAchievementDefinition,
  resolveTeamMvpPlayerIds,
  type MatchCaptureAchievementInput,
} from "@/lib/player-achievements";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";
import type { PlayerSeasonStat } from "@/types/database";

interface EvaluateMatchBody {
  match_id?: string;
  season_id?: string;
  captures?: MatchCaptureAchievementInput[];
}

async function computeConsecutiveStreak(
  supabase: Awaited<ReturnType<typeof getAuthedSupabaseClient>>,
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
    .map((row) => row.matches?.match_date)
    .filter((date): date is string => Boolean(date))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (dates.length === 0) return 0;

  let streak = 1;
  for (let index = 0; index < dates.length - 1; index += 1) {
    const current = new Date(dates[index]);
    const older = new Date(dates[index + 1]);
    const diffDays = (current.getTime() - older.getTime()) / 86_400_000;
    if (diffDays <= 21) streak += 1;
    else break;
  }

  return streak;
}

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = (await request.json()) as EvaluateMatchBody;
  const matchId = body.match_id?.trim();
  const seasonId = body.season_id?.trim();
  const captures = body.captures ?? [];

  if (!matchId || !seasonId || captures.length === 0) {
    return NextResponse.json(
      { error: "match_id, season_id y captures son obligatorios." },
      { status: 400 },
    );
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, academy_id")
    .eq("id", matchId)
    .maybeSingle();

  if (matchError || !match) {
    return NextResponse.json({ error: "Partido no encontrado." }, { status: 404 });
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

  const results: Array<{
    player_id: string;
    unlocked: Array<{
      key: string;
      title: string;
      description: string;
      rarity: string;
      emoji: string;
    }>;
  }> = [];

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
        academy_id: match.academy_id,
        achievement_key: key,
        match_id: matchId,
      })),
    );

    if (insertError && insertError.code !== "23505") {
      if (insertError.code === "42P01") {
        return NextResponse.json(
          { error: "Ejecuta player-achievements.sql en Supabase.", migrationPending: true },
          { status: 503 },
        );
      }

      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    for (const key of newKeys) {
      existingKeysByPlayer.get(capture.player_id)?.add(key);
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

  return NextResponse.json({ players: results });
}
