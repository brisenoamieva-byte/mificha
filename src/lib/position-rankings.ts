import { locationMatches } from "@/lib/mexico-locations";
import {
  matchesCategoryFilter,
  parseCategoryFilter,
} from "@/lib/player-category";
import type { RankedWeeklyPerformance } from "@/lib/competition";
import type { DirectoryPlayer } from "@/lib/public-directory";
import type { PlayerPosition } from "@/types/database";

export const POSITION_RANKING_ORDER: PlayerPosition[] = [
  "goalkeeper",
  "defender",
  "midfielder",
  "forward",
];

export const POSITION_RANKING_LABELS: Record<
  PlayerPosition,
  { title: string; emoji: string }
> = {
  goalkeeper: { title: "Porteros", emoji: "🧤" },
  defender: { title: "Defensas", emoji: "🛡️" },
  midfielder: { title: "Medios", emoji: "⚙️" },
  forward: { title: "Delanteros", emoji: "⚽" },
};

export type RankingMetric = "passport" | "week";

export function filterPlayersForRankings(
  players: DirectoryPlayer[],
  state = "",
  city = "",
  minPassport = 0,
  categoryFilter = "all",
) {
  const category = parseCategoryFilter(categoryFilter);

  return players.filter((player) => {
    if (state && !locationMatches(player.academies?.state, state)) return false;
    if (city && !locationMatches(player.academies?.city, city)) return false;
    if (player.passport_score < minPassport) return false;
    if (!matchesCategoryFilter(player.birth_date, category)) return false;
    return true;
  });
}

export function filterWeeklyForRankings(
  performances: RankedWeeklyPerformance[],
  state = "",
  city = "",
  categoryFilter = "all",
) {
  const category = parseCategoryFilter(categoryFilter);

  return performances.filter((player) => {
    if (state && !locationMatches(player.academy_state, state)) return false;
    if (city && !locationMatches(player.academy_city, city)) return false;
    if (!matchesCategoryFilter(player.birth_date, category)) return false;
    return true;
  });
}

export function buildPassportRankingsByPosition(
  players: DirectoryPlayer[],
  limit = 5,
): Record<PlayerPosition, DirectoryPlayer[]> {
  const rankings = {} as Record<PlayerPosition, DirectoryPlayer[]>;

  for (const position of POSITION_RANKING_ORDER) {
    rankings[position] = players
      .filter((player) => player.position === position)
      .sort((a, b) => b.passport_score - a.passport_score)
      .slice(0, limit);
  }

  return rankings;
}

export function buildWeeklyRankingsByPosition(
  performances: RankedWeeklyPerformance[],
  limit = 5,
): Record<PlayerPosition, RankedWeeklyPerformance[]> {
  const rankings = {} as Record<PlayerPosition, RankedWeeklyPerformance[]>;

  for (const position of POSITION_RANKING_ORDER) {
    rankings[position] = performances
      .filter((player) => player.position === position)
      .sort((a, b) => b.weekly_score - a.weekly_score)
      .slice(0, limit);
  }

  return rankings;
}

export function getRankingScopeLabel(
  state: string,
  city: string,
  categoryFilter = "all",
) {
  const category = parseCategoryFilter(categoryFilter);
  let label = "México";

  if (city && state) label = `${city}, ${state}`;
  else if (state) label = state;

  if (category.kind === "age") {
    return `${label} · Sub-${category.age}`;
  }

  if (category.kind === "generation") {
    return `${label} · Gen. ${category.year}`;
  }

  return label;
}
