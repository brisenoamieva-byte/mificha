import { createHash, randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTA_DEFAULT_MATCH_MINUTES,
  ACTA_EVENT_TYPES,
  ACTA_MIN_STARTERS,
  ACTA_REFEREE_TOKEN_TTL_HOURS,
  ACTA_SIGN_TOKEN_TTL_HOURS,
  ACTA_SIDES,
  aggregatePlayerStatsFromEvents,
  buildActaPayloadForHash,
  canStartCapturing,
  canTransitionActaStatus,
  computeScoreFromEvents,
  isActaEditable,
  isActaLocked,
  suggestCardEventType,
  type ActaEventType,
  type ActaLineupRole,
  type ActaSessionStatus,
  type ActaSide,
  type ActaSignDecision,
  type ActaSignerRole,
} from "@/lib/match-acta";

export function createActaToken() {
  return randomBytes(32).toString("base64url");
}

export function hashActaToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashActaIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export function getActaAppBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

export function buildRefereeActaUrl(token: string) {
  return `${getActaAppBaseUrl()}/fut/arbitro/${token}`;
}

export function buildSignActaUrl(token: string) {
  return `${getActaAppBaseUrl()}/fut/firmar/${token}`;
}

function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export type ActaSessionRow = {
  id: string;
  home_match_id: string;
  away_match_id: string | null;
  home_academy_id: string;
  away_academy_id: string | null;
  opponent_name: string;
  category: string | null;
  venue_name: string | null;
  kickoff_at: string | null;
  status: ActaSessionStatus;
  referee_token_hash: string;
  home_sign_token_hash: string | null;
  away_sign_token_hash: string | null;
  referee_token_expires_at: string;
  sign_tokens_expires_at: string | null;
  score_home: number | null;
  score_away: number | null;
  payload_hash: string | null;
  referee_name: string | null;
  closed_at: string | null;
  published_at: string | null;
  dispute_note: string | null;
  created_by_email: string | null;
  created_at: string;
  updated_at: string;
};

export type ActaLineupRow = {
  id: string;
  session_id: string;
  side: ActaSide;
  player_id: string | null;
  jersey_number: number | null;
  display_name: string;
  role: ActaLineupRole;
  sort_order: number;
  confirmed_at: string | null;
  created_at: string;
};

export type ActaEventRow = {
  id: string;
  session_id: string;
  seq: number;
  minute: number;
  stoppage: number;
  event_type: ActaEventType;
  side: ActaSide;
  lineup_id: string | null;
  player_id: string | null;
  related_lineup_id: string | null;
  related_player_id: string | null;
  notes: string | null;
  voided_at: string | null;
  void_reason: string | null;
  created_at: string;
};

export type ActaSignatureRow = {
  id: string;
  session_id: string;
  signer_role: ActaSignerRole;
  decision: ActaSignDecision;
  signer_name: string;
  signer_title: string | null;
  objection_note: string | null;
  payload_hash: string;
  ip_hash: string | null;
  user_agent: string | null;
  signed_at: string;
};

export function publicActaSession(session: ActaSessionRow) {
  const {
    referee_token_hash: _r,
    home_sign_token_hash: _h,
    away_sign_token_hash: _a,
    ...safe
  } = session;
  return safe;
}

export async function loadActaBundle(
  admin: SupabaseClient,
  sessionId: string,
) {
  const [{ data: session }, { data: lineups }, { data: events }, { data: signatures }] =
    await Promise.all([
      admin.from("match_acta_sessions").select("*").eq("id", sessionId).maybeSingle(),
      admin
        .from("match_lineups")
        .select("*")
        .eq("session_id", sessionId)
        .order("side", { ascending: true })
        .order("sort_order", { ascending: true }),
      admin
        .from("match_events")
        .select("*")
        .eq("session_id", sessionId)
        .order("seq", { ascending: true }),
      admin
        .from("match_signatures")
        .select("*")
        .eq("session_id", sessionId)
        .order("signed_at", { ascending: true }),
    ]);

  if (!session) return null;

  return {
    session: session as ActaSessionRow,
    lineups: (lineups ?? []) as ActaLineupRow[],
    events: (events ?? []) as ActaEventRow[],
    signatures: (signatures ?? []) as ActaSignatureRow[],
  };
}

