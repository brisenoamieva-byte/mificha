import {
  DIAGNOSIS_KINDS,
  DIAGNOSIS_STAGES,
  type DiagnosisKind,
  type DiagnosisStage,
  type PlayerDiagnosisRecord,
} from "@/lib/player-diagnosis";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

/** Resumen público: el jugador tiene evaluación GPH ligada a `players.id`. */
export interface PublicGphSummary {
  kind: DiagnosisKind;
  evaluatedAt: string;
  globalScore: number | null;
  stage: DiagnosisStage | null;
}

const SUMMARY_SELECT =
  "player_id, kind, evaluated_at, global_score, assigned_stage, computed_stage";

function tryAdmin() {
  try {
    return createSupabaseAdminClient();
  } catch {
    return null;
  }
}

function asKind(value: unknown): DiagnosisKind | null {
  return DIAGNOSIS_KINDS.includes(value as DiagnosisKind)
    ? (value as DiagnosisKind)
    : null;
}

function asStage(value: unknown): DiagnosisStage | null {
  return DIAGNOSIS_STAGES.includes(value as DiagnosisStage)
    ? (value as DiagnosisStage)
    : null;
}

export function gphStageOf(row: {
  assigned_stage?: DiagnosisStage | null;
  computed_stage?: DiagnosisStage | null;
}): DiagnosisStage | null {
  return asStage(row.assigned_stage) ?? asStage(row.computed_stage);
}

export function publicGphSummaryFromDiagnosis(
  diagnosis: Pick<
    PlayerDiagnosisRecord,
    "kind" | "evaluated_at" | "global_score" | "assigned_stage" | "computed_stage"
  >,
): PublicGphSummary {
  return {
    kind: diagnosis.kind,
    evaluatedAt: diagnosis.evaluated_at.slice(0, 10),
    globalScore: diagnosis.global_score,
    stage: gphStageOf(diagnosis),
  };
}

function summaryFromRow(row: Record<string, unknown>): PublicGphSummary | null {
  const kind = asKind(row.kind);
  const evaluatedAt = String(row.evaluated_at ?? "").slice(0, 10);
  if (!kind || !evaluatedAt) return null;
  return {
    kind,
    evaluatedAt,
    globalScore: row.global_score == null ? null : Number(row.global_score),
    stage: gphStageOf({
      assigned_stage: asStage(row.assigned_stage),
      computed_stage: asStage(row.computed_stage),
    }),
  };
}

/** Ruta pública de la evaluación, anclada al mismo slug que Mi Ficha. */
export function buildPublicGphEvaluationPath(slug: string) {
  return `/fut/j/${slug}/evaluacion`;
}

export async function fetchLatestGphSummary(
  playerId: string,
): Promise<PublicGphSummary | null> {
  const admin = tryAdmin();
  if (!admin || !playerId) return null;

  const { data, error } = await admin
    .from("player_diagnoses")
    .select(SUMMARY_SELECT)
    .eq("player_id", playerId)
    .order("evaluated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return summaryFromRow(data as Record<string, unknown>);
}

/** Última evaluación por jugador, para directorio y planteles. */
export async function fetchGphPlayerIdSet(
  playerIds: string[],
): Promise<Set<string>> {
  const unique = [...new Set(playerIds.filter(Boolean))];
  if (unique.length === 0) return new Set();

  const admin = tryAdmin();
  if (!admin) return new Set();

  const { data, error } = await admin
    .from("player_diagnoses")
    .select("player_id")
    .in("player_id", unique);

  if (error || !data) return new Set();
  return new Set(
    data.map((row) => String((row as { player_id: string }).player_id)),
  );
}
