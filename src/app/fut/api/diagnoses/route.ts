import { NextResponse } from "next/server";
import {
  createPlayerDiagnosis,
  listAcademyDiagnoses,
  listAllDiagnoses,
  requireDiagnosisAccess,
} from "@/lib/player-diagnosis-server";
import { isGphEvaluatorUser } from "@/lib/gph-partner-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const url = new URL(request.url);
  const academyId = url.searchParams.get("academy_id")?.trim();
  const playerId = url.searchParams.get("player_id")?.trim();

  try {
    const admin = createSupabaseAdminClient();
    if (!academyId) {
      if (!(await isGphEvaluatorUser(admin, user.id, user.email))) {
        return NextResponse.json({ error: "academy_id es obligatorio." }, { status: 400 });
      }
      const diagnoses = await listAllDiagnoses(admin);
      return NextResponse.json({ diagnoses });
    }

    await requireDiagnosisAccess(supabase, user, academyId);
    const diagnoses = await listAcademyDiagnoses(admin, academyId, playerId);
    return NextResponse.json({ diagnoses });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron cargar.";
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

  const body = (await request.json()) as {
    academy_id?: string;
    evaluator_name?: string;
    player_id?: string;
  } & Record<string, unknown>;

  const academyId = String(body.academy_id ?? "").trim();
  const playerId = String(body.player_id ?? "").trim();
  const evaluatorName = String(body.evaluator_name ?? "").trim();

  if (!academyId || !playerId || !evaluatorName) {
    return NextResponse.json(
      { error: "academy_id, player_id y evaluator_name son obligatorios." },
      { status: 400 },
    );
  }

  try {
    await requireDiagnosisAccess(supabase, user, academyId);
    const admin = createSupabaseAdminClient();
    const created = await createPlayerDiagnosis(admin, academyId, {
      ...body,
      player_id: playerId,
      evaluator_name: evaluatorName,
    });

    return NextResponse.json({
      diagnosis: created.diagnosis,
      share_url: created.shareUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar.";
    const status = message === "No autorizado." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
