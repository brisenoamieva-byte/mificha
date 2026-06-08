import { getPositionLabel } from "@/lib/dashboard-utils";
import {
  calculatePassportScoreForPlayer,
  getPassportTier,
} from "@/lib/passport-score";
import { getProtectedProfileTitle } from "@/lib/privacy";
import type { PublicPlayerData } from "@/lib/public-player";

export interface OgPlayerSharePayload {
  title: string;
  academyName: string;
  seasonName: string | null;
  positionLabel: string;
  passportScore: number;
  passportLabel: string;
  passportAccent: string;
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
  const passportScore = calculatePassportScoreForPlayer(player, currentSeasonStats);
  const tier = getPassportTier(passportScore);
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
    passportScore,
    passportLabel: tier.label,
    passportAccent: tier.accent,
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
  return `${payload.title} · Passport ${payload.passportScore} · MiFicha`;
}
