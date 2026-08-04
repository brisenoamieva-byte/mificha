import { NextResponse } from "next/server";
import type { ActaLineupRole, ActaSide } from "@/lib/match-acta";
import {
  findSessionByRefereeToken,
  publicActaSession,
  replaceLineupSide,
  startCapturingIfReady,
} from "@/lib/match-acta-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface RouteContext {
  params: Promise<{ token: string }>;
}

interface LineupBody {
  side?: ActaSide;
  players?: Array<{
    player_id?: string | null;
    jersey_number?: number | null;
    display_name?: string;
    role?: ActaLineupRole;
    sort_order?: number;
  }>;
  start_capturing?: boolean;
}

export async function PUT(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const body = (await request.json()) as LineupBody;
  const side = body.side;
  const players = body.players ?? [];

  if (side !== "home" && side !== "away") {
    return NextResponse.json({ error: "side debe ser home o away." }, { status: 400 });
  }

  if (players.length === 0) {
    return NextResponse.json({ error: "players es obligatorio." }, { status: 400 });
  }

  try {
    const normalized = players.map((player, index) => {
      const displayName = player.display_name?.trim();
      if (!displayName) {
        throw new Error(`players[${index}].display_name es obligatorio.`);
      }
      if (player.role !== "starter" && player.role !== "bench") {
        throw new Error(`players[${index}].role inválido.`);
      }
      return {
        player_id: player.player_id ?? null,
        jersey_number: player.jersey_number ?? null,
        display_name: displayName,
        role: player.role,
        sort_order: player.sort_order ?? index,
      };
    });

    const admin = createSupabaseAdminClient();
    const found = await findSessionByRefereeToken(admin, token.trim());
    if (!found) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
    }
    if (found.expired) {
      return NextResponse.json({ error: "El link del árbitro expiró." }, { status: 410 });
    }

    const lineups = await replaceLineupSide(admin, found.session, side, normalized);
    let session = found.session;

    if (body.start_capturing) {
      session = await startCapturingIfReady(admin, found.session.id);
    }

    return NextResponse.json({
      session: publicActaSession(session),
      lineups,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
