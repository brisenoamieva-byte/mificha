import { NextResponse } from "next/server";
import {
  closeActaSession,
  findSessionByRefereeToken,
  publicActaSession,
} from "@/lib/match-acta-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface RouteContext {
  params: Promise<{ token: string }>;
}

interface CloseBody {
  referee_name?: string;
}

/** Cierra acta, firma árbitro y genera links QR de delegados. */
export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const body = (await request.json()) as CloseBody;
  const refereeName = body.referee_name?.trim();

  if (!refereeName) {
    return NextResponse.json(
      { error: "referee_name es obligatorio." },
      { status: 400 },
    );
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

    const closed = await closeActaSession(admin, found.session, {
      refereeName,
      request,
    });

    return NextResponse.json({
      session: publicActaSession(closed.session),
      score: closed.score,
      home_sign_token: closed.homeSignToken,
      away_sign_token: closed.awaySignToken,
      home_sign_url: closed.homeSignUrl,
      away_sign_url: closed.awaySignUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cerrar el acta.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
