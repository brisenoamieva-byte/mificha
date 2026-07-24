import type { Match, MatchResult } from "@/types/database";
import { getMatchResultLabel } from "@/lib/match-utils";

export type MatchActor = "organizer" | "academy" | "mificha" | "parent";
export type MatchDataSource = "organizer" | "academy" | "mificha";
export type AcademyCaptureScope = "full" | "roster_minutes" | "none";

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
    "Datos oficiales del torneo: el organizador publica calendario, marcador y acta; MiFicha sincroniza cada jugador con su plantel, actualiza Passport e insignias y avisa al tutor. La academia carga plantel y consentimiento — no captura stats del partido.",
  roles: {
    organizer: {
      title: "Organizador del torneo (socio MiFicha)",
      motto: "Fuente oficial del partido — calendario, marcador y acta",
    },
    academy: {
      title: "Academia / entrenador",
      motto: "Plantel, consentimiento y contacto del tutor",
    },
    mificha: {
      title: "MiFicha (plataforma)",
      motto: "Aplica el acta oficial a cada ficha — Passport, insignias y avisos",
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
      label: "Acta oficial: goles, asistencias, tarjetas y minutos por jugador",
      owner: "organizer",
      why: "Misma fuente que mesa de control / anotador del torneo interescolar.",
    },
    {
      id: "roster",
      label: "Plantel, fotos, consentimiento, ficha pública",
      owner: "academy",
      why: "Solo la escuela conoce a sus jugadores y al tutor.",
    },
    {
      id: "sync",
      label: "Cruzar acta con plantel, Passport, insignias y aviso al tutor",
      owner: "mificha",
      why: "Stats verificadas sin que cada coach reescriba el partido.",
    },
    {
      id: "passport",
      label: "Progreso de ficha, rankings y ficha pública",
      owner: "mificha",
      why: "Automático a partir del acta oficial — credibilidad ante padres y scouts.",
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
      organizer: ["Publicar jornada en /fut/interno/jornadas"],
      academy: ["Tener plantel cargado y consentimientos listos"],
      mificha: ["Mostrar jornada en dashboard de la academia"],
    },
    {
      phase: "Después del partido (orden fijo)",
      organizer: [
        "1. Registrar marcador oficial",
        "2. Publicar acta completa (G / A / tarjetas / minutos)",
      ],
      academy: [
        "Tener plantel y consentimientos listos antes de la jornada",
        "MiFicha avisa tutores al sincronizar el acta — sin captura manual",
      ],
      mificha: [
        "Aplicar acta al plantel, actualizar Passport e insignias",
        "Enviar aviso automático al tutor",
      ],
    },
  ],
  efficiency: [
    "El organizador publica una sola acta oficial; MiFicha actualiza cientos de fichas.",
    "La academia no reescribe goles ni minutos — solo mantiene plantel y tutores.",
    "MiFicha envía el link con stats del torneo al tutor.",
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
    academyCaptureScope: isOfficial ? "none" : "full",
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

export function canAcademyCaptureMatchStats(
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
  return !getMatchGovernance(match).isOfficial;
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
  return canAcademyCaptureMatchStats(match);
}

export function buildAcademyCaptureBlockedMessage(
  match: Pick<Match, "is_official" | "result" | "acta_published_at">,
) {
  if (!match.is_official) return null;

  if (match.result == null) {
    return "El marcador oficial lo publica el organizador del torneo. MiFicha actualizará las fichas cuando el acta esté disponible.";
  }

  if (!match.acta_published_at) {
    return "El acta oficial (goles, asistencias, tarjetas y minutos) la publica el organizador. MiFicha sincroniza stats y avisa a los tutores.";
  }

  return null;
}

export function buildOfficialStatsSyncNotice() {
  return "Jornada oficial: stats del acta del torneo. MiFicha las aplica a cada ficha — la academia no captura goles ni minutos manualmente.";
}

/** @deprecated use buildOfficialStatsSyncNotice */
export function buildAcademyRosterMinutesNotice() {
  return buildOfficialStatsSyncNotice();
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
