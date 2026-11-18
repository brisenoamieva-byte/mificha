import type { PlayerPosition } from "@/types/database";
import { locationMatches } from "@/lib/mexico-locations";
import { fetchLatestGphScoresByPlayerId } from "@/lib/gph-player-link";
import { signPlayerPhotoUrl } from "@/lib/supabase-admin";
import {
  matchesCategoryFilter,
  parseCategoryFilter,
  type PlayerCategoryFilter,
} from "@/lib/player-category";

export interface DirectoryAcademy {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  logo_url: string | null;
  is_certified: boolean;
}

export type DirectorySeasonStats = {
  matches: number;
  goals: number;
  assists: number;
  minutes: number;
};

export type DirectoryPerformanceFilter = {
  minMinutes?: number;
  minGoals?: number;
  minAssists?: number;
  minMatches?: number;
  /** Mínimo de goles + asistencias. */
  minContributions?: number;
  /** Mínimo de goles por 90 minutos (requiere piso de muestra). */
  minGoalsPer90?: number;
  /** Mínimo de asistencias por 90 minutos (requiere piso de muestra). */
  minAssistsPer90?: number;
  /** Solo jugadores con evaluación GPH (con o sin score numérico). */
  requireGph?: boolean;
  /** Mínimo de calificación global GPH (1–5). 0 = sin mínimo. */
  minGphScore?: number;
  requireVideo?: boolean;
};

export const EMPTY_SEASON_STATS: DirectorySeasonStats = {
  matches: 0,
  goals: 0,
  assists: 0,
  minutes: 0,
};

/** Sin al menos 90' la tasa por 90 cuenta como 0 al filtrar (evita muestras ridículas). */
export const RATE_SAMPLE_MIN_MINUTES = 90;

export type DirectorySeasonRates = {
  contributions: number;
  goalsPer90: number;
  assistsPer90: number;
  hasRateSample: boolean;
};

function roundRate(value: number) {
  return Math.round(value * 100) / 100;
}

export function computeDirectoryRates(
  stats: DirectorySeasonStats,
): DirectorySeasonRates {
  const contributions = stats.goals + stats.assists;
  const hasRateSample = stats.minutes >= RATE_SAMPLE_MIN_MINUTES;
  if (!hasRateSample || stats.minutes <= 0) {
    return {
      contributions,
      goalsPer90: 0,
      assistsPer90: 0,
      hasRateSample,
    };
  }
  const nineties = stats.minutes / 90;
  return {
    contributions,
    goalsPer90: roundRate(stats.goals / nineties),
    assistsPer90: roundRate(stats.assists / nineties),
    hasRateSample,
  };
}

export interface DirectoryPlayer {
  id?: string;
  slug: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  position: PlayerPosition;
  passport_score: number;
  photo_url: string | null;
  video_url?: string | null;
  has_gph_evaluation?: boolean;
  /** Última calificación global GPH (1–5), si existe. */
  gph_global_score?: number | null;
  /** academy = plantel certificado; tutor = ficha armada por el tutor */
  source?: "academy" | "tutor";
  public_code?: string | null;
  /** Totales temporada activa (academia) o capturados por el tutor. */
  season_stats?: DirectorySeasonStats;
  academies: {
    name: string;
    city: string | null;
    state: string | null;
    slug: string;
    is_certified: boolean;
  } | null;
}

export interface PublicDirectoryData {
  academies: DirectoryAcademy[];
  players: DirectoryPlayer[];
}

/**
 * Vista locked: el payload al cliente no lleva nombre completo ni media firmada.
 * Conserva birth_date para filtros de categoría en el cliente.
 */
export function sanitizeDirectoryForLockedView(
  data: PublicDirectoryData,
): PublicDirectoryData {
  return {
    ...data,
    players: data.players.map((player) => {
      const first =
        String(player.first_name ?? "")
          .trim()
          .split(/\s+/)
          .filter(Boolean)[0] ?? "";
      const surname =
        String(player.last_name ?? "")
          .trim()
          .split(/\s+/)
          .filter(Boolean)[0] ?? "";
      const initial = surname.charAt(0).toLocaleUpperCase("es-MX");
      return {
        ...player,
        first_name: first || "Jugador",
        last_name: initial ? `${initial}.` : "",
        photo_url: null,
        video_url: null,
        season_stats: undefined,
      };
    }),
  };
}

/** Jugadores de demo local (`/fut/api/seed`) — no mezclar con perfiles de ejemplo en /explorar. */
export function isDevSeedPlayer(player: Pick<DirectoryPlayer, "slug">) {
  return player.slug.endsWith("-seed");
}

/** Placeholders / stubs que no deben aparecer en el buscador público. */
export function isPlaceholderExplorePlayer(
  player: Pick<DirectoryPlayer, "slug" | "first_name" | "last_name">,
) {
  if (isDevSeedPlayer(player)) return true;
  const slug = player.slug.toLowerCase();
  const full = `${player.first_name} ${player.last_name}`.toLowerCase();
  if (slug.includes("pendiente") || full.includes("(pendiente)")) return true;
  if (slug.startsWith("juan-perez") || full === "juan perez") return true;
  return false;
}

