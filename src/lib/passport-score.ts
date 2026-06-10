import type { Player, PlayerSeasonStat } from "@/types/database";

export type PassportTier = "elite" | "pro" | "desarrollo" | "base";

export interface PassportTierStyle {
  tier: PassportTier;
  label: string;
  scoreText: string;
  scoreTextOnDark: string;
  badgeBg: string;
  badgeText: string;
  accent: string;
  progressFill: string;
  progressFillOnDark: string;
  /** @deprecated Use surface styling in PassportScoreDisplay */
  panelBg: string;
  /** @deprecated Use surface styling in PassportScoreDisplay */
  panelBorder: string;
  /** @deprecated Use progressFill */
  segmentFilled: string;
  /** @deprecated Use progress track in component */
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

  const contribution = options.goals + options.assists;
  const contributionLine =
    contribution > 0
      ? `Este partido: +${contribution} (${options.goals}G · ${options.assists}A)`
      : null;

  return [
    `Actualización de partido · ${options.firstName} ${options.lastName}`,
    `vs ${options.opponent}`,
    `${options.goals}G · ${options.assists}A · ${options.minutes} min`,
    contributionLine,
    deltaLine,
    `Ver progreso completo: ${options.fichaUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
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
      scoreText: "text-amber-600",
      scoreTextOnDark: "text-amber-300",
      badgeBg: "bg-amber-50",
      badgeText: "text-amber-700",
      accent: "#d97706",
      progressFill: "bg-amber-500",
      progressFillOnDark: "bg-amber-400",
      panelBg: "bg-white",
      panelBorder: "border-slate-200",
      segmentFilled: "bg-amber-500",
      segmentEmpty: "bg-slate-100",
    };
  }

  if (value >= 65) {
    return {
      tier: "pro",
      label: "En ascenso",
      scoreText: "text-emerald-600",
      scoreTextOnDark: "text-emerald-300",
      badgeBg: "bg-emerald-50",
      badgeText: "text-emerald-700",
      accent: "#059669",
      progressFill: "bg-emerald-500",
      progressFillOnDark: "bg-emerald-400",
      panelBg: "bg-white",
      panelBorder: "border-slate-200",
      segmentFilled: "bg-emerald-500",
      segmentEmpty: "bg-slate-100",
    };
  }

  if (value >= 50) {
    return {
      tier: "desarrollo",
      label: "En progreso",
      scoreText: "text-[#1B4F8C]",
      scoreTextOnDark: "text-sky-200",
      badgeBg: "bg-sky-50",
      badgeText: "text-[#1B4F8C]",
      accent: "#1B4F8C",
      progressFill: "bg-[#1B4F8C]",
      progressFillOnDark: "bg-sky-400",
      panelBg: "bg-white",
      panelBorder: "border-slate-200",
      segmentFilled: "bg-[#1B4F8C]",
      segmentEmpty: "bg-slate-100",
    };
  }

  return {
    tier: "base",
    label: "Comenzando",
    scoreText: "text-slate-500",
    scoreTextOnDark: "text-slate-300",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-600",
    accent: "#64748b",
    progressFill: "bg-slate-400",
    progressFillOnDark: "bg-slate-400",
    panelBg: "bg-white",
    panelBorder: "border-slate-200",
    segmentFilled: "bg-slate-400",
    segmentEmpty: "bg-slate-100",
  };
}

export function getPassportFilledSegments(score: number, total = 10) {
  return Math.round((clampPassportScore(score) / 100) * total);
}

export function getPassportBarClass(score: number) {
  return getPassportTier(score).progressFill;
}
