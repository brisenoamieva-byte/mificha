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

interface BulkFixtureInput {
  opponent: string;
  match_date: string;
  kickoff_time?: string;
  venue_name?: string | null;
  venue_address?: string | null;
  category?: string | null;
  notes?: string | null;
}

interface BulkBody {
  academy_id?: string;
  season_id?: string;
  is_public?: boolean;
  is_official?: boolean;
  fixtures?: BulkFixtureInput[];
}

export async function POST(request: Request) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as BulkBody;
  const academyId = body.academy_id?.trim();
  const fixtures = body.fixtures ?? [];

  if (!academyId) {
    return NextResponse.json({ error: "academy_id es obligatorio." }, { status: 400 });
  }

  if (fixtures.length === 0) {
    return NextResponse.json({ error: "No hay jornadas para importar." }, { status: 400 });
  }

  if (fixtures.length > 100) {
    return NextResponse.json(
      { error: "Máximo 100 jornadas por importación." },
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
        { error: "La academia no tiene temporada activa." },
        { status: 400 },
      );
    }

    seasonId = activeSeason.id;
  }

  const rows = fixtures.map((fixture) => {
    const matchDate = fixture.match_date.trim();
    const kickoffTime = fixture.kickoff_time?.trim() || "10:00";

    return {
      academy_id: academyId,
      season_id: seasonId!,
      opponent: fixture.opponent.trim(),
      match_date: matchDate,
      kickoff_at: combineDateAndTimeToIso(matchDate, kickoffTime),
      venue_name: fixture.venue_name?.trim() || null,
      venue_address: fixture.venue_address?.trim() || null,
      category: fixture.category?.trim() || null,
      notes: fixture.notes?.trim() || null,
      is_public: body.is_public ?? true,
      is_official: body.is_official ?? true,
      status: "scheduled" as const,
      result: null,
      goals_for: null,
      goals_against: null,
    };
  });

  const invalidRow = rows.find((row) => !row.opponent || !row.match_date);
  if (invalidRow) {
    return NextResponse.json(
      { error: "Cada fila requiere rival y fecha válidos." },
      { status: 400 },
    );
  }

  const { data, error } = await auth.admin.from("matches").insert(rows).select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    inserted: data?.length ?? 0,
  });
}
