export type CaptureStyle = "quick" | "detailed";
export type RosterListMode = "convocados" | "all";

export interface PlayerCapture {
  player_id: string;
  played: boolean;
  minutes: number;
  goals: number;
  assists: number;
  yellow: boolean;
  red: boolean;
}

export const MINUTE_ROLE_PRESETS = [
  { id: "starter", label: "Titular 90", minutes: 90 },
  { id: "partial", label: "Parcial 60", minutes: 60 },
  { id: "second_half", label: "2° tiempo 45", minutes: 45 },
  { id: "late", label: "Entró tarde 20", minutes: 20 },
] as const;

export const DETAILED_MINUTE_PRESETS = [45, 60, 90] as const;

export function createEmptyCapture(playerId: string): PlayerCapture {
  return {
    player_id: playerId,
    played: false,
    minutes: 0,
    goals: 0,
    assists: 0,
    yellow: false,
    red: false,
  };
}

export function createCapturesForPlayers(playerIds: string[]): PlayerCapture[] {
  return playerIds.map(createEmptyCapture);
}

export function applyCapturePatch(
  capture: PlayerCapture,
  patch: Partial<PlayerCapture>,
): PlayerCapture {
  const next = { ...capture, ...patch };
  const hasActivity =
    next.goals > 0 || next.assists > 0 || next.minutes > 0 || next.played;

  if (hasActivity) {
    next.played = true;
    if (next.minutes === 0 && (next.goals > 0 || next.assists > 0)) {
      next.minutes = 45;
    }
  }

  if (!next.played) {
    next.minutes = 0;
    next.goals = 0;
    next.assists = 0;
    next.yellow = false;
    next.red = false;
  }

  return next;
}

export function markPlayedWithMinutes(
  capture: PlayerCapture,
  minutes: number,
): PlayerCapture {
  return applyCapturePatch(capture, { played: true, minutes });
}

export function toggleConvocadoId(current: string[], playerId: string): string[] {
  return current.includes(playerId)
    ? current.filter((id) => id !== playerId)
    : [...current, playerId];
}

export function sumPlayerGoals(captures: PlayerCapture[]): number {
  return captures.reduce((total, item) => total + item.goals, 0);
}
