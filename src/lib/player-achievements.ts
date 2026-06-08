import { getPassportTier, type PassportTier } from "@/lib/passport-score";
import type { PlayerSeasonStat } from "@/types/database";

export type AchievementRarity = "common" | "rare" | "epic";

export interface AchievementDefinition {
  key: string;
  title: string;
  description: string;
  rarity: AchievementRarity;
  emoji: string;
}

export const ACHIEVEMENT_DEFINITIONS: Record<string, AchievementDefinition> = {
  first_match: {
    key: "first_match",
    title: "Primera titularidad",
    description: "Primer partido registrado en MiFicha.",
    rarity: "common",
    emoji: "🏟️",
  },
  first_goal: {
    key: "first_goal",
    title: "Primer gol",
    description: "Anotó su primer gol verificado.",
    rarity: "common",
    emoji: "⚽",
  },
  first_assist: {
    key: "first_assist",
    title: "Primera asistencia",
    description: "Registró su primera asistencia.",
    rarity: "common",
    emoji: "🎯",
  },
  brace: {
    key: "brace",
    title: "Doblete",
    description: "Dos goles en un mismo partido.",
    rarity: "rare",
    emoji: "🔥",
  },
  hat_trick: {
    key: "hat_trick",
    title: "Hat-trick",
    description: "Tres goles en un mismo partido.",
    rarity: "epic",
    emoji: "👑",
  },
  playmaker: {
    key: "playmaker",
    title: "Creador de juego",
    description: "Dos o más asistencias en un partido.",
    rarity: "rare",
    emoji: "🧠",
  },
  ironman: {
    key: "ironman",
    title: "Ironman",
    description: "60+ minutos en un partido.",
    rarity: "rare",
    emoji: "💪",
  },
  team_mvp: {
    key: "team_mvp",
    title: "MVP del partido",
    description: "Mejor contribución (G+A) del equipo.",
    rarity: "rare",
    emoji: "⭐",
  },
  streak_3: {
    key: "streak_3",
    title: "En racha",
    description: "Tres partidos seguidos con stats registradas.",
    rarity: "rare",
    emoji: "📈",
  },
  tier_pro: {
    key: "tier_pro",
    title: "En ascenso",
    description: "Passport Score tier Pro (65+).",
    rarity: "rare",
    emoji: "🚀",
  },
  tier_elite: {
    key: "tier_elite",
    title: "Consolidado",
    description: "Passport Score tier Elite (80+).",
    rarity: "epic",
    emoji: "🏆",
  },
};

export interface MatchCaptureAchievementInput {
  player_id: string;
  goals: number;
  assists: number;
  minutes: number;
  passport_score: number;
  previous_passport_score: number;
}

export interface EvaluateMatchAchievementsInput {
  matchId: string;
  seasonId: string;
  captures: MatchCaptureAchievementInput[];
  seasonStatsByPlayer: Map<string, PlayerSeasonStat | null>;
  existingKeysByPlayer: Map<string, Set<string>>;
  streakMatchesByPlayer: Map<string, number>;
  mvpPlayerIds: Set<string>;
}

export function getAchievementDefinition(key: string): AchievementDefinition | null {
  return ACHIEVEMENT_DEFINITIONS[key] ?? null;
}

export function getTierFromScore(score: number): PassportTier {
  return getPassportTier(score).tier;
}

export function evaluateNewAchievementKeys(
  capture: MatchCaptureAchievementInput,
  context: Omit<
    EvaluateMatchAchievementsInput,
    "captures" | "seasonStatsByPlayer" | "existingKeysByPlayer" | "streakMatchesByPlayer" | "mvpPlayerIds"
  > & {
    seasonStats: PlayerSeasonStat | null | undefined;
    existingKeys: Set<string>;
    streakMatches: number;
    isTeamMvp: boolean;
  },
): string[] {
  const unlocked: string[] = [];
  const { goals, assists, minutes, passport_score, previous_passport_score } = capture;
  const stats = context.seasonStats;
  const has = (key: string) => context.existingKeys.has(key);
  const add = (key: string) => {
    if (!has(key) && ACHIEVEMENT_DEFINITIONS[key]) {
      unlocked.push(key);
    }
  };

  if (stats?.total_matches === 1) add("first_match");
  if (stats?.total_goals === 1 && goals > 0) add("first_goal");
  if (stats?.total_assists === 1 && assists > 0) add("first_assist");

  if (goals >= 2) add("brace");
  if (goals >= 3) add("hat_trick");
  if (assists >= 2) add("playmaker");
  if (minutes >= 60) add("ironman");
  if (context.isTeamMvp && goals + assists > 0) add("team_mvp");
  if (context.streakMatches >= 3) add("streak_3");

  const prevTier = getTierFromScore(previous_passport_score);
  const nextTier = getTierFromScore(passport_score);

  if (prevTier !== "pro" && prevTier !== "elite" && (nextTier === "pro" || nextTier === "elite")) {
    add("tier_pro");
  }
  if (prevTier !== "elite" && nextTier === "elite") {
    add("tier_elite");
  }

  return unlocked;
}

