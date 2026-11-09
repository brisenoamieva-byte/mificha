import { getPositionLabel } from "@/lib/dashboard-utils";
import { getProtectedProfileTitle } from "@/lib/privacy";
import type { PublicPlayerData } from "@/lib/public-player";

export interface OgPlayerSharePayload {
  title: string;
  academyName: string;
  seasonName: string | null;
  positionLabel: string;
  stats: {
    matches: number;
    goals: number;
    assists: number;
    minutes: number;
  };
  initials: string;
}

export function buildOgPlayerSharePayload(data: PublicPlayerData): OgPlayerSharePayload {
  const { player, currentSeasonStats, currentSeasonName } = data;
  const stats = currentSeasonStats ?? {
    total_matches: 0,
    total_goals: 0,
    total_assists: 0,
    total_minutes: 0,
  };

  return {
    title: getProtectedProfileTitle(
      player.first_name,
      player.last_name,
      player.birth_date,
    ),
    academyName: player.academies?.name ?? "Academia verificada",
    seasonName: currentSeasonName,
    positionLabel: getPositionLabel(player.position),
    stats: {
      matches: stats.total_matches,
      goals: stats.total_goals,
      assists: stats.total_assists,
      minutes: stats.total_minutes,
    },
    initials: `${player.first_name.charAt(0)}${player.last_name.charAt(0)}`.toUpperCase(),
  };
}

export function buildOgPlayerImageAlt(payload: OgPlayerSharePayload) {
  return `${payload.title} · Ficha verificada · MiFicha`;
}

/** Fetch mínimo para OG: sin GPH, videos ni historial completo. */
export async function fetchOgPlayerSharePayload(
  slug: string,
): Promise<OgPlayerSharePayload | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };

  const playerResponse = await fetch(
    `${url}/rest/v1/players?slug=eq.${encodeURIComponent(slug)}&is_public=eq.true&public_consent_at=not.is.null&select=id,first_name,last_name,birth_date,position,academy_id,academies(name)`,
    { headers, cache: "no-store" },
  );
  if (!playerResponse.ok) return null;

  const players = (await playerResponse.json()) as Array<{
    id: string;
    first_name: string;
    last_name: string;
    birth_date: string | null;
    position: string | null;
    academy_id: string;
    academies: { name: string } | null;
  }>;
  const player = players[0];
  if (!player) return null;

  let seasonName: string | null = null;
  let stats = {
    total_matches: 0,
    total_goals: 0,
    total_assists: 0,
    total_minutes: 0,
  };

  const seasonResponse = await fetch(
    `${url}/rest/v1/seasons?academy_id=eq.${player.academy_id}&is_active=eq.true&select=id,name&limit=1`,
    { headers, cache: "no-store" },
  );
  if (seasonResponse.ok) {
    const seasons = (await seasonResponse.json()) as Array<{ id: string; name: string }>;
    const active = seasons[0];
    if (active) {
      seasonName = active.name;
      const statsResponse = await fetch(
        `${url}/rest/v1/player_season_stats?player_id=eq.${player.id}&season_id=eq.${active.id}&select=total_matches,total_goals,total_assists,total_minutes&limit=1`,
        { headers, cache: "no-store" },
      );
      if (statsResponse.ok) {
        const rows = (await statsResponse.json()) as Array<typeof stats>;
        if (rows[0]) stats = rows[0];
      }
    }
  }

  return {
    title: getProtectedProfileTitle(
      player.first_name,
      player.last_name,
      player.birth_date,
    ),
    academyName: player.academies?.name ?? "Academia verificada",
    seasonName,
    positionLabel: getPositionLabel(player.position),
    stats: {
      matches: stats.total_matches ?? 0,
      goals: stats.total_goals ?? 0,
      assists: stats.total_assists ?? 0,
      minutes: stats.total_minutes ?? 0,
    },
    initials: `${player.first_name.charAt(0)}${player.last_name.charAt(0)}`.toUpperCase(),
  };
}
