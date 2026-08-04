/**
 * Acta en cancha — Fase 1 (dominio).
 * Spec: docs/acta-en-cancha-fase-1.md
 * SQL: supabase/match-acta-session.sql
 */

export const ACTA_SESSION_STATUSES = [
  "lineup",
  "capturing",
  "review",
  "pending_signatures",
  "published",
  "disputed",
  "cancelled",
] as const;

export type ActaSessionStatus = (typeof ACTA_SESSION_STATUSES)[number];

export const ACTA_SIDES = ["home", "away"] as const;
export type ActaSide = (typeof ACTA_SIDES)[number];

export const ACTA_LINEUP_ROLES = ["starter", "bench"] as const;
export type ActaLineupRole = (typeof ACTA_LINEUP_ROLES)[number];

export const ACTA_EVENT_TYPES = [
  "goal",
  "own_goal",
  "assist",
  "yellow_card",
  "red_card",
  "second_yellow",
  "sub_out",
  "sub_in",
] as const;

export type ActaEventType = (typeof ACTA_EVENT_TYPES)[number];

export const ACTA_SIGNER_ROLES = [
  "referee",
  "home_delegate",
  "away_delegate",
] as const;

export type ActaSignerRole = (typeof ACTA_SIGNER_ROLES)[number];

export const ACTA_SIGN_DECISIONS = ["accept", "object"] as const;
export type ActaSignDecision = (typeof ACTA_SIGN_DECISIONS)[number];

/** Transiciones permitidas en Fase 1. */
export const ACTA_STATUS_TRANSITIONS: Record<
  ActaSessionStatus,
  readonly ActaSessionStatus[]
> = {
  lineup: ["capturing", "cancelled"],
  capturing: ["review", "lineup", "cancelled"],
  review: ["capturing", "pending_signatures", "cancelled"],
  pending_signatures: ["published", "disputed", "cancelled"],
  disputed: ["published", "cancelled"],
  published: [],
  cancelled: [],
};

export const ACTA_MIN_STARTERS = 7;
export const ACTA_DEFAULT_MATCH_MINUTES = 90;
export const ACTA_REFEREE_TOKEN_TTL_HOURS = 12;
export const ACTA_SIGN_TOKEN_TTL_HOURS = 2;

export const ACTA_EVENT_LABELS: Record<ActaEventType, string> = {
  goal: "Gol",
  own_goal: "Autogol",
  assist: "Asistencia",
  yellow_card: "Amarilla",
  red_card: "Roja",
  second_yellow: "Segunda amarilla",
  sub_out: "Sale",
  sub_in: "Entra",
};

export const ACTA_STATUS_LABELS: Record<ActaSessionStatus, string> = {
  lineup: "Alineación",
  capturing: "Captura",
  review: "Revisión",
  pending_signatures: "Firmas pendientes",
  published: "Publicada",
  disputed: "En disputa",
  cancelled: "Cancelada",
};

export function canTransitionActaStatus(
  from: ActaSessionStatus,
  to: ActaSessionStatus,
) {
  return ACTA_STATUS_TRANSITIONS[from].includes(to);
}

export function isActaEditable(status: ActaSessionStatus) {
  return status === "lineup" || status === "capturing" || status === "review";
}

export function isActaLocked(status: ActaSessionStatus) {
  return status === "published" || status === "cancelled";
}

/** Eventos que suman al marcador del lado indicado (tras resolver autogol). */
export function scoreDeltaForEvent(
  eventType: ActaEventType,
  side: ActaSide,
): { home: number; away: number } {
  if (eventType === "goal") {
    return side === "home" ? { home: 1, away: 0 } : { home: 0, away: 1 };
  }
  if (eventType === "own_goal") {
    // Autogol de home suma al away, y viceversa
    return side === "home" ? { home: 0, away: 1 } : { home: 1, away: 0 };
  }
  return { home: 0, away: 0 };
}

export interface ActaEventLike {
  event_type: ActaEventType;
  side: ActaSide;
  voided_at?: string | null;
}

export function computeScoreFromEvents(events: ActaEventLike[]) {
  return events
    .filter((event) => !event.voided_at)
    .reduce(
      (acc, event) => {
        const delta = scoreDeltaForEvent(event.event_type, event.side);
        return {
          home: acc.home + delta.home,
          away: acc.away + delta.away,
        };
      },
      { home: 0, away: 0 },
    );
}

export interface ActaLineupLike {
  id: string;
  side: ActaSide;
  role: ActaLineupRole;
  player_id?: string | null;
}

export interface ActaTimedEventLike {
  event_type: ActaEventType;
  side: ActaSide;
  lineup_id?: string | null;
  minute: number;
  voided_at?: string | null;
}

/**
 * Minutos estimados Fase 1: titulares 90' salvo salida/roja; banca 0 salvo entrada.
 */
