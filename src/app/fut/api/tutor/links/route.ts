import { NextResponse } from "next/server";
import { getTutorChild } from "@/lib/tutor-family";
import {
  acceptLinkRequest,
  cancelActiveLinkAsTutor,
  listPendingLinkRequestsForTutor,
  rejectLinkRequest,
  requestLinkFromTutor,
} from "@/lib/tutor-link-requests";
import {
  suggestAcademyPlayersForChild,
  unlinkTutorChildPlayer,
} from "@/lib/tutor-player-link";
import { childMemberships } from "@/lib/tutor-memberships";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const url = new URL(request.url);
  const childId = url.searchParams.get("child_id")?.trim();
  const pendingOnly = url.searchParams.get("pending") === "1";

  try {
    const admin = createSupabaseAdminClient();
    if (pendingOnly || !childId) {
      const pending = await listPendingLinkRequestsForTutor(admin, user.id);
      return NextResponse.json({ pending });
    }

    const child = await getTutorChild(admin, user.id, childId);
    if (!child) {
      return NextResponse.json({ error: "Jugador no encontrado." }, { status: 404 });
    }
    const suggestions = await suggestAcademyPlayersForChild(admin, child);
    const pending = await listPendingLinkRequestsForTutor(admin, user.id);
    const childPending = pending.filter((row) => row.child_id === childId);
    const pendingPlayerIds = new Set(childPending.map((row) => row.player_id));
    return NextResponse.json({
      child: {
        id: child.id,
        memberships: childMemberships(child),
        linked_player_id: child.linked_player_id,
        linked_academy_id: child.linked_academy_id,
        linked_academy_name: child.linked_academy_name,
        linked_player_slug: child.linked_player_slug,
        linked_at: child.linked_at,
      },
      // No volver a ofrecer un plantel que ya tiene solicitud abierta.
      suggestions: suggestions.filter((row) => !pendingPlayerIds.has(row.player_id)),
      pending: childPending,
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
    request_id?: string;
    match?: "code" | "birth" | "contact" | "manual";
    confirm?: boolean;
  };

  try {
    const admin = createSupabaseAdminClient();

    if (body.action === "unlink") {
      const childId = String(body.child_id ?? "").trim();
      if (!childId) {
        return NextResponse.json({ error: "child_id es obligatorio." }, { status: 400 });
      }
      const playerId = String(body.player_id ?? "").trim();
      if (playerId) {
        const child = await unlinkTutorChildPlayer(admin, user.id, childId, playerId);
        return NextResponse.json({ ok: true, child });
      }
      const child = await cancelActiveLinkAsTutor(admin, user.id, childId);
      return NextResponse.json({ ok: true, child });
    }

    if (body.action === "accept") {
      const requestId = String(body.request_id ?? "").trim();
      if (!requestId) {
        return NextResponse.json({ error: "request_id es obligatorio." }, { status: 400 });
      }
      const result = await acceptLinkRequest(admin, {
        requestId,
        actor: "tutor",
        guardianUserId: user.id,
      });
      return NextResponse.json({ ok: true, ...result });
    }

    if (body.action === "reject") {
      const requestId = String(body.request_id ?? "").trim();
      if (!requestId) {
        return NextResponse.json({ error: "request_id es obligatorio." }, { status: 400 });
      }
      const requestRow = await rejectLinkRequest(admin, {
        requestId,
        actor: "tutor",
        guardianUserId: user.id,
      });
      return NextResponse.json({ ok: true, request: requestRow });
    }

    if (body.confirm !== true) {
      return NextResponse.json(
        { error: "Confirma el vínculo antes de conectar (confirm: true)." },
        { status: 400 },
      );
    }

    const childId = String(body.child_id ?? "").trim();
    const playerId = String(body.player_id ?? "").trim();
    if (!childId || !playerId) {
      return NextResponse.json(
        { error: "child_id y player_id son obligatorios." },
        { status: 400 },
      );
    }

    const result = await requestLinkFromTutor(
      admin,
      user.id,
      childId,
      playerId,
      body.match ?? "manual",
    );

    return NextResponse.json({
      ok: true,
      mode: result.mode,
      child: result.child,
      request: result.request,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo vincular.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
