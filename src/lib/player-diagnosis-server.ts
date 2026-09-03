import { createHash, randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateAge } from "@/lib/dashboard-utils";
import {
  applyCoachBriefToSession,
  generateCoachBrief,
} from "@/lib/diagnosis-coach";
import {
  parseFieldSession,
  type GphFieldSession,
} from "@/lib/gph-field-protocol";
import { requireAcademyAccess } from "@/lib/academy-members-server";
import { isGphEvaluatorUser } from "@/lib/gph-partner-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  computeDiagnosisResult,
  DIAGNOSIS_KINDS,
  DIAGNOSIS_MODULES,
  DIAGNOSIS_MONTHS,
  DIAGNOSIS_STAGES,
  emptyMonthlyPlan,
  moduleFromPosition,
  type DiagnosisKind,
  type DiagnosisModule,
  type DiagnosisMonthlyPlan,
  type DiagnosisNotes,
  type DiagnosisPriorityItem,
  type DiagnosisScores,
  type DiagnosisStage,
  type PlayerDiagnosisRecord,
  type DiagnosisPlayerSnapshot,
  type DiagnosisAcademySnapshot,
} from "@/lib/player-diagnosis";
import type { PlayerPosition } from "@/types/database";

export function createDiagnosisShareToken() {
  return randomBytes(24).toString("base64url");
}

export function hashDiagnosisToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getDiagnosisAppBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