export async function findSessionByRefereeToken(
  admin: SupabaseClient,
  token: string,
) {
  const hash = hashActaToken(token);
  const { data, error } = await admin
    .from("match_acta_sessions")
    .select("*")
    .eq("referee_token_hash", hash)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const session = data as ActaSessionRow;
  if (new Date(session.referee_token_expires_at).getTime() < Date.now()) {
    return { session, expired: true as const };
  }

  return { session, expired: false as const };
}

export async function findSessionBySignToken(
  admin: SupabaseClient,
  token: string,
): Promise<{
  session: ActaSessionRow;
  side: ActaSide;
  expired: boolean;
  alreadySigned: boolean;
} | null> {
  const hash = hashActaToken(token);
  const { data: byHome } = await admin
    .from("match_acta_sessions")
    .select("*")
    .eq("home_sign_token_hash", hash)
    .maybeSingle();

  const { data: byAway } =
    byHome == null
      ? await admin
          .from("match_acta_sessions")
          .select("*")
          .eq("away_sign_token_hash", hash)
          .maybeSingle()
      : { data: null };

  const row = (byHome ?? byAway) as ActaSessionRow | null;
  if (!row) return null;

  const side: ActaSide = byHome ? "home" : "away";
  const expired = Boolean(
    row.sign_tokens_expires_at &&
      new Date(row.sign_tokens_expires_at).getTime() < Date.now(),
  );

  const role: ActaSignerRole =
    side === "home" ? "home_delegate" : "away_delegate";
  const { data: existing } = await admin
    .from("match_signatures")
    .select("id")
    .eq("session_id", row.id)
    .eq("signer_role", role)
    .maybeSingle();

  return {
    session: row,
    side,
    expired,
    alreadySigned: Boolean(existing),
  };
}

