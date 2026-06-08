import type { Match, MatchResult } from "@/types/database";
import { getMatchResultLabel } from "@/lib/match-utils";

export type MatchActor = "organizer" | "academy" | "mificha" | "parent";
export type MatchDataSource = "organizer" | "academy" | "mificha";
export type AcademyCaptureScope = "full" | "roster_minutes";

export interface GovernanceResponsibility {
  id: string;
  label: string;
  owner: MatchActor;
  why: string;
}

export interface MatchGovernanceInfo {
  isOfficial: boolean;
  hasOfficialResult: boolean;
  hasOfficialActa: boolean;
  resultLocked: boolean;
  actaLocked: boolean;
  scoreSource: MatchDataSource;
  individualStatsSource: MatchDataSource;
  academyCaptureScope: AcademyCaptureScope;
}

export const MIFICHA_DATA_GOVERNANCE = {
  principle:
    "Datos comparables y creíbles: lo que define el partido lo registra el organizador; lo que opera el plantel lo registra la academia; MiFicha calcula y muestra.",
  roles: {
    organizer: {
      title: "Organizador del torneo (MiFicha admin / liga)",
      motto: "Fuente oficial del partido",
    },
    academy: {
      title: "Academia / entrenador",
      motto: "Operación del plantel, no árbitro del marcador",
    },
    mificha: {
      title: "MiFicha (plataforma)",
      motto: "Calcula Passport, insignias y rankings — no inventa stats",
    },
    parent: {
      title: "Padres",
      motto: "Consulta y comparte — no captura",
    },
  },
  responsibilities: [
    {
      id: "calendar",
      label: "Calendario, jornadas, rival, sede, categoría",
      owner: "organizer",
      why: "Un solo calendario evita fechas duplicadas y stats incomparables.",
    },
    {
      id: "score",
      label: "Marcador final (resultado W-D-L, goles a favor / en contra)",
      owner: "organizer",
      why: "Ninguna academia debe poder inflar o discutir el resultado del partido.",
    },
    {
      id: "acta",
      label: "Acta: goles, asistencias y tarjetas por jugador",
      owner: "organizer",
      why: "Misma fuente que la mesa de control / anotador del torneo.",
    },
    {
      id: "roster",
      label: "Plantel, fotos, consentimiento, ficha pública",
      owner: "academy",
      why: "Solo la escuela conoce a sus jugadores y al tutor.",
    },
    {
      id: "minutes",
      label: "Convocados y minutos jugados",
      owner: "academy",
      why: "El cuerpo técnico sabe quién entró; es rápido (~1 min) y no compite con el acta.",
    },
    {
      id: "passport",
      label: "Passport Score, insignias, rankings, ficha pública",
      owner: "mificha",
      why: "Automático a partir de datos con origen claro — credibilidad ante padres y scouts.",
    },
    {
      id: "parent_notify",
      label: "Recibir aviso automático post-partido (email o WhatsApp)",
      owner: "parent",
      why: "Con consentimiento + contacto en Plantel; MiFicha envía solo, sin botón manual.",
    },
  ] satisfies GovernanceResponsibility[],
  workflow: [
    {
      phase: "Antes del partido",
      organizer: ["Publicar jornada en /interno/jornadas"],
      academy: ["Tener plantel cargado y consentimientos listos"],
      mificha: ["Mostrar jornada en dashboard de la academia"],
    },
    {
      phase: "Después del partido (orden fijo)",
      organizer: [
        "1. Registrar marcador oficial",
        "2. Publicar acta (G / A / tarjetas por jugador)",
      ],
      academy: [
        "3. Capturar convocados + minutos (solo cuando hay marcador y acta)",
        "4. MiFicha avisa tutores automáticamente — sin WhatsApp manual",
      ],
      mificha: [
        "Passport e insignias se actualizan al completar acta + minutos",
      ],
    },
  ],
  efficiency: [
    "Organizador no captura minutos de 200 jugadores — eso lo hace cada academia en 1 minuto.",
    "Academia no discute marcadores ni actas — solo opera su plantel.",
    "MiFicha no pide app a padres — solo link con preview verificada.",
  ],
  credibility: [
    "Marcador bloqueado por RLS en jornadas is_official.",
    "Goles/tarjetas bloqueados para academias; acta del organizador.",
    "Insignias y rankings solo sobre stats con origen oficial.",
  ],
} as const;

export function getMatchGovernance(
  match: Pick<
    Match,
    | "is_official"
    | "result"
    | "goals_for"
    | "goals_against"
    | "result_locked_at"
    | "acta_published_at"
  > | null,
): MatchGovernanceInfo {
  if (!match) {
    return {
      isOfficial: false,
      hasOfficialResult: false,
      hasOfficialActa: false,
      resultLocked: false,
      actaLocked: false,
      scoreSource: "academy",
      individualStatsSource: "academy",
      academyCaptureScope: "full",
    };
  }

  const isOfficial = match.is_official === true;
  const hasOfficialResult =
    isOfficial &&
    match.result != null &&
    match.goals_for != null &&
    match.goals_against != null;
  const hasOfficialActa = isOfficial && Boolean(match.acta_published_at);

  return {
    isOfficial,
    hasOfficialResult,
    hasOfficialActa,
    resultLocked: Boolean(match.result_locked_at),
    actaLocked: hasOfficialActa,
    scoreSource: isOfficial ? "organizer" : "academy",
    individualStatsSource: isOfficial ? "organizer" : "academy",
    academyCaptureScope: isOfficial ? "roster_minutes" : "full",
  };
}

export function formatOfficialScoreLine(
  match: Pick<Match, "result" | "goals_for" | "goals_against">,
) {
  if (match.result == null || match.goals_for == null || match.goals_against == null) {
    return null;
  }

  return `${match.goals_for}-${match.goals_against} · ${getMatchResultLabel(match.result)}`;
}

export function canAcademyCompleteOfficialCapture(
  match: Pick<
    Match,
    | "is_official"
    | "result"
    | "goals_for"
    | "goals_against"
    | "result_locked_at"
    | "acta_published_at"
  >,
) {
  const governance = getMatchGovernance(match);
  if (!governance.isOfficial) return true;
  return governance.hasOfficialResult && governance.hasOfficialActa;
}

export function buildAcademyCaptureBlockedMessage(
  match: Pick<Match, "is_official" | "result" | "acta_published_at">,
) {
  if (!match.is_official) return null;

  if (match.result == null) {
    return "El marcador oficial lo publica el organizador del torneo (MiFicha). Cuando esté disponible podrás capturar convocados y minutos del plantel.";
  }

  if (!match.acta_published_at) {
    return "El acta oficial (goles, asistencias y tarjetas por jugador) la publica el organizador. Después podrás registrar convocados y minutos (~1 min).";
  }

  return null;
}

export function buildAcademyRosterMinutesNotice() {
  return "Jornada oficial: solo convocados y minutos. Goles, asistencias y tarjetas las publica el organizador en el acta — así el Passport es creíble para todos los colegios.";
}

export function getGovernanceResponsibilitiesFor(actor: MatchActor) {
  return MIFICHA_DATA_GOVERNANCE.responsibilities.filter(
    (item) => item.owner === actor,
  );
}

/** @deprecated use MIFICHA_DATA_GOVERNANCE */
export const MATCH_DATA_GOVERNANCE_SUMMARY = {
  organizer: getGovernanceResponsibilitiesFor("organizer").map((item) => item.label),
  academy: getGovernanceResponsibilitiesFor("academy").map((item) => item.label),
} as const;
