import { NextResponse } from "next/server";
import { canAccessPitchDeck } from "@/lib/pitch-access";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";
import { slugifyTournamentName } from "@/lib/tournament-slug";

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

  const activeOnly = new URL(request.url).searchParams.get("active") === "1";

  let query = auth.admin
    .from("tournaments")
    .select(
      "id,name,slug,region,organizer_name,organizer_contact,start_date,end_date,is_active,platform_season_id,created_at,platform_seasons(name)",
    )
    .order("created_at", { ascending: false });

  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tournaments: data ?? [] });
}

interface TournamentBody {
  name?: string;
  region?: string;
  organizer_name?: string;
  organizer_contact?: string;
  start_date?: string | null;
  end_date?: string | null;
  platform_season_id?: string | null;
  is_active?: boolean;
  tournament_id?: string;
}

export async function POST(request: Request) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as TournamentBody;
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "El nombre del torneo es obligatorio." }, { status: 400 });
  }

  const baseSlug = slugifyTournamentName(name) || "torneo";
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const { data: existing } = await auth.admin
      .from("tournaments")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const { data, error } = await auth.admin
    .from("tournaments")
    .insert({
      name,
      slug,
      region: body.region?.trim() || "Querétaro",
      organizer_name: body.organizer_name?.trim() || null,
      organizer_contact: body.organizer_contact?.trim() || null,
      start_date: body.start_date?.trim() || null,
      end_date: body.end_date?.trim() || null,
      platform_season_id: body.platform_season_id?.trim() || null,
      is_active: body.is_active !== false,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No se creó el torneo." },
      { status: 500 },
    );
  }

  return NextResponse.json({ tournament: data });
}

export async function PATCH(request: Request) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as TournamentBody;
  const tournamentId = body.tournament_id?.trim();

  if (!tournamentId) {
    return NextResponse.json({ error: "tournament_id es obligatorio." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.region !== undefined) updates.region = body.region.trim() || null;
  if (body.organizer_name !== undefined) {
    updates.organizer_name = body.organizer_name.trim() || null;
  }
  if (body.organizer_contact !== undefined) {
    updates.organizer_contact = body.organizer_contact.trim() || null;
  }
  if (body.start_date !== undefined) updates.start_date = body.start_date || null;
  if (body.end_date !== undefined) updates.end_date = body.end_date || null;
  if (body.platform_season_id !== undefined) {
    updates.platform_season_id = body.platform_season_id || null;
  }
  if (body.is_active !== undefined) updates.is_active = body.is_active;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
  }

  const { data, error } = await auth.admin
    .from("tournaments")
    .update(updates)
    .eq("id", tournamentId)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No se actualizó el torneo." },
      { status: 500 },
    );
  }

  return NextResponse.json({ tournament: data });
}
