import { NextResponse } from "next/server";
import { canAccessPitchDeck } from "@/lib/pitch-access";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

async function assertPlatformAdmin(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!canAccessPitchDeck(user?.id, user?.email)) {
    return { error: NextResponse.json({ error: "No autorizado." }, { status: 403 }) };
  }

  return { admin: createSupabaseAdminClient() };
}

export async function GET(request: Request) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const academyId = new URL(request.url).searchParams.get("academy_id");

  if (academyId) {
    const { data, error } = await auth.admin
      .from("seasons")
      .select("*")
      .eq("academy_id", academyId)
      .order("start_date", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ seasons: data ?? [] });
  }

  const { data: academies, error } = await auth.admin
    .from("academies")
    .select("id,name,slug,city,state,is_public,is_certified")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ academies: academies ?? [] });
}

interface SeasonBody {
  academy_id?: string;
  name?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  season_id?: string;
}

export async function POST(request: Request) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as SeasonBody;
  const academyId = body.academy_id?.trim();
  const name = body.name?.trim();
  const startDate = body.start_date?.trim();
  const endDate = body.end_date?.trim();

  if (!academyId || !name || !startDate || !endDate) {
    return NextResponse.json(
      { error: "academy_id, name, start_date y end_date son obligatorios." },
      { status: 400 },
    );
  }

  if (body.is_active !== false) {
    await auth.admin
      .from("seasons")
      .update({ is_active: false })
      .eq("academy_id", academyId);
  }

  const { data, error } = await auth.admin
    .from("seasons")
    .insert({
      academy_id: academyId,
      name,
      start_date: startDate,
      end_date: endDate,
      is_active: body.is_active ?? true,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No se creó la temporada." },
      { status: 500 },
    );
  }

  return NextResponse.json({ season: data });
}

export async function PATCH(request: Request) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as SeasonBody;
  const seasonId = body.season_id?.trim();

  if (!seasonId) {
    return NextResponse.json({ error: "season_id es obligatorio." }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await auth.admin
    .from("seasons")
    .select("academy_id")
    .eq("id", seasonId)
    .maybeSingle();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Temporada no encontrada." }, { status: 404 });
  }

  if (body.is_active) {
    await auth.admin
      .from("seasons")
      .update({ is_active: false })
      .eq("academy_id", existing.academy_id);
  }

  const { data, error } = await auth.admin
    .from("seasons")
    .update({
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.start_date ? { start_date: body.start_date } : {}),
      ...(body.end_date ? { end_date: body.end_date } : {}),
      ...(typeof body.is_active === "boolean" ? { is_active: body.is_active } : {}),
    })
    .eq("id", seasonId)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No se actualizó la temporada." },
      { status: 500 },
    );
  }

  return NextResponse.json({ season: data });
}
