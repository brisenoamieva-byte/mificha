import { NextResponse } from "next/server";
import {
  dispatchMatchUpdateNotifications,
  summarizeNotificationResults,
} from "@/lib/guardian-notifications";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";
import { publishAcademyMatchActivity } from "@/lib/tutor-activity";

interface MatchNotificationBody {
  match_id?: string;
  academy_id?: string;
  opponent?: string;
  player_ids?: string[];
  previous_passport_by_player?: Record<string, number>;
  achievement_keys_by_player?: Record<string, string[]>;
  weekly_by_player?: Record<
    string,
    {
      rank: number;
      total: number;
      positions_delta: number | null;
    }
  >;
}

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = (await request.json()) as MatchNotificationBody;
  const matchId = body.match_id?.trim();
  const academyId = body.academy_id?.trim();
  const opponent = body.opponent?.trim();
  const playerIds = body.player_ids ?? [];

  if (!matchId || !academyId || !opponent || playerIds.length === 0) {
    return NextResponse.json(
      { error: "match_id, academy_id, opponent y player_ids son obligatorios." },
      { status: 400 },
    );
  }

  const { data: academy } = await supabase
    .from("academies")
    .select("id, owner_id")
    .eq("id", academyId)
    .maybeSingle();

  if (!academy || academy.owner_id !== user.id) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const results = await dispatchMatchUpdateNotifications({
    supabase,
    academyId,
    matchId,
    opponent,
    playerIds,
    previousPassportByPlayer: new Map(
      Object.entries(body.previous_passport_by_player ?? {}),
    ),
    achievementKeysByPlayer: new Map(
      Object.entries(body.achievement_keys_by_player ?? {}),
    ),
    weeklyByPlayer: new Map(Object.entries(body.weekly_by_player ?? {})),
  });

  const summary = summarizeNotificationResults(results);

  let tutorInbox = 0;
  try {
    const admin = createSupabaseAdminClient();
    const { data: matchRow } = await admin
      .from("matches")
      .select("match_date")
      .eq("id", matchId)
      .maybeSingle();
    const published = await publishAcademyMatchActivity(admin, {
      academyId,
      matchId,
      opponent,
      matchDate: matchRow?.match_date ? String(matchRow.match_date).slice(0, 10) : null,
      playerIds,
    });
    tutorInbox = published.length;
  } catch {
    // La notificación WhatsApp/email ya salió; el inbox tutor no debe tumbar el flujo.
  }

  return NextResponse.json({ summary, results, tutor_inbox: tutorInbox });
}
