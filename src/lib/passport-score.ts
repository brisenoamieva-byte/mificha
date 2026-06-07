import type { Player, PlayerSeasonStat } from "@/types/database";

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
