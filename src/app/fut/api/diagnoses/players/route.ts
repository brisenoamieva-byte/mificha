import { NextResponse } from "next/server";
import { requireDiagnosisAccess } from "@/lib/player-diagnosis-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";
import { buildPlayerSlug, buildPublicPlayerUrl } from "@/lib/player-utils";
import type { PlayerPosition } from "@/types/database";

const POSITIONS: PlayerPosition[] = ["goalkeeper", "defender", "midfielder", "forward"];

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const academyId = new URL(request.url).searchParams.get("academy_id")?.trim();
  if (!academyId) {
    return NextResponse.json({ error: "academy_id es obligatorio." }, { status: 400 });
  }

  try {
    await requireDiagnosisAccess(supabase, user, academyId);
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("players")
      .select(
        "id, first_name, last_name, birth_date, position, photo_url, jersey_number, academy_id",
      )
      .eq("academy_id", academyId)
      .order("last_name", { ascending: true });
    if (error) throw new Error(error.message);
    return NextResponse.json({ players: data ?? [] });
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

  const body = (await request.json()) as Record<string, unknown>;
  const academyId = String(body.academy_id ?? "").trim();
  const firstName = String(body.first_name ?? "").trim();
  const lastName = String(body.last_name ?? "").trim();
  const birthDate = String(body.birth_date ?? "").trim();
  const position = body.position as PlayerPosition;

  if (!academyId || !firstName || !lastName || !birthDate) {
    return NextResponse.json(
      { error: "Nombre, apellido y fecha de nacimiento son obligatorios." },
      { status: 400 },
    );
  }
  if (!POSITIONS.includes(position)) {
    return NextResponse.json({ error: "Elige una posición." }, { status: 400 });
  }

  try {
    await requireDiagnosisAccess(supabase, user, academyId);
    const admin = createSupabaseAdminClient();
    const slug = buildPlayerSlug(firstName, lastName);
    const { data, error } = await admin
      .from("players")
      .insert({
        academy_id: academyId,
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate,
        position,
        dominant_foot: "right",
        slug,
        qr_code: buildPublicPlayerUrl(slug),
        is_public: false,
      })
      .select(
        "id, first_name, last_name, birth_date, position, photo_url, jersey_number, academy_id",
      )
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ player: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el jugador.";
    const status = message === "No autorizado." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
