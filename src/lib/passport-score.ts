import type { Player, PlayerSeasonStat } from "@/types/database";

export type PassportTier = "elite" | "pro" | "desarrollo" | "base";

export interface PassportTierStyle {
  tier: PassportTier;
  label: string;
  scoreText: string;
  badgeBg: string;
  badgeText: string;
  panelBg: string;
  panelBorder: string;
  accent: string;
  segmentFilled: string;
  segmentEmpty: string;
}

export interface PassportScoreInput {
  photo_url: string | null;
  video_url: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  stats: Pick<
    PlayerSeasonStat,
    | "total_matches"
    | "total_goals"
    | "total_assists"
    | "total_minutes"
    | "total_yellow_cards"
    | "total_red_cards"
  > | null;
}

export function calculatePassportScore(input: PassportScoreInput): number {
  const stats = input.stats ?? {
    total_matches: 0,
    total_goals: 0,
    total_assists: 0,
    total_minutes: 0,
    total_yellow_cards: 0,
    total_red_cards: 0,
  };

  let score = 0;

  if (input.photo_url) score += 10;
  if (input.video_url) score += 10;
  if (input.height_cm) score += 5;
  if (input.weight_kg) score += 5;

  if (stats.total_matches > 0) score += 5;
  score += Math.min(25, stats.total_matches * 5);
  score += Math.min(25, stats.total_goals * 4);
  score += Math.min(15, stats.total_assists * 3);
  score += Math.min(10, Math.floor(stats.total_minutes / 45));
  score -= stats.total_red_cards * 8;
  score -= stats.total_yellow_cards * 2;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculatePassportScoreForPlayer(
  player: Pick<
    Player,
    "photo_url" | "video_url" | "height_cm" | "weight_kg"
  >,
  stats: PlayerSeasonStat | null | undefined,
) {
  return calculatePassportScore({
    photo_url: player.photo_url,
    video_url: player.video_url,
    height_cm: player.height_cm,
    weight_kg: player.weight_kg,
    stats: stats ?? null,
  });
}

export function buildMatchUpdateWhatsAppMessage(options: {
  firstName: string;
  lastName: string;
  opponent: string;
  goals: number;
  assists: number;
  minutes: number;
  passportScore: number;
  previousPassportScore?: number;
  fichaUrl: string;
}) {
  const delta =
    options.previousPassportScore !== undefined
      ? options.passportScore - options.previousPassportScore
      : 0;

  const deltaLine =
    delta > 0
      ? `Passport Score: ${options.passportScore} (+${delta})`
      : `Passport Score: ${options.passportScore}`;

  return [
    `Actualización de partido · ${options.firstName} ${options.lastName}`,
    `vs ${options.opponent}`,
    `${options.goals}G · ${options.assists}A · ${options.minutes} min`,
    deltaLine,
    `Ver ficha: ${options.fichaUrl}`,
  ].join("\n");
}

export function clampPassportScore(score: number) {
  return Math.min(Math.max(score, 0), 100);
}

export function getPassportTier(score: number): PassportTierStyle {
  const value = clampPassportScore(score);

  if (value >= 80) {
    return {
      tier: "elite",
      label: "Consolidado",
      scoreText: "text-amber-300",
      badgeBg: "bg-gradient-to-r from-amber-500 to-yellow-400",
      badgeText: "text-slate-950",
      panelBg: "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800",
      panelBorder: "border-amber-400/40",
      accent: "#fbbf24",
      segmentFilled: "bg-amber-400",
      segmentEmpty: "bg-white/10",
    };
  }

  if (value >= 65) {
    return {
      tier: "pro",
      label: "En ascenso",
      scoreText: "text-mf-accent-bright",
      badgeBg: "bg-gradient-to-r from-mf-accent-dark to-mf-accent",
      badgeText: "text-slate-950",
      panelBg: "bg-gradient-to-br from-[#0a1f3d] via-[#0f2d52] to-[#163a66]",
      panelBorder: "border-mf-accent/30",
      accent: "#34d399",
      segmentFilled: "bg-mf-accent",
      segmentEmpty: "bg-white/10",
    };
  }

  if (value >= 50) {
    return {
      tier: "desarrollo",
      label: "En progreso",
      scoreText: "text-amber-200",
      badgeBg: "bg-gradient-to-r from-amber-600 to-orange-500",
      badgeText: "text-white",
      panelBg: "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800",
      panelBorder: "border-amber-500/30",
      accent: "#f59e0b",
      segmentFilled: "bg-amber-400",
      segmentEmpty: "bg-white/10",
    };
  }

  return {
    tier: "base",
    label: "Comenzando",
    scoreText: "text-slate-200",
    badgeBg: "bg-gradient-to-r from-slate-600 to-slate-500",
    badgeText: "text-white",
    panelBg: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
    panelBorder: "border-slate-500/30",
    accent: "#94a3b8",
    segmentFilled: "bg-slate-400",
    segmentEmpty: "bg-white/10",
  };
}

export function getPassportFilledSegments(score: number, total = 10) {
  return Math.round((clampPassportScore(score) / 100) * total);
}

export function getPassportBarClass(score: number) {
  const tier = getPassportTier(score);
  if (tier.tier === "elite") return "bg-amber-400";
  if (tier.tier === "pro") return "bg-mf-accent";
  if (tier.tier === "desarrollo") return "bg-amber-400";
  return "bg-slate-400";
}
