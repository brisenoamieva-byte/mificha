import { NextResponse } from "next/server";
import { calculateAge } from "@/lib/dashboard-utils";
import {
  generateCoachBrief,
  isCoachAiConfigured,
  type CoachBriefInput,
} from "@/lib/diagnosis-coach";
import { parseFieldSession } from "@/lib/gph-field-protocol";
import {
  DIAGNOSIS_KINDS,
  DIAGNOSIS_MODULES,
  type DiagnosisKind,
  type DiagnosisModule,
  type DiagnosisNotes,
  type DiagnosisScores,
} from "@/lib/player-diagnosis";
import { requireDiagnosisAccess } from "@/lib/player-diagnosis-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";
import type { PlayerPosition } from "@/types/database";

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

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  const academyId = new URL(request.url).searchParams.get("academy_id")?.trim();
  if (!academyId) {
    return NextResponse.json({ error: "academy_id es obligatorio." }, { status: 400 });
  }
  try {
    await requireDiagnosisAccess(supabase, user, academyId);
    return NextResponse.json({ ai: isCoachAiConfigured() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No autorizado.";
    const status = message === "No autorizado." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const academyId = String(body.academy_id ?? "").trim();
  if (!academyId) {
    return NextResponse.json({ error: "academy_id es obligatorio." }, { status: 400 });
  }

  try {
    await requireDiagnosisAccess(supabase, user, academyId);

    const playerId = String(body.player_id ?? "").trim();
    let firstName = String(body.first_name ?? "").trim();
    let age =
      typeof body.age === "number" && Number.isFinite(body.age) ? body.age : null;
    let position = body.position as PlayerPosition | undefined;

    if (playerId) {
      const admin = createSupabaseAdminClient();
      const { data: player, error } = await admin
        .from("players")
        .select("first_name, birth_date, position, academy_id")
        .eq("id", playerId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!player || player.academy_id !== academyId) {
        throw new Error("El jugador no pertenece a esta academia.");
      }
      firstName = String(player.first_name ?? firstName);
      age = player.birth_date ? calculateAge(String(player.birth_date)) : age;
      position = player.position as PlayerPosition;
    }

    if (!firstName || !position) {
      return NextResponse.json(
        { error: "Necesitas jugador (nombre y posición) para la lectura." },
        { status: 400 },
      );
    }

    const module = DIAGNOSIS_MODULES.includes(body.module as DiagnosisModule)
      ? (body.module as DiagnosisModule)
      : position === "goalkeeper"
        ? "portero"
        : "campo";
    const kind = DIAGNOSIS_KINDS.includes(body.kind as DiagnosisKind)
      ? (body.kind as DiagnosisKind)
      : "inicial";

    const input: CoachBriefInput = {
      firstName,
      age,
      position,
      module,
      kind,
      scores: parseScores(body.scores),
      notes: parseNotes(body.notes),
      flagged: Array.isArray(body.flagged)
        ? body.flagged.filter((item): item is string => typeof item === "string")
        : [],
      injuries: typeof body.injuries === "string" ? body.injuries : null,
      playerGoal: typeof body.player_goal === "string" ? body.player_goal : null,
      familyGoal: typeof body.family_goal === "string" ? body.family_goal : null,
      whyJoin: typeof body.why_join === "string" ? body.why_join : null,
      fieldSession: parseFieldSession(body.field_session),
    };

    const output = await generateCoachBrief(input);
    return NextResponse.json({
      brief: output.brief,
      program_priorities: output.priorities,
      monthly_plan: output.monthlyPlan,
      assignment_notes: output.assignmentNotes,
      source: output.source,
      ai: output.aiAvailable,
      ai_fallback: output.aiFallback,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo generar la lectura.";
    const status = message === "No autorizado." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
