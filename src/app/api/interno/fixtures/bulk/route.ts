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
  academy_slug?: string;
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

  const admin = auth.admin;
  const body = (await request.json()) as BulkBody;
  const defaultAcademyId = body.academy_id?.trim();
  const fixtures = body.fixtures ?? [];

  if (fixtures.length === 0) {
    return NextResponse.json({ error: "No hay jornadas para importar." }, { status: 400 });
  }

  if (fixtures.length > 100) {
    return NextResponse.json(
      { error: "Máximo 100 jornadas por importación." },
      { status: 400 },
    );
  }

  const usesMultiAcademy = fixtures.some((fixture) => fixture.academy_slug?.trim());

  if (!defaultAcademyId && !usesMultiAcademy) {
    return NextResponse.json(
      { error: "Indica academy_id o columna academia en el CSV." },
      { status: 400 },
    );
  }

  const slugToAcademyId = new Map<string, string>();

  if (usesMultiAcademy) {
    const slugs = [
      ...new Set(
        fixtures
          .map((fixture) => fixture.academy_slug?.trim().toLowerCase())
          .filter((slug): slug is string => Boolean(slug)),
      ),
    ];

    const { data: academies, error: academyError } = await admin
      .from("academies")
      .select("id, slug")
      .in("slug", slugs);

    if (academyError) {
      return NextResponse.json({ error: academyError.message }, { status: 500 });
    }

    for (const academy of academies ?? []) {
      slugToAcademyId.set(academy.slug.toLowerCase(), academy.id);
    }

    const missingSlug = slugs.find((slug) => !slugToAcademyId.has(slug));
    if (missingSlug) {
      return NextResponse.json(
        { error: `Academia no encontrada: ${missingSlug}` },
        { status: 400 },
      );
    }
  }

  const seasonCache = new Map<string, string>();

  async function resolveSeasonId(academyId: string) {
    const cached = seasonCache.get(academyId);
    if (cached) return cached;

    if (defaultAcademyId === academyId && body.season_id?.trim()) {
      seasonCache.set(academyId, body.season_id.trim());
      return body.season_id.trim();
    }

    const { data: activeSeason } = await admin
      .from("seasons")
      .select("id")
      .eq("academy_id", academyId)
      .eq("is_active", true)
      .maybeSingle();

    if (!activeSeason?.id) {
      return null;
    }

    seasonCache.set(academyId, activeSeason.id);
    return activeSeason.id;
  }

  const rows: Array<{
    academy_id: string;
    season_id: string;
    opponent: string;
    match_date: string;
    kickoff_at: string;
    venue_name: string | null;
    venue_address: string | null;
    category: string | null;
    notes: string | null;
    is_public: boolean;
    is_official: boolean;
    status: "scheduled";
    result: null;
    goals_for: null;
    goals_against: null;
  }> = [];

  for (const fixture of fixtures) {
    const slug = fixture.academy_slug?.trim().toLowerCase();
    const academyId = slug ? slugToAcademyId.get(slug) : defaultAcademyId;

    if (!academyId) {
      return NextResponse.json(
        { error: "Cada fila requiere academia (slug) o academy_id global." },
        { status: 400 },
      );
    }

    const seasonId = await resolveSeasonId(academyId);
    if (!seasonId) {
      return NextResponse.json(
        {
          error: slug
            ? `La academia "${slug}" no tiene temporada activa.`
            : "La academia no tiene temporada activa.",
        },
        { status: 400 },
      );
    }

    const matchDate = fixture.match_date.trim();
    const kickoffTime = fixture.kickoff_time?.trim() || "10:00";
    const opponent = fixture.opponent.trim();

    if (!opponent || !matchDate) {
      return NextResponse.json(
        { error: "Cada fila requiere rival y fecha válidos." },
        { status: 400 },
      );
    }

    rows.push({
      academy_id: academyId,
      season_id: seasonId,
      opponent,
      match_date: matchDate,
      kickoff_at: combineDateAndTimeToIso(matchDate, kickoffTime),
      venue_name: fixture.venue_name?.trim() || null,
      venue_address: fixture.venue_address?.trim() || null,
      category: fixture.category?.trim() || null,
      notes: fixture.notes?.trim() || null,
      is_public: body.is_public ?? true,
      is_official: body.is_official ?? true,
      status: "scheduled",
      result: null,
      goals_for: null,
      goals_against: null,
    });
  }

  const { data, error } = await admin.from("matches").insert(rows).select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const academiesUsed = new Set(rows.map((row) => row.academy_id)).size;

  return NextResponse.json({
    inserted: data?.length ?? 0,
    academies: academiesUsed,
  });
}
