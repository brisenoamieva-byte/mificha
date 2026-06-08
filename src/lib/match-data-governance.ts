import type { Match, MatchResult } from "@/types/database";
import { getMatchResultLabel } from "@/lib/match-utils";

export type MatchDataSource = "organizer" | "academy";

export interface MatchGovernanceInfo {
  isOfficial: boolean;
  hasOfficialResult: boolean;
  resultLocked: boolean;
  scoreSource: MatchDataSource;
  statsSource: MatchDataSource;
}

export function getMatchGovernance(match: Pick<
  Match,
  "is_official" | "result" | "goals_for" | "goals_against" | "result_locked_at"
>): MatchGovernanceInfo {
  const isOfficial = match.is_official === true;
  const hasOfficialResult =
    isOfficial &&
    match.result != null &&
    match.goals_for != null &&
    match.goals_against != null;

  return {
    isOfficial,
    hasOfficialResult,
    resultLocked: Boolean(match.result_locked_at),
    scoreSource: isOfficial ? "organizer" : "academy",
    statsSource: "academy",
  };
}

export function formatOfficialScoreLine(match: Pick<
  Match,
  "result" | "goals_for" | "goals_against"
>) {
  if (match.result == null || match.goals_for == null || match.goals_against == null) {
    return null;
  }

  return `${match.goals_for}-${match.goals_against} · ${getMatchResultLabel(match.result)}`;
}

export function canAcademyCompleteOfficialCapture(
  match: Pick<
    Match,
    "is_official" | "result" | "goals_for" | "goals_against" | "result_locked_at"
  >,
) {
  const governance = getMatchGovernance(match);
  if (!governance.isOfficial) return true;
  return governance.hasOfficialResult;
}

export function buildAcademyCaptureBlockedMessage(
  match: Pick<Match, "is_official" | "result">,
) {
  if (!match.is_official || match.result != null) return null;

  return "El marcador oficial lo publica el organizador del torneo (MiFicha). Cuando esté disponible podrás capturar convocados y stats del plantel.";
}

export const MATCH_DATA_GOVERNANCE_SUMMARY = {
  organizer: [
    "Calendario y jornadas (rival, fecha, sede, categoría)",
    "Marcador final (goles a favor / en contra, resultado W-D-L)",
    "Próximo: acta del anotador (goles, asistencias y tarjetas por jugador)",
  ],
  academy: [
    "Plantel, consentimiento y ficha pública",
    "Convocados y minutos jugados por partido",
    "Captura técnica de G/A/tarjetas hasta acta oficial del organizador",
  ],
} as const;
