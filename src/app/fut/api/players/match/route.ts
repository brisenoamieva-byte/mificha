import { NextResponse } from "next/server";
import { requireAcademyAccess } from "@/lib/academy-members-server";
import { isGphEvaluatorUser } from "@/lib/gph-partner-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";
import { findTutorMatchesForAcademyPlayer } from "@/lib/tutor-player-link";

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const url = new URL(request.url);
  const academyId = url.searchParams.get("academy_id")?.trim();
  if (!academyId) {
    return NextResponse.json({ error: "academy_id es obligatorio." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const isGph = await isGphEvaluatorUser(admin, user.id, user.email);
    if (!isGph) await requireAcademyAccess(supabase, user.id, academyId);

    const matches = await findTutorMatchesForAcademyPlayer(admin, {
      name: url.searchParams.get("name") ?? "",
      birthDate: url.searchParams.get("birth_date"),
      guardianPhone: url.searchParams.get("guardian_phone"),
      guardianEmail: url.searchParams.get("guardian_email"),
      publicCode: url.searchParams.get("public_code"),
    });

    return NextResponse.json({ matches });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo buscar.";
    const status = message === "No autorizado." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
