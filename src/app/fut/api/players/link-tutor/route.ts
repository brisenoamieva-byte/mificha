import { NextResponse } from "next/server";
import { requireAcademyAccess } from "@/lib/academy-members-server";
import { isGphEvaluatorUser } from "@/lib/gph-partner-server";
import {
  bindPlayerPublicCode,
  normalizePublicCode,
} from "@/lib/public-player-code";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";
import { listTutorPublicCodes } from "@/lib/tutor-family";
import {
  acceptLinkRequest,
  listPendingLinkRequestsForAcademy,
  rejectLinkRequest,
  requestLinkFromAcademy,
} from "@/lib/tutor-link-requests";

/**
 * Vincula plantel ↔ ficha tutor.
 * Sin MF- compartido: queda pendiente de aceptación del tutor.
 * Con MF- igual o action accept: se activa.
 */
export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const academyId = new URL(request.url).searchParams.get("academy_id")?.trim();
  if (!academyId) {
    return NextResponse.json({ error: "academy_id es obligatorio." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const isGph = await isGphEvaluatorUser(admin, user.id, user.email);
    if (!isGph) await requireAcademyAccess(supabase, user.id, academyId);
    const pending = await listPendingLinkRequestsForAcademy(admin, academyId);
    return NextResponse.json({ pending });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar.";
    const status = message === "No autorizado." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
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
    academy_id?: string;
    player_id?: string;
    child_id?: string;
    public_code?: string;
    request_id?: string;
    match?: "code" | "birth" | "contact" | "manual";
    confirm?: boolean;
  };

  const academyId = String(body.academy_id ?? "").trim();
  if (!academyId) {
    return NextResponse.json({ error: "academy_id es obligatorio." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const isGph = await isGphEvaluatorUser(admin, user.id, user.email);
    if (!isGph) await requireAcademyAccess(supabase, user.id, academyId);

    if (body.action === "accept") {
      const requestId = String(body.request_id ?? "").trim();
      if (!requestId) {
        return NextResponse.json({ error: "request_id es obligatorio." }, { status: 400 });
      }
      const result = await acceptLinkRequest(admin, {
        requestId,
        actor: "academy",
        academyId,
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
        actor: "academy",
        academyId,
      });
      return NextResponse.json({ ok: true, request: requestRow });
    }

    if (body.confirm !== true) {
      return NextResponse.json(
        { error: "Confirma el vínculo antes de conectar (confirm: true)." },
        { status: 400 },
      );
    }

    const playerId = String(body.player_id ?? "").trim();
    const childId = String(body.child_id ?? "").trim();
    if (!playerId || !childId) {
      return NextResponse.json(
        { error: "player_id y child_id son obligatorios." },
        { status: 400 },
      );
    }

    const preferred = normalizePublicCode(body.public_code);
    if (preferred) {
      const tutorCodes = await listTutorPublicCodes(admin);
      await bindPlayerPublicCode(admin, playerId, preferred, tutorCodes);
    }

    const result = await requestLinkFromAcademy(
      admin,
      academyId,
      playerId,
      childId,
      preferred ? "code" : (body.match ?? "manual"),
    );

    return NextResponse.json({
      ok: true,
      mode: result.mode,
      child: result.child,
      request: result.request,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo vincular.";
    const status = message === "No autorizado." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
