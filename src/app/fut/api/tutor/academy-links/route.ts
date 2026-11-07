import { NextResponse } from "next/server";
import { requireAcademyAccess } from "@/lib/academy-members-server";
import { listTutorLinksByAcademy } from "@/lib/tutor-family";
import { isGphEvaluatorUser } from "@/lib/gph-partner-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const academyId = new URL(request.url).searchParams.get("academy_id")?.trim();
  if (!academyId) {
    return NextResponse.json({ error: "academy_id es obligatorio." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const isGph = await isGphEvaluatorUser(admin, user.id, user.email);
    if (!isGph) await requireAcademyAccess(supabase, user.id, academyId);
    const links = await listTutorLinksByAcademy(admin, academyId);
    return NextResponse.json({ links });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron cargar.";
    const status = message === "No autorizado." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
