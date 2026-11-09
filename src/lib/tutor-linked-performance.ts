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

export type TutorLinkedPerformance = {
  playerId: string;
  slug: string | null;
  academyName: string | null;
  seasonName: string | null;
  stats: TutorLinkedSeasonStats | null;
  gph: PublicGphSummary | null;
  /** La ficha `/fut/j/...` está publicada con consentimiento. */
  isPublicFicha: boolean;
};

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

  const gph = await fetchLatestGphSummary(playerId);
  const isPublicFicha = Boolean(player.is_public && player.public_consent_at);

  const hasSignal =
    gph != null ||
    (stats != null && (stats.total_matches > 0 || stats.total_minutes > 0)) ||
    Boolean(slug);

  if (!hasSignal) return null;

  return {
    playerId,
    slug,
    academyName: academyName ?? null,
    seasonName,
    stats,
    gph,
    isPublicFicha,
  };
}
