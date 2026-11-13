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
import { linkAcademyPlayerToTutorChild } from "@/lib/tutor-player-link";

/**
 * Vincula plantel ↔ ficha tutor. Requiere confirm: true (nunca enlace silencioso).
 * public_code opcional: unifica el MF- en el jugador de academia.
 */
export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    academy_id?: string;
    player_id?: string;
    child_id?: string;
    public_code?: string;
    confirm?: boolean;
  };

  const academyId = String(body.academy_id ?? "").trim();
  const playerId = String(body.player_id ?? "").trim();
  const childId = String(body.child_id ?? "").trim();

  if (!academyId || !playerId) {
    return NextResponse.json(
      { error: "academy_id y player_id son obligatorios." },
      { status: 400 },
    );
  }

  if (body.confirm !== true) {
    return NextResponse.json(
      { error: "Confirma el vínculo antes de conectar (confirm: true)." },
      { status: 400 },
    );
  }

  if (!childId) {
    return NextResponse.json(
      { error: "child_id es obligatorio para vincular." },
      { status: 400 },
    );
  }

  try {
    const admin = createSupabaseAdminClient();
    const isGph = await isGphEvaluatorUser(admin, user.id, user.email);
    if (!isGph) await requireAcademyAccess(supabase, user.id, academyId);

    const preferred = normalizePublicCode(body.public_code);
    if (preferred) {
      const tutorCodes = await listTutorPublicCodes(admin);
      await bindPlayerPublicCode(admin, playerId, preferred, tutorCodes);
    }

    const child = await linkAcademyPlayerToTutorChild(
      admin,
      user.id,
      academyId,
      playerId,
      childId,
    );

    return NextResponse.json({ ok: true, child });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo vincular.";
    const status = message === "No autorizado." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
