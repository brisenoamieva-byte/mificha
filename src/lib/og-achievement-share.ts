import { getAchievementDefinition, type AchievementRarity } from "@/lib/player-achievements";
import { getProtectedProfileTitle } from "@/lib/privacy";
import type { PublicPlayerData } from "@/lib/public-player";

export interface OgAchievementSharePayload {
  playerTitle: string;
  academyName: string;
  achievementTitle: string;
  achievementDescription: string;
  emoji: string;
  rarity: AchievementRarity;
  initials: string;
  accent: string;
  badgeLabel: string;
}

const RARITY_OG: Record<
  AchievementRarity,
  { accent: string; badge: string; glow: string }
> = {
  common: {
    accent: "#94a3b8",
    badge: "Insignia verificada",
    glow: "rgba(148, 163, 184, 0.35)",
  },
  rare: {
    accent: "#38bdf8",
    badge: "Insignia rara",
    glow: "rgba(56, 189, 248, 0.4)",
  },
  epic: {
    accent: "#fbbf24",
    badge: "Insignia épica",
    glow: "rgba(251, 191, 36, 0.45)",
  },
};

export function buildOgAchievementSharePayload(
  data: PublicPlayerData,
  achievementKey: string,
): OgAchievementSharePayload | null {
  const achievement = getAchievementDefinition(achievementKey);
  if (!achievement) return null;

  const { player } = data;
  const style = RARITY_OG[achievement.rarity];

  return {
    playerTitle: getProtectedProfileTitle(
      player.first_name,
      player.last_name,
      player.birth_date,
    ),
    academyName: player.academies?.name ?? "Academia verificada",
    achievementTitle: achievement.title,
    achievementDescription: achievement.description,
    emoji: achievement.emoji,
    rarity: achievement.rarity,
    initials: `${player.first_name.charAt(0)}${player.last_name.charAt(0)}`.toUpperCase(),
    accent: style.accent,
    badgeLabel: style.badge,
  };
}

export function buildOgAchievementImageAlt(payload: OgAchievementSharePayload) {
  return `${payload.playerTitle} · ${payload.achievementTitle} · MiFicha`;
}