function asAcademyEmbed(
  value: DirectoryPlayer["academies"] | DirectoryPlayer["academies"][] | null | undefined,
): DirectoryPlayer["academies"] {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function getSupabaseHeaders() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }

  return { url, key };
}

function asNonNeg(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}

async function fetchActiveSeasonStatsByPlayerId(
  playerIds: string[],
  url: string,
  key: string,
): Promise<Map<string, DirectorySeasonStats>> {
  const map = new Map<string, DirectorySeasonStats>();
  if (playerIds.length === 0) return map;

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };

  const seasonsResponse = await fetch(
    `${url}/rest/v1/seasons?is_active=eq.true&select=id`,
    { headers, next: { revalidate: 60 } },
  );
  if (!seasonsResponse.ok) return map;
  const seasonsJson = (await seasonsResponse.json()) as Array<{ id: string }>;
  const seasonIds = seasonsJson.map((row) => row.id).filter(Boolean);
  if (seasonIds.length === 0) return map;

  const chunkSize = 80;
  for (let i = 0; i < playerIds.length; i += chunkSize) {
    const chunk = playerIds.slice(i, i + chunkSize);
    const statsResponse = await fetch(
      `${url}/rest/v1/player_season_stats?season_id=in.(${seasonIds.join(",")})&player_id=in.(${chunk.join(",")})&select=player_id,total_matches,total_goals,total_assists,total_minutes`,
      { headers, next: { revalidate: 60 } },
    );
    if (!statsResponse.ok) continue;
    const rows = (await statsResponse.json()) as Array<{
      player_id: string;
      total_matches: number | null;
      total_goals: number | null;
      total_assists: number | null;
      total_minutes: number | null;
    }>;
    for (const row of rows) {
      const prev = map.get(row.player_id) ?? { ...EMPTY_SEASON_STATS };
      map.set(row.player_id, {
        matches: prev.matches + asNonNeg(row.total_matches),
        goals: prev.goals + asNonNeg(row.total_goals),
        assists: prev.assists + asNonNeg(row.total_assists),
        minutes: prev.minutes + asNonNeg(row.total_minutes),
      });
    }
  }

  return map;
}

export function playerSeasonStats(
  player: Pick<DirectoryPlayer, "season_stats">,
): DirectorySeasonStats {
  return player.season_stats ?? EMPTY_SEASON_STATS;
}

export function hasActivePerformanceFilter(
  performance?: DirectoryPerformanceFilter | null,
) {
  if (!performance) return false;
  return Boolean(
    (performance.minMinutes && performance.minMinutes > 0) ||
      (performance.minGoals && performance.minGoals > 0) ||
      (performance.minAssists && performance.minAssists > 0) ||
      (performance.minMatches && performance.minMatches > 0) ||
      (performance.minContributions && performance.minContributions > 0) ||
      (performance.minGoalsPer90 && performance.minGoalsPer90 > 0) ||
      (performance.minAssistsPer90 && performance.minAssistsPer90 > 0) ||
      performance.requireGph ||
      (performance.minGphScore && performance.minGphScore > 0) ||
      performance.requireVideo,
  );
}

export async function fetchPublicDirectory(): Promise<PublicDirectoryData> {
  try {
    const { url, key } = getSupabaseHeaders();

    const [academiesResponse, playersResponse] = await Promise.all([
      fetch(
        `${url}/rest/v1/academies?is_public=eq.true&is_certified=eq.true&select=id,name,slug,city,state,logo_url,is_certified&order=name.asc`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
          next: { revalidate: 60 },
        },
      ),
      fetch(
        `${url}/rest/v1/players?is_public=eq.true&is_discoverable=eq.true&public_consent_at=not.is.null&select=id,slug,first_name,last_name,birth_date,position,passport_score,photo_url,video_url,academies(name,city,state,slug,is_certified)&order=passport_score.desc&limit=500`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
          next: { revalidate: 60 },
        },
      ),
    ]);

    const academiesJson = academiesResponse.ok ? await academiesResponse.json() : [];
    const academies = Array.isArray(academiesJson) ? (academiesJson as DirectoryAcademy[]) : [];

    let playersJson: unknown = [];
    if (playersResponse.ok) {
      playersJson = await playersResponse.json();
    } else if (playersResponse.status === 400) {
      const retry = await fetch(
        `${url}/rest/v1/players?is_public=eq.true&is_discoverable=eq.true&public_consent_at=not.is.null&select=id,slug,first_name,last_name,birth_date,position,passport_score,photo_url,academies(name,city,state,slug,is_certified)&order=passport_score.desc&limit=500`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
          next: { revalidate: 60 },
        },
      );
      if (retry.ok) playersJson = await retry.json();
    }

    // Consentimiento + ficha pública/discoverable es el candado; la certificación
    // de academia es un sello, no un requisito para aparecer en el buscador.
    const consented = Array.isArray(playersJson)
      ? (playersJson as DirectoryPlayer[])
      : [];
    const playerIds = consented
      .map((player) => player.id)
      .filter((id): id is string => Boolean(id));
    const [{ createSupabaseAdminClient }, { ensurePlayerPublicCodes }] =
      await Promise.all([
        import("@/lib/supabase-admin"),
        import("@/lib/public-player-code"),
      ]);
    const admin = createSupabaseAdminClient();
    const [gphScores, seasonStatsById, publicCodes] = await Promise.all([
      fetchLatestGphScoresByPlayerId(playerIds),
      fetchActiveSeasonStatsByPlayerId(playerIds, url, key),
      ensurePlayerPublicCodes(admin, playerIds).catch(
        () => ({} as Record<string, string>),
      ),
    ]);
    const players = await Promise.all(
      consented.map(async (player) => ({
        ...player,
        source: "academy" as const,
        public_code: player.id ? publicCodes[player.id] ?? null : null,
        academies: asAcademyEmbed(player.academies),
        photo_url: await signPlayerPhotoUrl(player.photo_url),
        has_gph_evaluation: Boolean(player.id && gphScores.has(player.id)),
        gph_global_score:
          player.id && gphScores.has(player.id)
            ? (gphScores.get(player.id) ?? null)
            : null,
        season_stats: player.id
          ? (seasonStatsById.get(player.id) ?? { ...EMPTY_SEASON_STATS })
          : { ...EMPTY_SEASON_STATS },
      })),
    );

    return { academies, players };
  } catch (error) {
    console.error("fetchPublicDirectory failed:", error);
    return { academies: [], players: [] };
  }
}

