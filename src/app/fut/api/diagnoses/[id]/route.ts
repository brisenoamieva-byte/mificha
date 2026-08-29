import { NextResponse } from "next/server";
import { getDiagnosisById, getDiagnosisForAcademy, loadDiagnosisReportBundle, requireDiagnosisAccess } from "@/lib/player-diagnosis-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const academyId = new URL(request.url).searchParams.get("academy_id")?.trim();

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
    return NextResponse.json(bundle ?? { diagnosis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de servidor.";
    const status = message === "No autorizado." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
