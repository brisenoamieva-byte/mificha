import { MARKETING_IMAGES } from "@/lib/marketing-assets";
import { locationMatches } from "@/lib/mexico-locations";
import {
  matchesCategoryFilter,
  parseCategoryFilter,
} from "@/lib/player-category";
import type { DirectoryPlayer, DirectoryAcademy } from "@/lib/public-directory";
import { isDevSeedPlayer, type PublicDirectoryData } from "@/lib/public-directory";
import type {
  FeaturedPlayer,
  PublicAcademy,
  PublicAcademyData,
  PublicScheduledMatch,
} from "@/lib/public-academy";
import type { PlayerPosition } from "@/types/database";

export const DEMO_ACADEMY_SLUG = "academia-gallos-demo";

/** Enlace de academia compartido por los perfiles de ejemplo. */
export const DEMO_ACADEMY_PLAYER_LINK = {
  name: "Academia Gallos",
  city: "Querétaro",
  state: "Querétaro",
  slug: DEMO_ACADEMY_SLUG,
  is_certified: true,
} as const;

/** Academia certificada de ejemplo para /explorar y /a/academia-gallos-demo. */
export const DEMO_EXPLORE_ACADEMY: DirectoryAcademy = {
  id: "demo-academia-gallos",
  name: "Academia Gallos",
  slug: DEMO_ACADEMY_SLUG,
  city: "Querétaro",
  state: "Querétaro",
  logo_url: MARKETING_IMAGES.demoAcademiaGallosLogo,
  is_certified: true,
};

export interface ExploreDemoPlayer extends DirectoryPlayer {
  is_demo: true;
  season_stats: {
    matches: number;
    goals: number;
    assists: number;
    minutes: number;
  };
  /** Enlace de ejemplo (no hay ficha pública real). */
  example_href: string;
}

/** Perfiles de ejemplo para /explorar — Temporada 2026. */
export const DEMO_EXPLORE_PLAYERS: ExploreDemoPlayer[] = [
  {
    is_demo: true,
    slug: "santiago-hernandez-demo",
    first_name: "Santiago",
    last_name: "Hernández",
    birth_date: "2011-04-12",
    position: "forward",
    passport_score: 78,
    photo_url: MARKETING_IMAGES.demoPlayerHeadshot,
    example_href: "/#demo-ficha-documento",
    season_stats: { matches: 14, goals: 11, assists: 5, minutes: 980 },
    academies: DEMO_ACADEMY_PLAYER_LINK,
  },
  {
    is_demo: true,
    slug: "diego-morales-demo",
    first_name: "Diego",
    last_name: "Morales",
    birth_date: "2011-08-20",
    position: "midfielder",
    passport_score: 72,
    photo_url: MARKETING_IMAGES.demoExplorePlayer2,
    example_href: "/#demo-ficha-documento",
    season_stats: { matches: 13, goals: 4, assists: 7, minutes: 910 },
    academies: DEMO_ACADEMY_PLAYER_LINK,
  },
  {
    is_demo: true,
    slug: "mateo-castillo-demo",
    first_name: "Mateo",
    last_name: "Castillo",
    birth_date: "2010-11-05",
    position: "defender",
    passport_score: 69,
    photo_url: MARKETING_IMAGES.demoExplorePlayer3,
    example_href: "/#demo-ficha-documento",
    season_stats: { matches: 14, goals: 1, assists: 2, minutes: 1260 },
    academies: DEMO_ACADEMY_PLAYER_LINK,
  },
  {
    is_demo: true,
    slug: "lucas-vargas-demo",
    first_name: "Lucas",
    last_name: "Vargas",
    birth_date: "2011-06-10",
    position: "goalkeeper",
    passport_score: 65,
    photo_url: MARKETING_IMAGES.demoExplorePlayer4,
    example_href: "/#demo-ficha-documento",
    season_stats: { matches: 12, goals: 0, assists: 0, minutes: 1080 },
    academies: DEMO_ACADEMY_PLAYER_LINK,
  },
];

export const DEMO_EXPLORE_FEATURED = [
  {
    rank: 1,
    name: "Santiago H.",
    position: "forward" as PlayerPosition,
    photo: MARKETING_IMAGES.demoPlayerHeadshot,
    stat: "11 goles",
    href: "/#demo-ficha-documento",
  },
  {
    rank: 2,
    name: "Diego M.",
    position: "midfielder" as PlayerPosition,
    photo: MARKETING_IMAGES.demoExplorePlayer2,
    stat: "7 asistencias",
    href: "/#demo-ficha-documento",
  },
  {
    rank: 3,
    name: "Mateo C.",
    position: "defender" as PlayerPosition,
    photo: MARKETING_IMAGES.demoExplorePlayer3,
    stat: "90 min prom.",
    href: "/#demo-ficha-documento",
  },
] as const;

