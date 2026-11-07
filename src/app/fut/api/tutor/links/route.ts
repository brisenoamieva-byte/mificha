import { NextResponse } from "next/server";
import { getTutorChild } from "@/lib/tutor-family";
import {
  linkTutorChildToPlayer,
  suggestAcademyPlayersForChild,
  unlinkTutorChild,
} from "@/lib/tutor-player-link";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const childId = new URL(request.url).searchParams.get("child_id")?.trim();
  if (!childId) {
    return NextResponse.json({ error: "child_id es obligatorio." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const child = await getTutorChild(admin, user.id, childId);
    if (!child) {
      return NextResponse.json({ error: "Jugador no encontrado." }, { status: 404 });
    }
    const suggestions = await suggestAcademyPlayersForChild(admin, child);
    return NextResponse.json({
      child: {
        id: child.id,
        linked_player_id: child.linked_player_id,
        linked_academy_id: child.linked_academy_id,
        linked_academy_name: child.linked_academy_name,
        linked_player_slug: child.linked_player_slug,
        linked_at: child.linked_at,
      },
      suggestions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo buscar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    child_id?: string;
    player_id?: string;
  };

  const childId = String(body.child_id ?? "").trim();
  if (!childId) {
    return NextResponse.json({ error: "child_id es obligatorio." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    if (body.action === "unlink") {
      const child = await unlinkTutorChild(admin, user.id, childId);
      return NextResponse.json({ ok: true, child });
    }

    const playerId = String(body.player_id ?? "").trim();
    if (!playerId) {
      return NextResponse.json({ error: "player_id es obligatorio." }, { status: 400 });
    }
    const child = await linkTutorChildToPlayer(admin, user.id, childId, playerId);
    return NextResponse.json({ ok: true, child });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo vincular.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
