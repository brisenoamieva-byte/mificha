import { NextResponse } from "next/server";
import { evaluateMatchAchievements } from "@/lib/evaluate-match-achievements";
import type { MatchCaptureAchievementInput } from "@/lib/player-achievements";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

interface EvaluateMatchBody {
  match_id?: string;
  season_id?: string;
  captures?: MatchCaptureAchievementInput[];
}

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = (await request.json()) as EvaluateMatchBody;
  const matchId = body.match_id?.trim();
  const seasonId = body.season_id?.trim();
  const captures = body.captures ?? [];

  if (!matchId || !seasonId || captures.length === 0) {
    return NextResponse.json(
      { error: "match_id, season_id y captures son obligatorios." },
      { status: 400 },
    );
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, academy_id")
    .eq("id", matchId)
    .maybeSingle();

  if (matchError || !match) {
    return NextResponse.json({ error: "Partido no encontrado." }, { status: 404 });
  }

  const result = await evaluateMatchAchievements(supabase, {
    matchId,
    seasonId,
    academyId: match.academy_id,
    captures,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, migrationPending: result.migrationPending },
      { status: result.migrationPending ? 503 : 500 },
    );
  }

  return NextResponse.json({ players: result.players });
}