export function parsePlayerSlugFromInput(input: string) {
  const trimmed = input.trim();

  if (!trimmed) return "";

  try {
    if (trimmed.includes("://") || trimmed.startsWith("/fut/j/")) {
      const path = trimmed.includes("://")
        ? new URL(trimmed).pathname
        : trimmed;
      const match = path.match(/\/j\/([^/?#]+)/);
      if (match?.[1]) return decodeURIComponent(match[1]);
    }
  } catch {
    // Fall through to slug parsing.
  }

  return trimmed
    .replace(/^\/j\//, "")
    .replace(/^\/+|\/+$/g, "")
    .split("?")[0]
    .split("#")[0];
}

export function filterDirectory(
  data: PublicDirectoryData,
  query: string,
  position: PlayerPosition | "all",
  minPassport: number,
  state = "",
  city = "",
  categoryFilter: PlayerCategoryFilter | string = "all",
  performance?: DirectoryPerformanceFilter,
) {
  const normalizedQuery = query.trim().toLowerCase();
  const category =
    typeof categoryFilter === "string"
      ? parseCategoryFilter(categoryFilter)
      : categoryFilter;
  const minMinutes = performance?.minMinutes ?? 0;
  const minGoals = performance?.minGoals ?? 0;
  const minAssists = performance?.minAssists ?? 0;
  const minMatches = performance?.minMatches ?? 0;
  const minContributions = performance?.minContributions ?? 0;
  const minGoalsPer90 = performance?.minGoalsPer90 ?? 0;
  const minAssistsPer90 = performance?.minAssistsPer90 ?? 0;
  const requireGph = Boolean(performance?.requireGph);
  const minGphScore = performance?.minGphScore ?? 0;
  const requireVideo = Boolean(performance?.requireVideo);

  const academies = (Array.isArray(data.academies) ? data.academies : []).filter((academy) => {
    if (state && !locationMatches(academy.state, state)) return false;
    if (city && !locationMatches(academy.city, city)) return false;
    if (!normalizedQuery) return true;

    const haystack = [
      academy.name,
      academy.city,
      academy.state,
      academy.slug,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const players = (Array.isArray(data.players) ? data.players : []).filter((player) => {
    if (state && !locationMatches(player.academies?.state, state)) return false;
    if (city && !locationMatches(player.academies?.city, city)) return false;
    if (!matchesCategoryFilter(player.birth_date, category)) return false;
    if (position !== "all" && player.position !== position) return false;
    if (player.passport_score < minPassport) return false;

    const stats = playerSeasonStats(player);
    const rates = computeDirectoryRates(stats);
    if (stats.minutes < minMinutes) return false;
    if (stats.goals < minGoals) return false;
    if (stats.assists < minAssists) return false;
    if (stats.matches < minMatches) return false;
    if (rates.contributions < minContributions) return false;
    if (rates.goalsPer90 < minGoalsPer90) return false;
    if (rates.assistsPer90 < minAssistsPer90) return false;
    if ((requireGph || minGphScore > 0) && !player.has_gph_evaluation) {
      return false;
    }
    if (minGphScore > 0) {
      const score = player.gph_global_score;
      if (score == null || !Number.isFinite(score) || score < minGphScore) {
        return false;
      }
    }
    if (requireVideo && !player.video_url) return false;

    if (!normalizedQuery) return true;

    const haystack = [
      player.first_name,
      player.last_name,
      player.academies?.name,
      player.academies?.city,
      player.slug,
      player.public_code,
      player.source === "tutor" ? "tutor ficha" : "",
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  return { academies, players };
}
