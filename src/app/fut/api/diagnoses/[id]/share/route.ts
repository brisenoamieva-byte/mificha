import { NextResponse } from "next/server";
import {
  buildDiagnosisShareUrl,
  createDiagnosisShareToken,
  getDiagnosisById,
  getDiagnosisForAcademy,
  hashDiagnosisToken,
  requireDiagnosisAccess,
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
  const academyId = body.academy_id?.trim();

  try {
    const admin = createSupabaseAdminClient();
    const diagnosis = academyId
      ? await getDiagnosisForAcademy(admin, academyId, id)
      : await getDiagnosisById(admin, id);
    if (!diagnosis) {
      return NextResponse.json({ error: "Diagnóstico no encontrado." }, { status: 404 });
    }
    await requireDiagnosisAccess(supabase, user, diagnosis.academy_id);

    if (diagnosis.field_session.status === "draft") {
      return NextResponse.json(
        { error: "Termina y genera la ficha antes de compartir el link." },
        { status: 400 },
      );
    }

    const shareToken = createDiagnosisShareToken();
    const { error } = await admin
      .from("player_diagnoses")
      .update({ share_token_hash: hashDiagnosisToken(shareToken) })
      .eq("id", id)
      .eq("academy_id", diagnosis.academy_id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ share_url: buildDiagnosisShareUrl(shareToken) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo generar el link.";
    const status = message === "No autorizado." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
