import { NextResponse } from "next/server";
import { listAcademyActivityDisputes } from "@/lib/tutor-activity";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  }

  const academyId = new URL(request.url).searchParams.get("academy_id")?.trim();
  if (!academyId) {
    return NextResponse.json({ error: "Falta academy_id." }, { status: 400 });
  }

  const { data: academy } = await supabase
    .from("academies")
    .select("id, owner_id")
    .eq("id", academyId)
    .maybeSingle();

  if (!academy || academy.owner_id !== user.id) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const events = await listAcademyActivityDisputes(admin, academyId);
    return NextResponse.json({ events });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron cargar disputas.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
