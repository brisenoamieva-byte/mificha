import { NextResponse } from "next/server";
import type { ActaEventType, ActaSide } from "@/lib/match-acta";
import {
  addActaEvent,
  findSessionByRefereeToken,
  publicActaSession,
} from "@/lib/match-acta-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface RouteContext {
  params: Promise<{ token: string }>;
}

interface EventBody {
  event_type?: ActaEventType;
  side?: ActaSide;
  lineup_id?: string;
  related_lineup_id?: string | null;
  minute?: number;
  stoppage?: number;
  notes?: string | null;
}

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const body = (await request.json()) as EventBody;

  if (!body.event_type || !body.side || !body.lineup_id || body.minute == null) {
    return NextResponse.json(
      { error: "event_type, side, lineup_id y minute son obligatorios." },
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

    const event = await addActaEvent(admin, found.session, {
      event_type: body.event_type,
      side: body.side,
      lineup_id: body.lineup_id,
      related_lineup_id: body.related_lineup_id ?? null,
      minute: body.minute,
      stoppage: body.stoppage,
      notes: body.notes,
    });

    const refreshed = await findSessionByRefereeToken(admin, token.trim());

    return NextResponse.json({
      event,
      session: publicActaSession(refreshed?.session ?? found.session),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo registrar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
