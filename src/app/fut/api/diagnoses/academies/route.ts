import { NextResponse } from "next/server";
import { isGphEvaluatorUser, listGphAcademies } from "@/lib/gph-partner-server";
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

  try {
    const admin = createSupabaseAdminClient();
    if (!(await isGphEvaluatorUser(admin, user.id, user.email))) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }
    const academies = await listGphAcademies(admin);
    return NextResponse.json({ academies });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron cargar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
