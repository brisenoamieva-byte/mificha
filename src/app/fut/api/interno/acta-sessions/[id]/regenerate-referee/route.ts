import { NextResponse } from "next/server";
import {
  publicActaSession,
  regenerateRefereeToken,
} from "@/lib/match-acta-server";
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

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Regenera el link del árbitro (invalida el anterior). */
export async function POST(request: Request, context: RouteContext) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const { id } = await context.params;

  try {
    const regenerated = await regenerateRefereeToken(auth.admin, id);
    return NextResponse.json({
      session: publicActaSession(regenerated.session),
      referee_token: regenerated.refereeToken,
      referee_url: regenerated.refereeUrl,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo regenerar el link.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
