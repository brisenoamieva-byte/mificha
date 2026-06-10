import { NextResponse } from "next/server";
import { ensureAcademySeasonFromPlatform } from "@/lib/ensure-academy-season";
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

  const admin = createSupabaseAdminClient();
  const result = await ensureAcademySeasonFromPlatform(admin, academyId);

  if (!result.season) {
    const message =
      result.reason === "no_platform_season"
        ? "Aún no hay temporada MiFicha publicada. El equipo interno debe crearla en /interno/temporadas."
        : "No se pudo activar la temporada.";

    return NextResponse.json({ error: message, reason: result.reason }, { status: 409 });
  }

  return NextResponse.json({
    season: result.season,
    created: result.created,
  });
}
