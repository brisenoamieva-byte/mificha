import { NextResponse } from "next/server";
import { loadDashboardAcademySession } from "@/lib/academy-members-server";
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

  try {
    const session = await loadDashboardAcademySession(user.id, user.email);
    const admin = createSupabaseAdminClient();
    const evaluator = await isGphEvaluatorUser(admin, user.id, user.email);

    return NextResponse.json({
      profile: session.profile,
      academy: session.academy,
      role: session.role,
      evaluator,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar el panel.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