export function computePayloadHash(input: {
  sessionId: string;
  scoreHome: number;
  scoreAway: number;
  events: ActaEventRow[];
}) {
  const payload = buildActaPayloadForHash({
    sessionId: input.sessionId,
    scoreHome: input.scoreHome,
    scoreAway: input.scoreAway,
    events: input.events.map((event) => ({
      seq: event.seq,
      minute: event.minute,
      stoppage: event.stoppage,
      event_type: event.event_type,
      side: event.side,
      lineup_id: event.lineup_id,
      related_lineup_id: event.related_lineup_id,
      voided_at: event.voided_at,
    })),
  });

  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function resultFromScore(goalsFor: number, goalsAgainst: number) {
  if (goalsFor > goalsAgainst) return "win" as const;
  if (goalsFor < goalsAgainst) return "loss" as const;
  return "draw" as const;
}

export async function createActaSession(
  admin: SupabaseClient,
  input: {
    homeMatchId: string;
    awayAcademyId?: string | null;
    awayMatchId?: string | null;
    createdByEmail?: string | null;
  },
) {
  const { data: match, error: matchError } = await admin
    .from("matches")
    .select(
      "id, academy_id, opponent, match_date, kickoff_at, venue_name, category, is_official, acta_published_at",
    )
    .eq("id", input.homeMatchId)
    .maybeSingle();

  if (matchError) throw new Error(matchError.message);
  if (!match) throw new Error("Partido no encontrado.");
  if (!match.is_official) {
    throw new Error("Solo se puede abrir acta en cancha en jornadas oficiales.");
  }
  if (match.acta_published_at) {
    throw new Error("Este partido ya tiene acta publicada.");
  }

  const { data: existing } = await admin
    .from("match_acta_sessions")
    .select("id, status")
    .eq("home_match_id", match.id)
    .maybeSingle();

  if (existing && existing.status !== "cancelled") {
    throw new Error("Ya existe una sesión de acta para este partido.");
  }

  if (existing?.status === "cancelled") {
    const { error: deleteError } = await admin
      .from("match_acta_sessions")
      .delete()
      .eq("id", existing.id);
    if (deleteError) throw new Error(deleteError.message);
  }

  const refereeToken = createActaToken();
  const insert = {
    home_match_id: match.id,
    away_match_id: input.awayMatchId ?? null,
    home_academy_id: match.academy_id,
    away_academy_id: input.awayAcademyId ?? null,
    opponent_name: match.opponent,
    category: match.category,
    venue_name: match.venue_name,
    kickoff_at: match.kickoff_at,
    status: "lineup" as const,
    referee_token_hash: hashActaToken(refereeToken),
    referee_token_expires_at: hoursFromNow(ACTA_REFEREE_TOKEN_TTL_HOURS),
    created_by_email: input.createdByEmail ?? null,
  };

  const { data: session, error } = await admin
    .from("match_acta_sessions")
    .insert(insert)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return {
    session: session as ActaSessionRow,
    refereeToken,
    refereeUrl: buildRefereeActaUrl(refereeToken),
  };
}

export async function replaceLineupSide(
  admin: SupabaseClient,
  session: ActaSessionRow,
  side: ActaSide,
  players: Array<{
    player_id?: string | null;
    jersey_number?: number | null;
    display_name: string;
    role: ActaLineupRole;
    sort_order?: number;
  }>,
) {
  if (session.status !== "lineup") {
    throw new Error("La alineación solo se edita en estado lineup.");
  }
  if (!ACTA_SIDES.includes(side)) {
    throw new Error("Lado inválido.");
  }

  const starters = players.filter((p) => p.role === "starter").length;
  if (starters < ACTA_MIN_STARTERS) {
    throw new Error(`Se requieren al menos ${ACTA_MIN_STARTERS} titulares por lado.`);
  }

  const { error: deleteError } = await admin
    .from("match_lineups")
    .delete()
    .eq("session_id", session.id)
    .eq("side", side);

  if (deleteError) throw new Error(deleteError.message);

  const rows = players.map((player, index) => ({
    session_id: session.id,
    side,
    player_id: player.player_id ?? null,
    jersey_number: player.jersey_number ?? null,
    display_name: player.display_name.trim(),
    role: player.role,
    sort_order: player.sort_order ?? index,
    confirmed_at: new Date().toISOString(),
  }));

  const { data, error } = await admin.from("match_lineups").insert(rows).select("*");
  if (error) throw new Error(error.message);

  return (data ?? []) as ActaLineupRow[];
}

export async function startCapturingIfReady(
  admin: SupabaseClient,
  sessionId: string,
) {
  const bundle = await loadActaBundle(admin, sessionId);
  if (!bundle) throw new Error("Sesión no encontrada.");
  if (bundle.session.status !== "lineup") return bundle.session;

  if (!canStartCapturing(bundle.lineups)) {
    throw new Error(
      `Confirma al menos ${ACTA_MIN_STARTERS} titulares en cada lado antes de capturar.`,
    );
  }

  if (!canTransitionActaStatus(bundle.session.status, "capturing")) {
    throw new Error("No se puede pasar a captura.");
  }

  const { data, error } = await admin
    .from("match_acta_sessions")
    .update({ status: "capturing" })
    .eq("id", sessionId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as ActaSessionRow;
}

export async function addActaEvent(
  admin: SupabaseClient,
  session: ActaSessionRow,
  input: {
    event_type: ActaEventType;
    side: ActaSide;
    lineup_id: string;
    related_lineup_id?: string | null;
    minute: number;
    stoppage?: number;
    notes?: string | null;
  },
) {
  if (session.status !== "capturing" && session.status !== "review") {
    throw new Error("Solo se agregan eventos en captura o revisión.");
  }
  if (!ACTA_EVENT_TYPES.includes(input.event_type)) {
    throw new Error("Tipo de evento inválido.");
  }

  const { data: lineup } = await admin
    .from("match_lineups")
    .select("*")
    .eq("id", input.lineup_id)
    .eq("session_id", session.id)
    .maybeSingle();

  if (!lineup) throw new Error("Jugador no está en la alineación.");
  if (lineup.side !== input.side) {
    throw new Error("El jugador no pertenece a ese lado.");
  }

  let relatedPlayerId: string | null = null;
  if (input.related_lineup_id) {
    const { data: related } = await admin
      .from("match_lineups")
      .select("*")
      .eq("id", input.related_lineup_id)
      .eq("session_id", session.id)
      .maybeSingle();
    if (!related) throw new Error("Jugador relacionado no encontrado.");
    relatedPlayerId = related.player_id;
  }

  const { data: existingEvents } = await admin
    .from("match_events")
    .select("event_type, lineup_id, voided_at, seq")
    .eq("session_id", session.id);

  const events = (existingEvents ?? []) as Array<{
    event_type: ActaEventType;
    lineup_id: string | null;
    voided_at: string | null;
    seq: number;
  }>;

  let eventType = input.event_type;
  if (eventType === "yellow_card" || eventType === "red_card") {
    eventType = suggestCardEventType(
      events,
      input.lineup_id,
      eventType === "red_card" ? "red_card" : "yellow_card",
    );
  }

  const nextSeq = events.reduce((max, row) => Math.max(max, row.seq), 0) + 1;

  // Si estábamos en review, volver a capturing al editar
  if (session.status === "review") {
    await admin
      .from("match_acta_sessions")
      .update({ status: "capturing" })
      .eq("id", session.id);
  }

  const { data, error } = await admin
    .from("match_events")
    .insert({
      session_id: session.id,
      seq: nextSeq,
      minute: Math.max(0, Math.min(130, Math.floor(input.minute))),
      stoppage: Math.max(0, Math.min(30, Math.floor(input.stoppage ?? 0))),
      event_type: eventType,
      side: input.side,
      lineup_id: input.lineup_id,
      player_id: lineup.player_id,
      related_lineup_id: input.related_lineup_id ?? null,
      related_player_id: relatedPlayerId,
      notes: input.notes?.trim() || null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as ActaEventRow;
}

export async function voidActaEvent(
  admin: SupabaseClient,
  session: ActaSessionRow,
  eventId: string,
  reason: string,
) {
  if (!isActaEditable(session.status)) {
    throw new Error("No se pueden anular eventos en este estado.");
  }

  const trimmed = reason.trim();
  if (!trimmed) throw new Error("Motivo de anulación obligatorio.");

  const { data, error } = await admin
    .from("match_events")
    .update({
      voided_at: new Date().toISOString(),
      void_reason: trimmed,
    })
    .eq("id", eventId)
    .eq("session_id", session.id)
    .is("voided_at", null)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Evento no encontrado o ya anulado.");
  return data as ActaEventRow;
}

export async function moveActaToReview(admin: SupabaseClient, session: ActaSessionRow) {
  if (!canTransitionActaStatus(session.status, "review")) {
    throw new Error("No se puede pasar a revisión desde este estado.");
  }

  const score = await scoreSession(admin, session.id);
  const { data, error } = await admin
    .from("match_acta_sessions")
    .update({
      status: "review",
      score_home: score.home,
      score_away: score.away,
    })
    .eq("id", session.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as ActaSessionRow;
}

async function scoreSession(admin: SupabaseClient, sessionId: string) {
  const { data: events } = await admin
    .from("match_events")
    .select("event_type, side, voided_at")
    .eq("session_id", sessionId);

  return computeScoreFromEvents((events ?? []) as ActaEventRow[]);
}

export async function closeActaSession(
  admin: SupabaseClient,
  session: ActaSessionRow,
  input: {
    refereeName: string;
    request: Request;
  },
) {
  if (session.status !== "review" && session.status !== "capturing") {
    throw new Error("Cierra el acta desde captura o revisión.");
  }

  const bundle = await loadActaBundle(admin, session.id);
  if (!bundle) throw new Error("Sesión no encontrada.");

  const score = computeScoreFromEvents(bundle.events);
  const payloadHash = computePayloadHash({
    sessionId: session.id,
    scoreHome: score.home,
    scoreAway: score.away,
    events: bundle.events,
  });

  const homeSignToken = createActaToken();
  const awaySignToken = createActaToken();
  const now = new Date().toISOString();

  const { error: sigError } = await admin.from("match_signatures").upsert(
    {
      session_id: session.id,
      signer_role: "referee",
      decision: "accept",
      signer_name: input.refereeName.trim(),
      payload_hash: payloadHash,
      ip_hash: hashActaIp(input.request),
      user_agent: input.request.headers.get("user-agent")?.slice(0, 300) ?? null,
      signed_at: now,
    },
    { onConflict: "session_id,signer_role" },
  );

  if (sigError) throw new Error(sigError.message);

  const { data, error } = await admin
    .from("match_acta_sessions")
    .update({
      status: "pending_signatures",
      score_home: score.home,
      score_away: score.away,
      payload_hash: payloadHash,
      referee_name: input.refereeName.trim(),
      closed_at: now,
      home_sign_token_hash: hashActaToken(homeSignToken),
      away_sign_token_hash: hashActaToken(awaySignToken),
      sign_tokens_expires_at: hoursFromNow(ACTA_SIGN_TOKEN_TTL_HOURS),
    })
    .eq("id", session.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return {
    session: data as ActaSessionRow,
    homeSignToken,
    awaySignToken,
    homeSignUrl: buildSignActaUrl(homeSignToken),
    awaySignUrl: buildSignActaUrl(awaySignToken),
    score,
  };
}

export async function recordDelegateSignature(
  admin: SupabaseClient,
  input: {
    session: ActaSessionRow;
    side: ActaSide;
    decision: ActaSignDecision;
    signerName: string;
    signerTitle?: string | null;
    objectionNote?: string | null;
    request: Request;
  },
) {
  if (input.session.status !== "pending_signatures") {
    throw new Error("Esta acta no está esperando firmas.");
  }
  if (isActaLocked(input.session.status)) {
    throw new Error("El acta ya está cerrada.");
  }

  const role: ActaSignerRole =
    input.side === "home" ? "home_delegate" : "away_delegate";

  if (input.decision === "object" && !input.objectionNote?.trim()) {
    throw new Error("La objeción requiere un motivo.");
  }

  const bundle = await loadActaBundle(admin, input.session.id);
  if (!bundle) throw new Error("Sesión no encontrada.");

  const score = {
    home: input.session.score_home ?? computeScoreFromEvents(bundle.events).home,
    away: input.session.score_away ?? computeScoreFromEvents(bundle.events).away,
  };
  const payloadHash =
    input.session.payload_hash ??
    computePayloadHash({
      sessionId: input.session.id,
      scoreHome: score.home,
      scoreAway: score.away,
      events: bundle.events,
    });

  const { error: sigError } = await admin.from("match_signatures").insert({
    session_id: input.session.id,
    signer_role: role,
    decision: input.decision,
    signer_name: input.signerName.trim(),
    signer_title: input.signerTitle?.trim() || null,
    objection_note:
      input.decision === "object" ? input.objectionNote!.trim() : null,
    payload_hash: payloadHash,
    ip_hash: hashActaIp(input.request),
    user_agent: input.request.headers.get("user-agent")?.slice(0, 300) ?? null,
  });

  if (sigError) {
    if (sigError.code === "23505") {
      throw new Error("Este lado ya firmó el acta.");
    }
    throw new Error(sigError.message);
  }

  if (input.decision === "object") {
    const { data, error } = await admin
      .from("match_acta_sessions")
      .update({
        status: "disputed",
        dispute_note: input.objectionNote!.trim(),
      })
      .eq("id", input.session.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { session: data as ActaSessionRow, published: false };
  }

  const { data: signatures } = await admin
    .from("match_signatures")
    .select("signer_role, decision")
    .eq("session_id", input.session.id);

  const roles = new Set((signatures ?? []).map((row) => row.signer_role));
  const bothDelegatesAccepted =
    roles.has("home_delegate") &&
    roles.has("away_delegate") &&
    (signatures ?? []).every(
      (row) =>
        row.signer_role === "referee" || row.decision === "accept",
    );

  if (bothDelegatesAccepted) {
    const published = await publishActaSession(admin, input.session.id);
    return { session: published, published: true };
  }

  const refreshed = await loadActaBundle(admin, input.session.id);
  return { session: refreshed!.session, published: false };
}

export async function publishActaSession(
  admin: SupabaseClient,
  sessionId: string,
) {
  const bundle = await loadActaBundle(admin, sessionId);
  if (!bundle) throw new Error("Sesión no encontrada.");

  const { session, lineups, events } = bundle;
  if (session.status === "published") return session;
  if (session.status !== "pending_signatures" && session.status !== "disputed") {
    throw new Error("Solo se publica desde firmas pendientes o disputa resuelta.");
  }

  const score = computeScoreFromEvents(events);
  const stats = aggregatePlayerStatsFromEvents(
    lineups,
    events,
    ACTA_DEFAULT_MATCH_MINUTES,
  );
  const now = new Date().toISOString();
  const payloadHash = computePayloadHash({
    sessionId: session.id,
    scoreHome: score.home,
    scoreAway: score.away,
    events,
  });

  const homeStats = stats.filter((row) => {
    const lineup = lineups.find((l) => l.player_id === row.player_id);
    return lineup?.side === "home";
  });
  const awayStats = stats.filter((row) => {
    const lineup = lineups.find((l) => l.player_id === row.player_id);
    return lineup?.side === "away";
  });

  const homeRows = homeStats.map((row) => ({
    match_id: session.home_match_id,
    player_id: row.player_id,
    goals: row.goals,
    assists: row.assists,
    yellow_cards: row.yellow_cards,
    red_cards: row.red_cards,
    minutes_played: row.minutes_played,
    captured_by: "admin" as const,
  }));

  if (homeRows.length > 0) {
    const { error } = await admin
      .from("match_stats")
      .upsert(homeRows, { onConflict: "match_id,player_id" });
    if (error) throw new Error(error.message);
  }

  const { error: homeMatchError } = await admin
    .from("matches")
    .update({
      goals_for: score.home,
      goals_against: score.away,
      result: resultFromScore(score.home, score.away),
      result_locked_at: now,
      acta_published_at: now,
      status: "completed",
    })
    .eq("id", session.home_match_id);

  if (homeMatchError) throw new Error(homeMatchError.message);

  if (session.away_match_id) {
    const awayRows = awayStats.map((row) => ({
      match_id: session.away_match_id!,
      player_id: row.player_id,
      goals: row.goals,
      assists: row.assists,
      yellow_cards: row.yellow_cards,
      red_cards: row.red_cards,
      minutes_played: row.minutes_played,
      captured_by: "admin" as const,
    }));

    if (awayRows.length > 0) {
      const { error } = await admin
        .from("match_stats")
        .upsert(awayRows, { onConflict: "match_id,player_id" });
      if (error) throw new Error(error.message);
    }

    const { error: awayMatchError } = await admin
      .from("matches")
      .update({
        goals_for: score.away,
        goals_against: score.home,
        result: resultFromScore(score.away, score.home),
        result_locked_at: now,
        acta_published_at: now,
        status: "completed",
      })
      .eq("id", session.away_match_id);

    if (awayMatchError) throw new Error(awayMatchError.message);
  }

  try {
    const { evaluateAchievementsAfterActa } = await import(
      "@/lib/evaluate-match-achievements"
    );
    await evaluateAchievementsAfterActa(admin, session.home_match_id);
    if (session.away_match_id) {
      await evaluateAchievementsAfterActa(admin, session.away_match_id);
    }
  } catch {
    // Insignias opcionales
  }

  try {
    const { dispatchMatchUpdateNotifications } = await import(
      "@/lib/guardian-notifications"
    );
    const homePlayerIds = homeRows.map((row) => row.player_id);
    if (homePlayerIds.length > 0) {
      await dispatchMatchUpdateNotifications({
        supabase: admin,
        academyId: session.home_academy_id,
        matchId: session.home_match_id,
        opponent: session.opponent_name,
        playerIds: homePlayerIds,
        previousPassportByPlayer: new Map(),
        achievementKeysByPlayer: new Map(),
        weeklyByPlayer: new Map(),
      });
    }
  } catch {
    // Avisos opcionales
  }

  const { data, error } = await admin
    .from("match_acta_sessions")
    .update({
      status: "published",
      score_home: score.home,
      score_away: score.away,
      payload_hash: payloadHash,
      published_at: now,
      dispute_note: null,
    })
    .eq("id", session.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as ActaSessionRow;
}

export async function resolveActaDispute(
  admin: SupabaseClient,
  sessionId: string,
  action: "publish" | "cancel",
  note?: string,
) {
  const { data: session, error } = await admin
    .from("match_acta_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!session) throw new Error("Sesión no encontrada.");
  if ((session as ActaSessionRow).status !== "disputed") {
    throw new Error("La sesión no está en disputa.");
  }

  if (action === "cancel") {
    const { data, error: updateError } = await admin
      .from("match_acta_sessions")
      .update({
        status: "cancelled",
        dispute_note: note?.trim() || (session as ActaSessionRow).dispute_note,
      })
      .eq("id", sessionId)
      .select("*")
      .single();
    if (updateError) throw new Error(updateError.message);
    return data as ActaSessionRow;
  }

  return publishActaSession(admin, sessionId);
}

export async function loadAcademyPlayersForActa(
  admin: SupabaseClient,
  academyId: string,
) {
  const { data, error } = await admin
    .from("players")
    .select("id, first_name, last_name, jersey_number, position, photo_url")
    .eq("academy_id", academyId)
    .order("jersey_number", { ascending: true, nullsFirst: false })
    .order("last_name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
