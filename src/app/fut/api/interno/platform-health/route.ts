import { NextResponse } from "next/server";
import { isResendProductionReady } from "@/lib/email/resend-config";
import { canAccessPitchDeck } from "@/lib/pitch-access";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

async function probeColumn(
  table: "matches" | "players" | "player_profile_views",
  column: string,
) {
  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from(table).select(column).limit(0);
    return !error;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!canAccessPitchDeck(user?.id, user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const [matchStatusOk, kickoffOk, guardianOk, profileViewsOk] = await Promise.all([
    probeColumn("matches", "status"),
    probeColumn("matches", "kickoff_at"),
    probeColumn("players", "guardian_email"),
    probeColumn("player_profile_views", "visitor_key"),
  ]);

  const scheduleKnown = matchStatusOk !== null && kickoffOk !== null;
  const guardianKnown = guardianOk !== null;

  const profileViewsKnown = profileViewsOk !== null;

  return NextResponse.json({
    sql: {
      matchSchedule: scheduleKnown ? matchStatusOk && kickoffOk : null,
      guardianContact: guardianKnown ? guardianOk : null,
      profileViews: profileViewsKnown ? profileViewsOk : null,
    },
    resend: {
      ready: isResendProductionReady(),
    },
    launchFree: process.env.NEXT_PUBLIC_LAUNCH_FREE !== "false",
    checksAvailable: scheduleKnown && guardianKnown && profileViewsKnown,
  });
}
