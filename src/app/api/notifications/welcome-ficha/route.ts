import { NextResponse } from "next/server";
import {
  dispatchWelcomeFichaNotifications,
  summarizeNotificationResults,
} from "@/lib/guardian-notifications";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

interface WelcomeFichaBody {
  academy_id?: string;
  player_ids?: string[];
}

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = (await request.json()) as WelcomeFichaBody;
  const academyId = body.academy_id?.trim();

  if (!academyId) {
    return NextResponse.json({ error: "academy_id es obligatorio." }, { status: 400 });
  }

  const { data: academy } = await supabase
    .from("academies")
    .select("id, name, owner_id")
    .eq("id", academyId)
    .maybeSingle();

  if (!academy || academy.owner_id !== user.id) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const results = await dispatchWelcomeFichaNotifications({
    supabase,
    academyId,
    academyName: academy.name,
    playerIds: body.player_ids,
  });

  const summary = summarizeNotificationResults(results);

  return NextResponse.json({ summary, results });
}
