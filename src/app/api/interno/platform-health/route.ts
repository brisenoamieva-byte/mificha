import { NextResponse } from "next/server";
import { isResendProductionReady } from "@/lib/email/resend-config";
import { canAccessPitchDeck } from "@/lib/pitch-access";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

async function probeColumn(table: "matches" | "players", column: string) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from(table).select(column).limit(0);
  return !error;
}

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!canAccessPitchDeck(user?.id, user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const [matchStatusOk, kickoffOk, guardianOk] = await Promise.all([
    probeColumn("matches", "status"),
    probeColumn("matches", "kickoff_at"),
    probeColumn("players", "guardian_email"),
  ]);

  return NextResponse.json({
    sql: {
      matchSchedule: matchStatusOk && kickoffOk,
      guardianContact: guardianOk,
    },
    resend: {
      ready: isResendProductionReady(),
    },
    launchFree: process.env.NEXT_PUBLIC_LAUNCH_FREE !== "false",
  });
}
