import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchLatestGphSummary,
  type PublicGphSummary,
} from "@/lib/gph-player-link";
import type { TutorChild } from "@/lib/tutor-family";
import { childMemberships, primaryMembership } from "@/lib/tutor-memberships";

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

async function fetchPerformanceForPlayer(
  admin: SupabaseClient,
  playerId: string,
  fallbackAcademyName: string | null,
): Promise<TutorLinkedPerformance | null> {
  const { data: player } = await admin
    .from("players")
    .select("id,slug,academy_id,is_public,public_consent_at,academies(name)")
    .eq("id", playerId)
    .maybeSingle();

  if (!player) return null;

  const academyJoin = player.academies as { name?: string } | { name?: string }[] | null;
  const academyName = Array.isArray(academyJoin)
    ? academyJoin[0]?.name ?? fallbackAcademyName
    : academyJoin?.name ?? fallbackAcademyName;

  const slug = player.slug ? String(player.slug) : null;
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

/** Todas las membresías ligadas (N academias). */
export async function fetchTutorLinkedPerformances(
  admin: SupabaseClient,
  child: Pick<
    TutorChild,
    | "memberships"
    | "linked_player_id"
    | "linked_player_slug"
    | "linked_academy_name"
    | "linked_academy_id"
    | "linked_at"
  >,
): Promise<TutorLinkedPerformance[]> {
  const memberships = childMemberships(child);
  if (memberships.length === 0) {
    // Fallback legacy slug-only.
    if (!child.linked_player_id && child.linked_player_slug) {
      const { data } = await admin
        .from("players")
        .select("id")
        .eq("slug", child.linked_player_slug)
        .maybeSingle();
      if (data?.id) {
        const one = await fetchPerformanceForPlayer(
          admin,
          String(data.id),
          child.linked_academy_name,
        );
        return one ? [one] : [];
      }
    }
    return [];
  }

  const rows = await Promise.all(
    memberships.map((membership) =>
      fetchPerformanceForPlayer(admin, membership.player_id, membership.academy_name),
    ),
  );
  return rows.filter((row): row is TutorLinkedPerformance => Boolean(row));
}

/**
 * Resumen primario (primera membresía) — compat con UI existente.
 */
export async function fetchTutorLinkedPerformance(
  admin: SupabaseClient,
  child: Pick<
    TutorChild,
    | "memberships"
    | "linked_player_id"
    | "linked_player_slug"
    | "linked_academy_name"
    | "linked_academy_id"
    | "linked_at"
  >,
): Promise<TutorLinkedPerformance | null> {
  const all = await fetchTutorLinkedPerformances(admin, child);
  if (all.length === 0) return null;
  const primary = primaryMembership(child);
  if (primary) {
    return all.find((row) => row.playerId === primary.player_id) ?? all[0];
  }
  return all[0];
}
