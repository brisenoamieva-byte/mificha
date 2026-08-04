import { NextResponse } from "next/server";
import {
  findSessionByRefereeToken,
  publicActaSession,
  regenerateSignTokens,
} from "@/lib/match-acta-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface RouteContext {
  params: Promise<{ token: string }>;
}

/** Regenera links QR de firmas (solo pending_signatures). */
export async function POST(_request: Request, context: RouteContext) {
  const { token } = await context.params;

  try {
    const admin = createSupabaseAdminClient();
    const found = await findSessionByRefereeToken(admin, token.trim());
    if (!found) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
    }
    if (found.expired) {
      return NextResponse.json({ error: "El link del árbitro expiró." }, { status: 410 });
    }

    const regenerated = await regenerateSignTokens(admin, found.session.id);
    return NextResponse.json({
      session: publicActaSession(regenerated.session),
      home_sign_url: regenerated.homeSignUrl,
      away_sign_url: regenerated.awaySignUrl,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudieron regenerar firmas.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
