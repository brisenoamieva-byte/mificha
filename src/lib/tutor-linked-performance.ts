import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchLatestGphSummary,
  type PublicGphSummary,
} from "@/lib/gph-player-link";
import type { TutorChild } from "@/lib/tutor-family";

export type TutorLinkedSeasonStats = {
  total_matches: number;
  total_goals: number;
  total_assists: number;
  total_minutes: number;
  total_yellow_cards: number;
  total_red_cards: number;
};

/** Último partido completado del plantel (para carta post-partido del niño). */
export type TutorLastMatchHighlight = {
  matchId: string;
  opponent: string;
  matchDate: string;
  result: "win" | "draw" | "loss" | null;
  goalsFor: number | null;
  goalsAgainst: number | null;
  goals: number;
  assists: number;
  minutes: number;
};

export type TutorLinkedPerformance = {
  playerId: string;
  slug: string | null;
  academyName: string | null;
  seasonName: string | null;
  stats: TutorLinkedSeasonStats | null;
  gph: PublicGphSummary | null;
  /** La ficha `/fut/j/...` está publicada con consentimiento. */
  isPublicFicha: boolean;
  /** Jornada más reciente con stats del jugador. */
  lastMatch: TutorLastMatchHighlight | null;
};

async function fetchLastMatchHighlight(
  admin: SupabaseClient,
  playerId: string,
): Promise<TutorLastMatchHighlight | null> {
  const { data: rows, error } = await admin
    .from("match_stats")
    .select(
      "goals, assists, minutes_played, match_id, matches(id, opponent, match_date, result, goals_for, goals_against, status)",
    )
    .eq("player_id", playerId)
    .limit(50);

  if (error || !rows?.length) return null;

  type MatchJoin = {
    id?: string;
    opponent?: string | null;
    match_date?: string | null;
    result?: string | null;
    goals_for?: number | null;
    goals_against?: number | null;
    status?: string | null;
  };

  const candidates: TutorLastMatchHighlight[] = [];
  for (const row of rows) {
    const matchRel = row.matches as MatchJoin | MatchJoin[] | null;
    const match = Array.isArray(matchRel) ? matchRel[0] : matchRel;
    if (!match || match.status !== "completed") continue;
    const matchDate = String(match.match_date ?? "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(matchDate)) continue;
    const resultRaw = match.result;
    const result =
      resultRaw === "win" || resultRaw === "draw" || resultRaw === "loss"
        ? resultRaw
        : null;
    candidates.push({
      matchId: String(match.id ?? row.match_id),
      opponent: String(match.opponent ?? "Rival").trim() || "Rival",
      matchDate,
      result,
      goalsFor: match.goals_for == null ? null : Number(match.goals_for),
      goalsAgainst:
        match.goals_against == null ? null : Number(match.goals_against),
      goals: Number(row.goals ?? 0),
      assists: Number(row.assists ?? 0),
      minutes: Number(row.minutes_played ?? 0),
    });
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.matchDate.localeCompare(a.matchDate));
  return candidates[0] ?? null;
}

function emptyStats(): TutorLinkedSeasonStats {
  return {
    total_matches: 0,
    total_goals: 0,
    total_assists: 0,
    total_minutes: 0,
    total_yellow_cards: 0,
    total_red_cards: 0,
  };
}

/**
 * Resumen de torneo + GPH para un hijo tutor ligado a plantel.
 * Usa service role: la ficha tutor es opt-in del tutor aunque `/fut/j` aún no sea pública.
 */
export async function fetchTutorLinkedPerformance(
  admin: SupabaseClient,
  child: Pick<TutorChild, "linked_player_id" | "linked_player_slug" | "linked_academy_name">,
): Promise<TutorLinkedPerformance | null> {
  let playerId = child.linked_player_id;
  let slug = child.linked_player_slug;

  if (!playerId && slug) {
    const { data } = await admin
      .from("players")
      .select("id,slug,academy_id,is_public,public_consent_at,academies(name)")
      .eq("slug", slug)
      .maybeSingle();
    if (!data?.id) return null;
    playerId = String(data.id);
  }

  if (!playerId) return null;

  const { data: player } = await admin
    .from("players")
    .select("id,slug,academy_id,is_public,public_consent_at,academies(name)")
    .eq("id", playerId)
    .maybeSingle();

  if (!player) return null;

  const academyJoin = player.academies as { name?: string } | { name?: string }[] | null;
  const academyName = Array.isArray(academyJoin)
    ? academyJoin[0]?.name ?? child.linked_academy_name
    : academyJoin?.name ?? child.linked_academy_name;

  slug = player.slug ? String(player.slug) : slug;
  const academyId = player.academy_id ? String(player.academy_id) : null;

  let seasonName: string | null = null;
  let stats: TutorLinkedSeasonStats | null = null;

  if (academyId) {
    const { data: season } = await admin
      .from("seasons")
      .select("id,name")
      .eq("academy_id", academyId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (season?.id) {
      seasonName = String(season.name ?? "Temporada activa");
      const { data: row } = await admin
        .from("player_season_stats")
        .select(
          "total_matches,total_goals,total_assists,total_minutes,total_yellow_cards,total_red_cards",
        )
        .eq("player_id", playerId)
        .eq("season_id", season.id)
        .maybeSingle();

      if (row) {
        stats = {
          total_matches: Number(row.total_matches ?? 0),
          total_goals: Number(row.total_goals ?? 0),
          total_assists: Number(row.total_assists ?? 0),
          total_minutes: Number(row.total_minutes ?? 0),
          total_yellow_cards: Number(row.total_yellow_cards ?? 0),
          total_red_cards: Number(row.total_red_cards ?? 0),
        };
      } else {
        stats = emptyStats();
      }
    }
  }

  const [gph, lastMatch] = await Promise.all([
    fetchLatestGphSummary(playerId),
    fetchLastMatchHighlight(admin, playerId),
  ]);
  const isPublicFicha = Boolean(player.is_public && player.public_consent_at);

  const hasSignal =
    gph != null ||
    lastMatch != null ||
    (stats != null && (stats.total_matches > 0 || stats.total_minutes > 0)) ||
    Boolean(slug) ||
    Boolean(playerId);

  if (!hasSignal) return null;

  return {
    playerId,
    slug,
    academyName: academyName ?? null,
    seasonName,
    stats,
    gph,
    isPublicFicha,
    lastMatch,
  };
}
