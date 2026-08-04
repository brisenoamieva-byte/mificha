import { NextResponse } from "next/server";
import {
  findSessionByRefereeToken,
  loadActaBundle,
  loadAcademyPlayersForActa,
  publicActaSession,
} from "@/lib/match-acta-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface RouteContext {
  params: Promise<{ token: string }>;
}

/** Carga sesión completa para el árbitro (+ planteles disponibles). */
export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  if (!token?.trim()) {
    return NextResponse.json({ error: "Token inválido." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const found = await findSessionByRefereeToken(admin, token.trim());

    if (!found) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
    }
    if (found.expired) {
      return NextResponse.json({ error: "El link del árbitro expiró." }, { status: 410 });
    }

    const bundle = await loadActaBundle(admin, found.session.id);
    if (!bundle) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
    }

    const [homePlayers, awayPlayers] = await Promise.all([
      loadAcademyPlayersForActa(admin, bundle.session.home_academy_id),
      bundle.session.away_academy_id
        ? loadAcademyPlayersForActa(admin, bundle.session.away_academy_id)
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      session: publicActaSession(bundle.session),
      lineups: bundle.lineups,
      events: bundle.events,
      signatures: bundle.signatures.map((row) => ({
        signer_role: row.signer_role,
        decision: row.decision,
        signer_name: row.signer_name,
        signed_at: row.signed_at,
      })),
      roster: {
        home: homePlayers,
        away: awayPlayers,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
