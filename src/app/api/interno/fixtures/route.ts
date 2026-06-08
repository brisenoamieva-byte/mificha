import { NextResponse } from "next/server";
import { canAccessPitchDeck } from "@/lib/pitch-access";
import { combineDateAndTimeToIso } from "@/lib/match-utils";
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

  const url = new URL(request.url);
  const academyId = url.searchParams.get("academy_id");

  if (!academyId) {
    const { data: academies, error } = await auth.admin
      .from("academies")
      .select("id,name,slug,city,state,is_public,is_certified")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ academies: academies ?? [] });
  }

  const [{ data: season }, { data: fixtures, error: fixturesError }] = await Promise.all([
    auth.admin
      .from("seasons")
      .select("*")
      .eq("academy_id", academyId)
      .eq("is_active", true)
      .maybeSingle(),
    auth.admin
      .from("matches")
      .select("*")
      .eq("academy_id", academyId)
      .in("status", ["scheduled", "postponed", "completed"])
      .order("kickoff_at", { ascending: false, nullsFirst: false })
      .limit(40),
  ]);

  if (fixturesError) {
    return NextResponse.json({ error: fixturesError.message }, { status: 500 });
  }

  return NextResponse.json({
    season,
    fixtures: fixtures ?? [],
  });
}

interface FixtureBody {
  academy_id?: string;
  season_id?: string;
  opponent?: string;
  match_date?: string;
  kickoff_time?: string;
  venue_name?: string;
  venue_address?: string;
  category?: string;
  notes?: string;
  is_public?: boolean;
  is_official?: boolean;
  fixture_id?: string;
  status?: "scheduled" | "postponed" | "cancelled";
}

export async function POST(request: Request) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as FixtureBody;
  const academyId = body.academy_id?.trim();
  const opponent = body.opponent?.trim();
  const matchDate = body.match_date?.trim();

  if (!academyId || !opponent || !matchDate) {
    return NextResponse.json(
      { error: "academy_id, opponent y match_date son obligatorios." },
      { status: 400 },
    );
  }

  let seasonId = body.season_id?.trim();

  if (!seasonId) {
    const { data: activeSeason } = await auth.admin
      .from("seasons")
      .select("id")
      .eq("academy_id", academyId)
      .eq("is_active", true)
      .maybeSingle();

    if (!activeSeason?.id) {
      return NextResponse.json(
        { error: "La academia no tiene temporada activa. Publícala en /interno/temporadas." },
        { status: 400 },
      );
    }

    seasonId = activeSeason.id;
  }

  const kickoffTime = body.kickoff_time?.trim() || "10:00";
  const kickoffAt = combineDateAndTimeToIso(matchDate, kickoffTime);

  const { data, error } = await auth.admin
    .from("matches")
    .insert({
      academy_id: academyId,
      season_id: seasonId,
      opponent,
      match_date: matchDate,
      kickoff_at: kickoffAt,
      venue_name: body.venue_name?.trim() || null,
      venue_address: body.venue_address?.trim() || null,
      category: body.category?.trim() || null,
      notes: body.notes?.trim() || null,
      is_public: body.is_public ?? true,
      is_official: body.is_official ?? true,
      status: "scheduled",
      result: null,
      goals_for: null,
      goals_against: null,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No se publicó la jornada." },
      { status: 500 },
    );
  }

  return NextResponse.json({ fixture: data });
}

export async function PATCH(request: Request) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as FixtureBody;
  const fixtureId = body.fixture_id?.trim();

  if (!fixtureId) {
    return NextResponse.json({ error: "fixture_id es obligatorio." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (body.opponent) updates.opponent = body.opponent.trim();
  if (body.match_date) updates.match_date = body.match_date;
  if (body.kickoff_time && body.match_date) {
    updates.kickoff_at = combineDateAndTimeToIso(body.match_date, body.kickoff_time);
  }
  if (body.venue_name !== undefined) updates.venue_name = body.venue_name.trim() || null;
  if (body.venue_address !== undefined) {
    updates.venue_address = body.venue_address.trim() || null;
  }
  if (body.category !== undefined) updates.category = body.category.trim() || null;
  if (body.notes !== undefined) updates.notes = body.notes.trim() || null;
  if (typeof body.is_public === "boolean") updates.is_public = body.is_public;
  if (body.status) updates.status = body.status;

  const { data, error } = await auth.admin
    .from("matches")
    .update(updates)
    .eq("id", fixtureId)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No se actualizó la jornada." },
      { status: 500 },
    );
  }

  return NextResponse.json({ fixture: data });
}