export function resolveTeamMvpPlayerIds(
  captures: Array<Pick<MatchCaptureAchievementInput, "player_id" | "goals" | "assists">>,
): Set<string> {
  let best = 0;
  let ids: string[] = [];

  for (const capture of captures) {
    const contribution = capture.goals + capture.assists;
    if (contribution === 0) continue;

    if (contribution > best) {
      best = contribution;
      ids = [capture.player_id];
    } else if (contribution === best) {
      ids.push(capture.player_id);
    }
  }

  return new Set(ids);
}

export function pickPrimaryAchievementKey(keys: string[]) {
  const rarityOrder = { epic: 0, rare: 1, common: 2 } as const;

  return [...keys].sort((a, b) => {
    const defA = ACHIEVEMENT_DEFINITIONS[a];
    const defB = ACHIEVEMENT_DEFINITIONS[b];
    const rankA = defA ? rarityOrder[defA.rarity] : 99;
    const rankB = defB ? rarityOrder[defB.rarity] : 99;
    return rankA - rankB;
  })[0];
}

export function buildWeeklyRankShareLine(options: {
  rank: number;
  total: number;
  positionsDelta: number | null;
}) {
  const base = `#${options.rank} en plantel esta semana (${options.total} jugadores)`;

  if (options.positionsDelta === null || options.positionsDelta === 0) {
    return base;
  }

  if (options.positionsDelta > 0) {
    return `${base} · Subió ${options.positionsDelta} puesto${options.positionsDelta === 1 ? "" : "s"}`;
  }

  return `${base} · Bajó ${Math.abs(options.positionsDelta)} puesto${Math.abs(options.positionsDelta) === 1 ? "" : "s"}`;
}

export function buildAchievementShareLine(keys: string[]) {
  if (keys.length === 0) return null;

  const titles = keys
    .map((key) => ACHIEVEMENT_DEFINITIONS[key]?.title)
    .filter(Boolean)
    .slice(0, 3);

  if (titles.length === 0) return null;
  return `Insignia${titles.length > 1 ? "s" : ""}: ${titles.join(" · ")}`;
}

export function buildMatchRewardsWhatsAppMessage(options: {
  firstName: string;
  lastName: string;
  opponent: string;
  goals: number;
  assists: number;
  minutes: number;
  passportScore: number;
  previousPassportScore?: number;
  fichaUrl: string;
  achievementKeys?: string[];
  achievementShareUrl?: string | null;
  weeklyRankLine?: string | null;
}) {
  const delta =
    options.previousPassportScore !== undefined
      ? options.passportScore - options.previousPassportScore
      : 0;

  const deltaLine =
    delta > 0
      ? `Passport Score: ${options.passportScore} (+${delta})`
      : `Passport Score: ${options.passportScore}`;

  const achievementLine = options.achievementKeys?.length
    ? buildAchievementShareLine(options.achievementKeys)
    : null;

  return [
    `Actualización de partido · ${options.firstName} ${options.lastName}`,
    `vs ${options.opponent}`,
    `${options.goals}G · ${options.assists}A · ${options.minutes} min`,
    options.weeklyRankLine,
    achievementLine,
    options.achievementShareUrl
      ? `Tarjeta del logro: ${options.achievementShareUrl}`
      : null,
    deltaLine,
    `Ver progreso completo: ${options.fichaUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const RARITY_STYLES: Record<
  AchievementRarity,
  { border: string; bg: string; text: string; glow: string }
> = {
  common: {
    border: "border-slate-200",
    bg: "bg-slate-50",
    text: "text-slate-700",
    glow: "shadow-slate-200/50",
  },
  rare: {
    border: "border-sky-300",
    bg: "bg-sky-50",
    text: "text-sky-900",
    glow: "shadow-sky-200/60",
  },
  epic: {
    border: "border-amber-300",
    bg: "bg-gradient-to-br from-amber-50 to-orange-50",
    text: "text-amber-950",
    glow: "shadow-amber-200/70",
  },
};
