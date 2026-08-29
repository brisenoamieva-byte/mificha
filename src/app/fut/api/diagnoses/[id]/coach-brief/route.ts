import { NextResponse } from "next/server";
import { calculateAge } from "@/lib/dashboard-utils";
import {
  applyCoachBriefToSession,
  generateCoachBrief,
} from "@/lib/diagnosis-coach";
import {
  getDiagnosisById,
  getDiagnosisForAcademy,
  loadDiagnosisReportBundle,
  requireDiagnosisAccess,
  updatePlayerDiagnosis,
} from "@/lib/player-diagnosis-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { academy_id?: string };
  const academyId = String(body.academy_id ?? "").trim();

  try {
    const admin = createSupabaseAdminClient();
    const diagnosis = academyId
      ? await getDiagnosisForAcademy(admin, academyId, id)
      : await getDiagnosisById(admin, id);
    if (!diagnosis) {
      return NextResponse.json({ error: "Diagnóstico no encontrado." }, { status: 404 });
    }
    await requireDiagnosisAccess(supabase, user, diagnosis.academy_id);
    const bundle = await loadDiagnosisReportBundle(admin, diagnosis);
    if (!bundle) {
      return NextResponse.json({ error: "No se encontró el jugador de la ficha." }, { status: 404 });
    }

    const output = await generateCoachBrief({
      firstName: bundle.player.first_name,
      age: bundle.player.birth_date ? calculateAge(bundle.player.birth_date) : null,
      position: bundle.player.position,
      module: diagnosis.module,
      kind: diagnosis.kind,
      scores: diagnosis.scores,
      notes: diagnosis.notes,
      flagged: diagnosis.flagged,
      injuries: diagnosis.injuries,
      playerGoal: diagnosis.player_goal,
      familyGoal: diagnosis.family_goal,
      whyJoin: diagnosis.why_join,
      fieldSession: diagnosis.field_session,
    });

    const updated = await updatePlayerDiagnosis(admin, diagnosis.academy_id, id, {
      program_priorities: output.priorities,
      monthly_plan: output.monthlyPlan,
      assignment_notes: output.assignmentNotes,
      field_session: applyCoachBriefToSession(diagnosis.field_session, output.brief),
    });

    return NextResponse.json({
      diagnosis: updated,
      player: bundle.player,
      academy: bundle.academy,
      brief: output.brief,
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
