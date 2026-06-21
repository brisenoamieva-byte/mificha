import type { MatchPerformanceRow } from "@/lib/performance-analytics";
import { getPositionLabel } from "@/lib/dashboard-utils";
import type { Player, PlayerPosition, PlayerSeasonStat } from "@/types/database";

export const COACH_NOTES_MAX_LENGTH = 280;

export const TRAIT_LABELS = {
  technical: "Técnica",
  tactical: "Táctica",
  physical: "Físico",
  attitude: "Actitud",
} as const;

export const VERIFIED_RADAR_LABELS = [
  "Participación",
  "Aporte",
  "Minutos",
  "Disciplina",
] as const;

export type PlayerCoachTraits = Pick<
  Player,
  | "secondary_position"
  | "trait_technical"
  | "trait_tactical"
  | "trait_physical"
  | "trait_attitude"
  | "coach_notes"
>;

export interface ParticipationBreakdown {
  starts: number;
  subs: number;
  noMinutes: number;
  total: number;
}

export interface RadarSeries {
  label: string;
  values: number[];
  color: string;
  fillOpacity?: number;
}

export function clampTrait(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) return null;
  return Math.max(1, Math.min(10, Math.round(value)));
}

export function parseTraitInput(value: string): number | null {
  if (!value.trim()) return null;
  return clampTrait(Number(value));
}

export function hasCoachVisualProfile(player: PlayerCoachTraits): boolean {
  return Boolean(
    player.secondary_position ||
      player.trait_technical ||
      player.trait_tactical ||
      player.trait_physical ||
      player.trait_attitude ||
      player.coach_notes?.trim(),
  );
}

export function getCoachTraitValues(player: PlayerCoachTraits): number[] | null {
  const values = [
    player.trait_technical,
    player.trait_tactical,
    player.trait_physical,
    player.trait_attitude,
  ].map((value) => clampTrait(value));

  if (values.every((value) => value == null)) {
    return null;
  }

  return values.map((value) => value ?? 0);
}

export function computeParticipationBreakdown(
  rows: Pick<MatchPerformanceRow, "minutes">[],
): ParticipationBreakdown {
  let starts = 0;
  let subs = 0;
  let noMinutes = 0;

  for (const row of rows) {
    if (row.minutes >= 45) starts += 1;
    else if (row.minutes > 0) subs += 1;
    else noMinutes += 1;
  }

  return { starts, subs, noMinutes, total: rows.length };
}

export function computeVerifiedRadarValues(
  stats: Pick<
    PlayerSeasonStat,
    | "total_matches"
    | "total_goals"
    | "total_assists"
    | "total_minutes"
    | "total_yellow_cards"
    | "total_red_cards"
  > | null,
): number[] {
  const safe = stats ?? {
    total_matches: 0,
    total_goals: 0,
    total_assists: 0,
    total_minutes: 0,
    total_yellow_cards: 0,
    total_red_cards: 0,
  };

  const participation = Math.min(10, safe.total_matches * 2);
  const contribution = Math.min(10, safe.total_goals * 2.5 + safe.total_assists * 2);
  const minutesScore = Math.min(10, safe.total_minutes / 36);
  const discipline = Math.max(
    0,
    10 - safe.total_yellow_cards * 1.5 - safe.total_red_cards * 4,
  );

  return [
    Math.round(participation * 10) / 10,
    Math.round(contribution * 10) / 10,
    Math.round(minutesScore * 10) / 10,
    Math.round(discipline * 10) / 10,
  ];
}

export function buildCoachRadarSeries(player: PlayerCoachTraits): RadarSeries | null {
  const values = getCoachTraitValues(player);
  if (!values) return null;

  return {
    label: "Evaluación academia",
    values,
    color: "#1B4F8C",
    fillOpacity: 0.2,
  };
}

export function buildVerifiedRadarSeries(
  stats: PlayerSeasonStat | null,
): RadarSeries {
  return {
    label: "Stats del acta",
    values: computeVerifiedRadarValues(stats),
    color: "#059669",
    fillOpacity: 0.18,
  };
}

export function formatPositionPair(
  primary: PlayerPosition,
  secondary: PlayerPosition | null,
): string {
  const primaryLabel = getPositionLabel(primary);
  if (!secondary || secondary === primary) {
    return primaryLabel;
  }

  return `${primaryLabel} · ${getPositionLabel(secondary)}`;
}

/** Zone coordinates on a simplified pitch (percent 0-100). */
export const POSITION_FIELD_ZONES: Record<
  PlayerPosition,
  { x: number; y: number; label: string }
> = {
  goalkeeper: { x: 50, y: 88, label: "POR" },
  defender: { x: 50, y: 68, label: "DEF" },
  midfielder: { x: 50, y: 42, label: "MED" },
  forward: { x: 50, y: 18, label: "DEL" },
};

export function playerHasPhoto(player: Pick<Player, "photo_url">): boolean {
  return Boolean(player.photo_url?.trim());
}

export function playerIsShareableWithPhoto(
  player: Pick<Player, "is_public" | "public_consent_at" | "photo_url">,
): boolean {
  return Boolean(player.is_public && player.public_consent_at && playerHasPhoto(player));
}
