import { NextResponse } from "next/server";
import { syncAcademyCertificationForClient } from "@/lib/sync-academy-certification";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = (await request.json()) as { academy_id?: string };
  const academyId = body.academy_id?.trim();

  if (!academyId) {
    return NextResponse.json({ error: "academy_id es obligatorio." }, { status: 400 });
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
    const result = await syncAcademyCertificationForClient(admin, academyId);

    return NextResponse.json({
      certified: result.certified,
      changed: result.changed,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo sincronizar certificación.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