export function estimateMinutesFromLineup(
  lineups: ActaLineupLike[],
  events: ActaTimedEventLike[],
  matchMinutes = ACTA_DEFAULT_MATCH_MINUTES,
): Map<string, number> {
  const active = events.filter((event) => !event.voided_at);
  const minutes = new Map<string, number>();

  for (const row of lineups) {
    minutes.set(row.id, row.role === "starter" ? matchMinutes : 0);
  }

  const subOuts = active
    .filter((event) => event.event_type === "sub_out" && event.lineup_id)
    .sort((a, b) => a.minute - b.minute);

  for (const event of subOuts) {
    if (!event.lineup_id) continue;
    minutes.set(event.lineup_id, Math.max(0, Math.min(matchMinutes, event.minute)));
  }

  const subIns = active
    .filter((event) => event.event_type === "sub_in" && event.lineup_id)
    .sort((a, b) => a.minute - b.minute);

  for (const event of subIns) {
    if (!event.lineup_id) continue;
    minutes.set(
      event.lineup_id,
      Math.max(0, matchMinutes - Math.min(matchMinutes, event.minute)),
    );
  }

  const sendOffs = active.filter(
    (event) =>
      (event.event_type === "red_card" || event.event_type === "second_yellow") &&
      event.lineup_id,
  );

  for (const event of sendOffs) {
    if (!event.lineup_id) continue;
    const current = minutes.get(event.lineup_id) ?? 0;
    minutes.set(event.lineup_id, Math.min(current, Math.max(0, event.minute)));
  }

  return minutes;
}

export interface PlayerStatAggregate {
  player_id: string;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  minutes_played: number;
}

export function aggregatePlayerStatsFromEvents(
  lineups: Array<ActaLineupLike & { player_id?: string | null }>,
  events: Array<
    ActaTimedEventLike & {
      player_id?: string | null;
      related_player_id?: string | null;
    }
  >,
  matchMinutes = ACTA_DEFAULT_MATCH_MINUTES,
): PlayerStatAggregate[] {
  const byPlayer = new Map<string, PlayerStatAggregate>();

  function ensure(playerId: string) {
    let row = byPlayer.get(playerId);
    if (!row) {
      row = {
        player_id: playerId,
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_cards: 0,
        minutes_played: 0,
      };
      byPlayer.set(playerId, row);
    }
    return row;
  }

  const lineupMinutes = estimateMinutesFromLineup(lineups, events, matchMinutes);

  for (const lineup of lineups) {
    if (!lineup.player_id) continue;
    const row = ensure(lineup.player_id);
    row.minutes_played = lineupMinutes.get(lineup.id) ?? 0;
  }

  for (const event of events) {
    if (event.voided_at) continue;
    const playerId = event.player_id;
    if (!playerId) continue;
    const row = ensure(playerId);

    switch (event.event_type) {
      case "goal":
        row.goals += 1;
        break;
      case "assist":
        row.assists += 1;
        break;
      case "yellow_card":
        row.yellow_cards += 1;
        break;
      case "red_card":
      case "second_yellow":
        row.red_cards += 1;
        break;
      default:
        break;
    }

    if (event.event_type === "goal" && event.related_player_id) {
      ensure(event.related_player_id).assists += 1;
    }
  }

  return [...byPlayer.values()];
}

/** Payload canónico para hash de firmas (ordenar keys al serializar). */
export function buildActaPayloadForHash(input: {
  sessionId: string;
  scoreHome: number;
  scoreAway: number;
  events: Array<{
    seq: number;
    minute: number;
    stoppage: number;
    event_type: ActaEventType;
    side: ActaSide;
    lineup_id: string | null;
    related_lineup_id: string | null;
    voided_at: string | null;
  }>;
}) {
  const activeEvents = input.events
    .filter((event) => !event.voided_at)
    .map((event) => ({
      seq: event.seq,
      minute: event.minute,
      stoppage: event.stoppage,
      event_type: event.event_type,
      side: event.side,
      lineup_id: event.lineup_id,
      related_lineup_id: event.related_lineup_id,
    }))
    .sort((a, b) => a.seq - b.seq);

  return {
    session_id: input.sessionId,
    score_home: input.scoreHome,
    score_away: input.scoreAway,
    events: activeEvents,
  };
}

export function countStarters(lineups: ActaLineupLike[], side: ActaSide) {
  return lineups.filter((row) => row.side === side && row.role === "starter").length;
}

export function canStartCapturing(lineups: ActaLineupLike[]) {
  return (
    countStarters(lineups, "home") >= ACTA_MIN_STARTERS &&
    countStarters(lineups, "away") >= ACTA_MIN_STARTERS
  );
}

export function yellowCountForLineup(
  events: Array<{
    event_type: ActaEventType;
    lineup_id?: string | null;
    voided_at?: string | null;
  }>,
  lineupId: string,
) {
  return events.filter(
    (event) =>
      !event.voided_at &&
      event.lineup_id === lineupId &&
      (event.event_type === "yellow_card" || event.event_type === "second_yellow"),
  ).length;
}

export function suggestCardEventType(
  events: Array<{
    event_type: ActaEventType;
    lineup_id?: string | null;
    voided_at?: string | null;
  }>,
  lineupId: string,
  requested: "yellow_card" | "red_card",
): ActaEventType {
  if (requested === "red_card") return "red_card";
  const yellows = yellowCountForLineup(events, lineupId);
  if (yellows >= 1) return "second_yellow";
  return "yellow_card";
}
