import type { PlayerSeasonStat } from "@/types/database";

/** Textos estándar de la ficha — lenguaje claro, sin jerga interna. */
export const FICHA_COPY = {
  documentTitle: "Ficha de jugador",
  seasonTitle: "Temporada en torneo",
  seasonHint:
    "Partidos, goles y minutos registrados por el organizador del torneo en cada jornada.",
  lastMatch: "Último partido",
  role: "Rol en el equipo",
  coachEval: "Evaluación del entrenador",
  coachEvalHint: "Observación del cuerpo técnico de la academia — no sustituye las stats.",
  verified: "Ficha verificada",
  parentalConsent: "Consentimiento parental",
  insignias: "Insignias",
} as const;

export interface SeasonSummary {
  matches: number;
  goals: number;
  assists: number;
  minutes: number;
  yellowCards: number;
  redCards: number;
  avgMinutesPerMatch: number;
  goalsPer90: number;
  assistsPer90: number;
}

export function computeSeasonSummary(
  stats: Pick<
    PlayerSeasonStat,
    | "total_matches"
    | "total_goals"
    | "total_assists"
    | "total_minutes"
    | "total_yellow_cards"
    | "total_red_cards"
  > | null,
): SeasonSummary {
  const safe = stats ?? {
    total_matches: 0,
    total_goals: 0,
    total_assists: 0,
    total_minutes: 0,
    total_yellow_cards: 0,
    total_red_cards: 0,
  };

  const matches = safe.total_matches;
  const nineties = safe.total_minutes / 90;

  return {
    matches,
    goals: safe.total_goals,
    assists: safe.total_assists,
    minutes: safe.total_minutes,
    yellowCards: safe.total_yellow_cards,
    redCards: safe.total_red_cards,
    avgMinutesPerMatch: matches > 0 ? Math.round(safe.total_minutes / matches) : 0,
    goalsPer90: nineties > 0 ? roundRate(safe.total_goals / nineties) : 0,
    assistsPer90: nineties > 0 ? roundRate(safe.total_assists / nineties) : 0,
  };
}

function roundRate(value: number) {
  return Math.round(value * 100) / 100;
}
