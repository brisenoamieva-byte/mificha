import {
  getProtectedProfileDescription,
  getProtectedProfileTitle,
} from "@/lib/privacy";
import { signPlayerPhotoUrl, signPlayerVideoUrl } from "@/lib/supabase-admin";
import type { Player, PlayerSeasonStat } from "@/types/database";
import type { MatchPerformanceRow } from "@/lib/performance-analytics";
import {
  getPerformanceHighlights,
  normalizeMatchPerformanceRows,
} from "@/lib/performance-analytics";

export interface PublicPlayerAcademy {
  name: string;
  city: string | null;
  logo_url: string | null;
  primary_color: string;
}

export interface PublicPlayerHistoryItem {
  season_name: string;
  academy_name: string;
  stats: PlayerSeasonStat;
}

export interface PublicPlayerData {
  player: Player & { academies: PublicPlayerAcademy | null };
  currentSeasonStats: PlayerSeasonStat | null;
  currentSeasonName: string | null;
  history: PublicPlayerHistoryItem[];
  seasonProgress: MatchPerformanceRow[];
  seasonHighlights: ReturnType<typeof getPerformanceHighlights>;
}

function getSupabaseHeaders() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }

  return { url, key };
}

export async function fetchPublicPlayerBySlug(
  slug: string,
  options?: { skipMediaSigning?: boolean },
): Promise<PublicPlayerData | null> {
  const { url, key } = getSupabaseHeaders();

  const playerResponse = await fetch(
    `${url}/rest/v1/players?slug=eq.${encodeURIComponent(slug)}&is_public=eq.true&public_consent_at=not.is.null&select=*,academies(name,city,logo_url,primary_color)`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      next: { revalidate: 60 },
    },
  );

  if (!playerResponse.ok) return null;

  const players = (await playerResponse.json()) as Array<
    Player & { academies: PublicPlayerAcademy | null }
  >;

  const player = players[0];
  if (!player || !player.public_consent_at) return null;

  const activeSeasonResponse = await fetch(
    `${url}/rest/v1/seasons?academy_id=eq.${player.academy_id}&is_active=eq.true&select=id,name&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      next: { revalidate: 60 },
    },
  );

  let currentSeasonStats: PlayerSeasonStat | null = null;
  let currentSeasonName: string | null = null;
  let activeSeasonId: string | null = null;

  if (activeSeasonResponse.ok) {
    const seasons = (await activeSeasonResponse.json()) as Array<{
      id: string;
      name: string;
    }>;

    const activeSeason = seasons[0];
    if (activeSeason) {
      activeSeasonId = activeSeason.id;
      currentSeasonName = activeSeason.name;

      const statsResponse = await fetch(
        `${url}/rest/v1/player_season_stats?player_id=eq.${player.id}&season_id=eq.${activeSeason.id}&select=*&limit=1`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
          next: { revalidate: 60 },
        },
      );

      if (statsResponse.ok) {
        const stats = (await statsResponse.json()) as PlayerSeasonStat[];
        currentSeasonStats = stats[0] ?? null;
      }
    }
  }

  const historyResponse = await fetch(
    `${url}/rest/v1/player_season_stats?player_id=eq.${player.id}&select=*,seasons(name,start_date)&order=updated_at.desc`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      next: { revalidate: 60 },
    },
  );

  let history: PublicPlayerHistoryItem[] = [];

  if (historyResponse.ok) {
    const rawHistory = (await historyResponse.json()) as Array<
      PlayerSeasonStat & {
        seasons: { name: string; start_date: string } | null;
      }
    >;

    history = rawHistory.map((item) => ({
      season_name: item.seasons?.name ?? "Temporada",
      academy_name: player.academies?.name ?? "Academia",
      stats: item,
    }));
  }

  if (history.length === 0 && currentSeasonStats && currentSeasonName) {
    history = [
      {
        season_name: currentSeasonName,
        academy_name: player.academies?.name ?? "Academia",
        stats: currentSeasonStats,
      },
    ];
  }

  let seasonProgress: MatchPerformanceRow[] = [];

  if (activeSeasonId) {
    const progressResponse = await fetch(
      `${url}/rest/v1/match_stats?player_id=eq.${player.id}&select=goals,assists,minutes_played,yellow_cards,red_cards,matches!inner(id,opponent,match_date,result,goals_for,goals_against,status,season_id)&matches.season_id=eq.${activeSeasonId}&matches.status=eq.completed`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        next: { revalidate: 60 },
      },
    );

    if (progressResponse.ok) {
      seasonProgress = normalizeMatchPerformanceRows(await progressResponse.json());
    }
  }

  const seasonHighlights = getPerformanceHighlights(seasonProgress, []);

  return {
    player: {
      ...player,
      photo_url: options?.skipMediaSigning
        ? player.photo_url
        : await signPlayerPhotoUrl(player.photo_url),
      video_url: options?.skipMediaSigning
        ? player.video_url
        : await signPlayerVideoUrl(player.video_url),
    },
    currentSeasonStats,
    currentSeasonName,
    history,
    seasonProgress,
    seasonHighlights,
  };
}

export function getPublicProfileDescription(
  data: PublicPlayerData,
  age: number,
  positionLabel: string,
) {
  return getProtectedProfileDescription(
    data.player.first_name,
    data.player.birth_date,
    positionLabel,
    data.player.academies?.name ?? "su academia",
  );
}

export { getProtectedProfileTitle };
