import { NextResponse } from "next/server";
import { evaluateAchievementsAfterActa } from "@/lib/evaluate-match-achievements";
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

interface ActaEntry {
  player_id?: string;
  goals?: number;
  assists?: number;
  yellow_cards?: number;
  red_cards?: number;
}

interface ActaBody {
  fixture_id?: string;
  entries?: ActaEntry[];
}

export async function GET(request: Request) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const fixtureId = new URL(request.url).searchParams.get("fixture_id")?.trim();
  if (!fixtureId) {
    return NextResponse.json({ error: "fixture_id es obligatorio." }, { status: 400 });
  }

  const { data: match, error: matchError } = await auth.admin
    .from("matches")
    .select("*")
    .eq("id", fixtureId)
    .maybeSingle();

  if (matchError || !match) {
    return NextResponse.json({ error: "Partido no encontrado." }, { status: 404 });
  }

  const [{ data: players }, { data: stats }] = await Promise.all([
    auth.admin
      .from("players")
      .select("id, first_name, last_name, jersey_number, position, passport_score")
      .eq("academy_id", match.academy_id)
      .order("last_name", { ascending: true }),
    auth.admin
      .from("match_stats")
      .select("player_id, goals, assists, minutes_played, yellow_cards, red_cards, captured_by")
      .eq("match_id", fixtureId),
  ]);

  return NextResponse.json({
    match,
    players: players ?? [],
    stats: stats ?? [],
  });
}

export async function POST(request: Request) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as ActaBody;
  const fixtureId = body.fixture_id?.trim();
  const entries = body.entries ?? [];

  if (!fixtureId || entries.length === 0) {
    return NextResponse.json(
      { error: "fixture_id y entries son obligatorios." },
      { status: 400 },
    );
  }

  const { data: match, error: matchError } = await auth.admin
    .from("matches")
    .select("id, academy_id, is_official, result, goals_for")
    .eq("id", fixtureId)
    .maybeSingle();

  if (matchError || !match) {
    return NextResponse.json({ error: "Partido no encontrado." }, { status: 404 });
  }

  if (match.is_official && match.result == null) {
    return NextResponse.json(
      { error: "Publica el marcador oficial antes del acta." },
      { status: 400 },
    );
  }

  const { data: existingStats } = await auth.admin
    .from("match_stats")
    .select("player_id, minutes_played")
    .eq("match_id", fixtureId);

  const minutesByPlayer = new Map(
    (existingStats ?? []).map((row) => [row.player_id, row.minutes_played]),
  );

  const rows = entries
    .filter((entry) => entry.player_id)
    .map((entry) => ({
      match_id: fixtureId,
      player_id: entry.player_id!,
      goals: Math.max(0, entry.goals ?? 0),
      assists: Math.max(0, entry.assists ?? 0),
      yellow_cards: Math.max(0, entry.yellow_cards ?? 0),
      red_cards: Math.max(0, entry.red_cards ?? 0),
      minutes_played: minutesByPlayer.get(entry.player_id!) ?? 0,
      captured_by: "admin" as const,
    }));

  const actaGoals = rows.reduce((sum, row) => sum + row.goals, 0);
  if (match.is_official && match.goals_for != null && actaGoals > match.goals_for) {
    return NextResponse.json(
      {
        error: `Suma de goles del acta (${actaGoals}) supera el marcador oficial (${match.goals_for}).`,
      },
      { status: 400 },
    );
  }

  const { error: upsertError } = await auth.admin
    .from("match_stats")
    .upsert(rows, { onConflict: "match_id,player_id" });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  const { error: matchUpdateError } = await auth.admin
    .from("matches")
    .update({ acta_published_at: new Date().toISOString() })
    .eq("id", fixtureId);

  if (matchUpdateError) {
    return NextResponse.json({ error: matchUpdateError.message }, { status: 500 });
  }

  try {
    await evaluateAchievementsAfterActa(auth.admin, fixtureId);
  } catch {
    // Insignias opcionales hasta SQL #19
  }

  return NextResponse.json({ ok: true, updated: rows.length });
}