export function buildDiagnosisShareUrl(token: string) {
  return `${getDiagnosisAppBaseUrl()}/fut/d/${token}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseScores(value: unknown): DiagnosisScores {
  if (!isRecord(value)) return {};
  const scores: DiagnosisScores = {};
  for (const [key, raw] of Object.entries(value)) {
    const num = typeof raw === "number" ? raw : Number(raw);
    if (Number.isFinite(num)) scores[key] = num;
  }
  return scores;
}

function parseNotes(value: unknown): DiagnosisNotes {
  if (!isRecord(value)) return {};
  const notes: DiagnosisNotes = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === "string" && raw.trim()) notes[key] = raw.trim();
  }
  return notes;
}

function parseFlagged(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function parsePriorities(value: unknown): DiagnosisPriorityItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((item) => ({
      title: String(item.title ?? "").trim(),
      baseline: String(item.baseline ?? "").trim(),
      december_goal: String(item.december_goal ?? "").trim(),
      progress_indicator: String(item.progress_indicator ?? "").trim(),
      main_action: String(item.main_action ?? "").trim(),
      indicator_id:
        typeof item.indicator_id === "string" ? item.indicator_id : undefined,
    }))
    .filter((item) => item.title);
}

function parseMonthlyPlan(value: unknown): DiagnosisMonthlyPlan {
  const empty = emptyMonthlyPlan();
  if (!isRecord(value)) return empty;
  for (const month of Object.keys(empty) as Array<keyof DiagnosisMonthlyPlan>) {
    const raw = value[month];
    if (!isRecord(raw)) continue;
    empty[month] = {
      objective: String(raw.objective ?? "").trim(),
      actions: String(raw.actions ?? "").trim(),
    };
  }
  return empty;
}

export function mapDiagnosisRow(row: Record<string, unknown>): PlayerDiagnosisRecord {
  return {
    id: String(row.id),
    academy_id: String(row.academy_id),
    player_id: String(row.player_id),
    kind: row.kind as DiagnosisKind,
    module: row.module as DiagnosisModule,
    evaluated_at: String(row.evaluated_at).slice(0, 10),
    evaluator_name: String(row.evaluator_name ?? ""),
    years_experience:
      row.years_experience == null ? null : Number(row.years_experience),
    venue: row.venue ? String(row.venue) : null,
    session_days: row.session_days ? String(row.session_days) : null,
    sessions_per_week:
      row.sessions_per_week == null ? null : Number(row.sessions_per_week),
    injuries: row.injuries ? String(row.injuries) : null,
    why_join: row.why_join ? String(row.why_join) : null,
    player_goal: row.player_goal ? String(row.player_goal) : null,
    family_goal: row.family_goal ? String(row.family_goal) : null,
    medical_notes: row.medical_notes ? String(row.medical_notes) : null,
    scores: parseScores(row.scores),
    notes: parseNotes(row.notes),
    flagged: parseFlagged(row.flagged),
    domain_averages: parseScores(row.domain_averages) as PlayerDiagnosisRecord["domain_averages"],
    global_score: row.global_score == null ? null : Number(row.global_score),
    computed_stage: (row.computed_stage as DiagnosisStage | null) ?? null,
    assigned_stage: (row.assigned_stage as DiagnosisStage | null) ?? null,
    assigned_group: row.assigned_group ? String(row.assigned_group) : null,
    assignment_notes: row.assignment_notes ? String(row.assignment_notes) : null,
    program_priorities: parsePriorities(row.program_priorities),
    monthly_plan: parseMonthlyPlan(row.monthly_plan),
    field_session: parseFieldSession(row.field_session),
    share_token_hash: String(row.share_token_hash),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export interface DiagnosisWriteInput {
  player_id: string;
  kind?: DiagnosisKind;
  module?: DiagnosisModule;
  evaluated_at?: string;
  evaluator_name: string;
  years_experience?: number | null;
  venue?: string | null;
  session_days?: string | null;
  sessions_per_week?: number | null;
  injuries?: string | null;
  why_join?: string | null;
  player_goal?: string | null;
  family_goal?: string | null;
  medical_notes?: string | null;
  scores?: DiagnosisScores;
  notes?: DiagnosisNotes;
  flagged?: string[];
  assigned_stage?: DiagnosisStage | null;
  assigned_group?: string | null;
  assignment_notes?: string | null;
  program_priorities?: DiagnosisPriorityItem[];
  monthly_plan?: DiagnosisMonthlyPlan;
  field_session?: GphFieldSession;
}

async function assertAcademyOwnsPlayer(
  admin: SupabaseClient,
  academyId: string,
  playerId: string,
) {
  const { data, error } = await admin
    .from("players")
    .select("id, academy_id, position, first_name, birth_date")
    .eq("id", playerId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data || data.academy_id !== academyId) {
    throw new Error("El jugador no pertenece a esta academia.");
  }
  return data as {
    id: string;
    academy_id: string;
    position: PlayerPosition;
    first_name: string;
    birth_date: string;
  };
}

function normalizeKind(value: unknown): DiagnosisKind {
  return DIAGNOSIS_KINDS.includes(value as DiagnosisKind)
    ? (value as DiagnosisKind)
    : "inicial";
}

function normalizeModule(
  value: unknown,
  fallback: DiagnosisModule,
): DiagnosisModule {
  return DIAGNOSIS_MODULES.includes(value as DiagnosisModule)
    ? (value as DiagnosisModule)
    : fallback;
}

function normalizeStage(value: unknown): DiagnosisStage | null {
  return DIAGNOSIS_STAGES.includes(value as DiagnosisStage)
    ? (value as DiagnosisStage)
    : null;
}

export async function createPlayerDiagnosis(
  admin: SupabaseClient,
  academyId: string,
  input: DiagnosisWriteInput,
) {
  const player = await assertAcademyOwnsPlayer(admin, academyId, input.player_id);
  const diagnosisModule = normalizeModule(
    input.module,
    moduleFromPosition(player.position),
  );
  const scores = input.scores ?? {};
  const result = computeDiagnosisResult(scores, diagnosisModule);
  const shareToken = createDiagnosisShareToken();
  const assignedStage = normalizeStage(input.assigned_stage) ?? result.stage;
  let fieldSession = parseFieldSession(input.field_session);
  let programPriorities = input.program_priorities ?? [];
  let monthlyPlan = input.monthly_plan ?? emptyMonthlyPlan();
  let assignmentNotes = input.assignment_notes?.trim() || null;

  const planEmpty = DIAGNOSIS_MONTHS.every(
    (month) => !monthlyPlan[month]?.objective && !monthlyPlan[month]?.actions,
  );

  if (!fieldSession.coachBrief && fieldSession.status !== "draft") {
    try {
      const coach = await generateCoachBrief({
        firstName: player.first_name,
        age: player.birth_date ? calculateAge(player.birth_date) : null,
        position: player.position,
        module: diagnosisModule,
        kind: normalizeKind(input.kind),
        scores,
        notes: input.notes ?? {},
        flagged: input.flagged ?? [],
        injuries: input.injuries ?? null,
        playerGoal: input.player_goal ?? null,
        familyGoal: input.family_goal ?? null,
        whyJoin: input.why_join ?? null,
        fieldSession,
      });
      fieldSession = applyCoachBriefToSession(fieldSession, coach.brief);
      if (programPriorities.length === 0) programPriorities = coach.priorities;
      if (planEmpty) monthlyPlan = coach.monthlyPlan;
      if (!assignmentNotes) assignmentNotes = coach.assignmentNotes;
    } catch {
      // Lectura opcional: no bloquea el guardado de la ficha.
    }
  }

  const payload = {
      academy_id: academyId,
      player_id: player.id,
      kind: normalizeKind(input.kind),
      module: diagnosisModule,
      evaluated_at: input.evaluated_at || new Date().toISOString().slice(0, 10),
      evaluator_name: input.evaluator_name.trim(),
      years_experience: input.years_experience ?? null,
      venue: input.venue?.trim() || null,
      session_days: input.session_days?.trim() || null,
      sessions_per_week: input.sessions_per_week ?? null,
      injuries: input.injuries?.trim() || null,
      why_join: input.why_join?.trim() || null,
      player_goal: input.player_goal?.trim() || null,
      family_goal: input.family_goal?.trim() || null,
      medical_notes: input.medical_notes?.trim() || null,
      scores,
      notes: input.notes ?? {},
      flagged: input.flagged ?? [],
      domain_averages: result.domainAverages,
      global_score: result.globalScore,
      computed_stage: result.stage,
      assigned_stage: assignedStage,
      assigned_group: input.assigned_group?.trim() || null,
      assignment_notes: assignmentNotes,
      program_priorities: programPriorities,
      monthly_plan: monthlyPlan,
      field_session: fieldSession,
      share_token_hash: hashDiagnosisToken(shareToken),
  };

  let { data, error } = await admin
    .from("player_diagnoses")
    .insert(payload)
    .select("*")
    .single();

  if (error?.message.includes("field_session")) {
    const { field_session: _omit, ...withoutField } = payload;
    void _omit;
    const retry = await admin.from("player_diagnoses").insert(withoutField).select("*").single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    if (error.message.includes("player_diagnoses")) {
      throw new Error(
        "Falta la tabla de diagnósticos. Ejecuta supabase/player-diagnoses.sql en el SQL Editor de Supabase.",
      );
    }
    throw new Error(error.message);
  }
  return {
    diagnosis: mapDiagnosisRow(data as Record<string, unknown>),
    shareToken,
    shareUrl: buildDiagnosisShareUrl(shareToken),
  };
}

export async function listAcademyDiagnoses(
  admin: SupabaseClient,
  academyId: string,
  playerId?: string,
) {
  let query = admin
    .from("player_diagnoses")
    .select("*")
    .eq("academy_id", academyId)
    .order("evaluated_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (playerId) query = query.eq("player_id", playerId);

  const { data, error } = await query;
  if (error) {
    if (error.message.includes("player_diagnoses")) {
      throw new Error(
        "Falta la tabla de diagnósticos. Ejecuta supabase/player-diagnoses.sql en el SQL Editor de Supabase.",
      );
    }
    throw new Error(error.message);
  }
  return (data ?? []).map((row) => mapDiagnosisRow(row as Record<string, unknown>));
}

export async function getDiagnosisById(admin: SupabaseClient, diagnosisId: string) {
  const { data, error } = await admin
    .from("player_diagnoses")
    .select("*")
    .eq("id", diagnosisId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapDiagnosisRow(data as Record<string, unknown>);
}

export async function getLatestDiagnosisForPlayer(
  admin: SupabaseClient,
  playerId: string,
) {
  const { data, error } = await admin
    .from("player_diagnoses")
    .select("*")
    .eq("player_id", playerId)
    .order("evaluated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapDiagnosisRow(data as Record<string, unknown>);
}

export async function listAllDiagnoses(admin: SupabaseClient, academyId?: string) {
  if (academyId) return listAcademyDiagnoses(admin, academyId);
  const { data, error } = await admin
    .from("player_diagnoses")
    .select("*")
    .order("evaluated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapDiagnosisRow(row as Record<string, unknown>));
}

export async function getDiagnosisForAcademy(
  admin: SupabaseClient,
  academyId: string,
  diagnosisId: string,
) {
  const { data, error } = await admin
    .from("player_diagnoses")
    .select("*")
    .eq("id", diagnosisId)
    .eq("academy_id", academyId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapDiagnosisRow(data as Record<string, unknown>);
}

export async function updatePlayerDiagnosis(
  admin: SupabaseClient,
  academyId: string,
  diagnosisId: string,
  patch: Partial<DiagnosisWriteInput>,
) {
  const current = await getDiagnosisForAcademy(admin, academyId, diagnosisId);
  if (!current) throw new Error("Diagnóstico no encontrado.");

  const diagnosisModule = normalizeModule(
    patch.module ?? current.module,
    current.module,
  );
  const scores = patch.scores ?? current.scores;
  const result = computeDiagnosisResult(scores, diagnosisModule);
  const fieldSession = patch.field_session
    ? parseFieldSession(patch.field_session)
    : current.field_session;

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (patch.kind !== undefined) payload.kind = normalizeKind(patch.kind);
  if (patch.module !== undefined) payload.module = diagnosisModule;
  if (patch.evaluated_at !== undefined) {
    payload.evaluated_at = patch.evaluated_at || current.evaluated_at;
  }
  if (patch.evaluator_name !== undefined) {
    const name = patch.evaluator_name.trim();
    if (!name) throw new Error("Escribe el nombre del evaluador.");
    payload.evaluator_name = name;
  }
  if (patch.years_experience !== undefined) {
    payload.years_experience = patch.years_experience ?? null;
  }
  if (patch.venue !== undefined) payload.venue = patch.venue?.trim() || null;
  if (patch.session_days !== undefined) {
    payload.session_days = patch.session_days?.trim() || null;
  }
  if (patch.sessions_per_week !== undefined) {
    payload.sessions_per_week = patch.sessions_per_week ?? null;
  }
  if (patch.injuries !== undefined) payload.injuries = patch.injuries?.trim() || null;
  if (patch.why_join !== undefined) payload.why_join = patch.why_join?.trim() || null;
  if (patch.player_goal !== undefined) {
    payload.player_goal = patch.player_goal?.trim() || null;
  }
  if (patch.family_goal !== undefined) {
    payload.family_goal = patch.family_goal?.trim() || null;
  }
  if (patch.medical_notes !== undefined) {
    payload.medical_notes = patch.medical_notes?.trim() || null;
  }
  if (patch.scores !== undefined) {
    payload.scores = scores;
    payload.domain_averages = result.domainAverages;
    payload.global_score = result.globalScore;
    payload.computed_stage = result.stage;
  }
  if (patch.notes !== undefined) payload.notes = patch.notes ?? {};
  if (patch.flagged !== undefined) payload.flagged = patch.flagged ?? [];
  if (patch.assigned_stage !== undefined) {
    payload.assigned_stage =
      normalizeStage(patch.assigned_stage) ?? result.stage;
  } else if (patch.scores !== undefined && !current.assigned_stage) {
    payload.assigned_stage = result.stage;
  }
  if (patch.assigned_group !== undefined) {
    payload.assigned_group = patch.assigned_group?.trim() || null;
  }
  if (patch.assignment_notes !== undefined) {
    payload.assignment_notes = patch.assignment_notes?.trim() || null;
  }
  if (patch.program_priorities !== undefined) {
    payload.program_priorities = patch.program_priorities;
  }
  if (patch.monthly_plan !== undefined) payload.monthly_plan = patch.monthly_plan;
  if (patch.field_session !== undefined) payload.field_session = fieldSession;

  let { data, error } = await admin
    .from("player_diagnoses")
    .update(payload)
    .eq("id", diagnosisId)
    .eq("academy_id", academyId)
    .select("*")
    .single();

  if (error?.message.includes("field_session") && payload.field_session) {
    const { field_session: _omit, ...withoutField } = payload;
    void _omit;
    const retry = await admin
      .from("player_diagnoses")
      .update(withoutField)
      .eq("id", diagnosisId)
      .eq("academy_id", academyId)
      .select("*")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) throw new Error(error.message);
  return mapDiagnosisRow(data as Record<string, unknown>);
}

export async function findDiagnosisByShareToken(
  admin: SupabaseClient,
  token: string,
) {
  const { data, error } = await admin
    .from("player_diagnoses")
    .select("*")
    .eq("share_token_hash", hashDiagnosisToken(token.trim()))
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapDiagnosisRow(data as Record<string, unknown>);
}

export interface DiagnosisReportBundle {
  diagnosis: PlayerDiagnosisRecord;
  player: DiagnosisPlayerSnapshot;
  academy: DiagnosisAcademySnapshot;
}

export async function loadDiagnosisReportBundle(
  admin: SupabaseClient,
  diagnosis: PlayerDiagnosisRecord,
): Promise<DiagnosisReportBundle | null> {
  const [{ data: player }, { data: academy }] = await Promise.all([
    admin
      .from("players")
      .select(
        "id, first_name, last_name, birth_date, position, dominant_foot, jersey_number, photo_url, slug",
      )
      .eq("id", diagnosis.player_id)
      .maybeSingle(),
    admin
      .from("academies")
      .select("id, name, slug, logo_url")
      .eq("id", diagnosis.academy_id)
      .maybeSingle(),
  ]);

  if (!player || !academy) return null;

  const { signPlayerPhotoUrl, signPlayerVideoUrl } = await import("@/lib/supabase-admin");
  const photoUrl = await signPlayerPhotoUrl(player.photo_url);
  const evidence = await Promise.all(
    diagnosis.field_session.evidence.map(async (item) => ({
      ...item,
      url:
        item.kind === "video"
          ? ((await signPlayerVideoUrl(item.url)) ?? item.url)
          : ((await signPlayerPhotoUrl(item.url)) ?? item.url),
    })),
  );

  return {
    diagnosis: {
      ...diagnosis,
      field_session: { ...diagnosis.field_session, evidence },
    },
    player: { ...(player as DiagnosisPlayerSnapshot), photo_url: photoUrl },
    academy: academy as DiagnosisAcademySnapshot,
  };
}

export async function requireDiagnosisAccess(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null },
  academyId: string,
) {
  const admin = createSupabaseAdminClient();
  if (await isGphEvaluatorUser(admin, user.id, user.email)) {
    const { data, error } = await admin
      .from("academies")
      .select("id")
      .eq("id", academyId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Academia no encontrada.");
    return { role: "gph" as const };
  }
  return requireAcademyAccess(supabase, user.id, academyId);
}

export async function requireAcademyOwner(
  supabase: SupabaseClient,
  userId: string,
  academyId: string,
) {
  return requireAcademyAccess(supabase, userId, academyId);
}