export function filterDemoExplorePlayers(
  demos: ExploreDemoPlayer[],
  query: string,
  position: PlayerPosition | "all",
  minPassport: number,
  state = "",
  city = "",
  categoryFilter = "all",
): ExploreDemoPlayer[] {
  const normalizedQuery = query.trim().toLowerCase();
  const category = parseCategoryFilter(categoryFilter);

  return demos.filter((player) => {
    if (state && !locationMatches(player.academies?.state, state)) return false;
    if (city && !locationMatches(player.academies?.city, city)) return false;
    if (!matchesCategoryFilter(player.birth_date, category)) return false;
    if (position !== "all" && player.position !== position) return false;
    if (player.passport_score < minPassport) return false;

    if (!normalizedQuery) return true;

    const haystack = [
      player.first_name,
      player.last_name,
      player.academies?.name,
      player.academies?.city,
      player.slug,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function isExploreDemoPlayer(
  player: DirectoryPlayer | ExploreDemoPlayer,
): player is ExploreDemoPlayer {
  return "is_demo" in player && player.is_demo === true;
}

export function normalizeExplorePlayerName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Total de perfiles únicos en el listado público (demos + reales, sin seed de dev). */
export function countExploreDirectoryPlayers(data: PublicDirectoryData): number {
  const realPlayers = data.players.filter((player) => !isDevSeedPlayer(player));
  const realSlugs = new Set(realPlayers.map((player) => player.slug));
  const demos = DEMO_EXPLORE_PLAYERS.filter((player) => !realSlugs.has(player.slug));

  const seenNames = new Set<string>();
  let count = 0;

  for (const player of [...demos, ...realPlayers]) {
    const nameKey = normalizeExplorePlayerName(player.first_name, player.last_name);
    if (seenNames.has(nameKey)) continue;
    seenNames.add(nameKey);
    count += 1;
  }

  return count;
}

export function isDemoAcademySlug(slug: string) {
  return slug === DEMO_ACADEMY_SLUG;
}

export function filterDemoExploreAcademy(
  query: string,
  state = "",
  city = "",
): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (state && !locationMatches(DEMO_EXPLORE_ACADEMY.state, state)) return false;
  if (city && !locationMatches(DEMO_EXPLORE_ACADEMY.city, city)) return false;

  if (!normalizedQuery) return true;

  const haystack = [
    DEMO_EXPLORE_ACADEMY.name,
    DEMO_EXPLORE_ACADEMY.city,
    DEMO_EXPLORE_ACADEMY.state,
    DEMO_EXPLORE_ACADEMY.slug,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

/** Academias visibles en el directorio (demo + reales, sin duplicar slug). */
export function countExploreDirectoryAcademies(data: PublicDirectoryData): number {
  const hasRealDuplicate = data.academies.some(
    (academy) => academy.slug === DEMO_ACADEMY_SLUG,
  );
  const realCount = data.academies.filter(
    (academy) => academy.slug !== DEMO_ACADEMY_SLUG,
  ).length;

  return realCount + (hasRealDuplicate ? 0 : 1);
}

const DEMO_ACADEMY_PROFILE: PublicAcademy = {
  id: DEMO_EXPLORE_ACADEMY.id,
  name: DEMO_EXPLORE_ACADEMY.name,
  slug: DEMO_EXPLORE_ACADEMY.slug,
  logo_url: MARKETING_IMAGES.demoAcademiaGallosLogo,
  description:
    "Academia formativa en Querétaro con categorías Sub-13 a Sub-17. Plantel verificado en MiFicha, stats sincronizadas con la liga interescolar y comunicación directa con tutores después de cada jornada.",
  city: "Querétaro",
  state: "Querétaro",
  phone: "4425550198",
  website: null,
  league_name: "Liga Interescolar Querétaro",
  league_calendar_url: null,
  primary_color: "#1A3B6D",
  is_certified: true,
};

const DEMO_ACADEMY_UPCOMING: PublicScheduledMatch[] = [
  {
    id: "demo-gallos-match-1",
    opponent: "Instituto Cervantes",
    match_date: "2026-03-14",
    kickoff_at: "2026-03-14T10:00:00-06:00",
    venue_name: "Unidad Deportiva Jurica",
    venue_address: "Jurica, Querétaro",
    category: "Sub-15",
    notes: "Jornada 11 · Liga Interescolar",
    status: "scheduled",
  },
  {
    id: "demo-gallos-match-2",
    opponent: "Club Deportivo Corregidora",
    match_date: "2026-03-21",
    kickoff_at: "2026-03-21T09:00:00-06:00",
    venue_name: "Cancha Gallos",
    venue_address: "Centro Sur, Querétaro",
    category: "Sub-15",
    notes: null,
    status: "scheduled",
  },
];

export function getDemoAcademyPublicData(): PublicAcademyData {
  const featuredPlayers: FeaturedPlayer[] = DEMO_EXPLORE_PLAYERS.map((player) => ({
    slug: player.slug,
    first_name: player.first_name,
    last_name: player.last_name,
    position: player.position,
    passport_score: player.passport_score,
    photo_url: player.photo_url,
  }));

  return {
    academy: DEMO_ACADEMY_PROFILE,
    stats: {
      totalPlayers: DEMO_EXPLORE_PLAYERS.length,
      totalSeasons: 1,
      totalMatches: DEMO_EXPLORE_PLAYERS[0]?.season_stats.matches ?? 14,
    },
    featuredPlayers,
    upcomingMatches: DEMO_ACADEMY_UPCOMING,
  };
}
