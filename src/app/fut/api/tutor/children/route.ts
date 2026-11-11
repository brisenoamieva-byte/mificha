import { NextResponse } from "next/server";
import { fireAndForgetOpsNotify } from "@/lib/email/ops-notify";
import {
  createTutorChild,
  syncTutorChildren,
  updateTutorChild,
  updateTutorExploreOptIn,
  type TutorChildInput,
} from "@/lib/tutor-family";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

function parseInput(body: Record<string, unknown>): TutorChildInput {
  const foot = body.dominant_foot;
  const dominant =
    foot === "left" || foot === "right" || foot === "both" ? foot : null;
  const heightRaw = body.height_cm;
  const height =
    typeof heightRaw === "number"
      ? heightRaw
      : heightRaw
        ? Number(heightRaw)
        : null;
  return {
    player_name: String(body.player_name ?? ""),
    guardian_phone: body.guardian_phone == null ? null : String(body.guardian_phone),
    birth_date: body.birth_date == null ? null : String(body.birth_date),
    position: body.position == null ? null : String(body.position),
    club: body.club == null ? null : String(body.club),
    school: body.school == null ? null : String(body.school),
    city: body.city == null ? null : String(body.city),
    height_cm: Number.isFinite(height) ? height : null,
    dominant_foot: dominant,
    bio: body.bio == null ? null : String(body.bio),
    goals: body.goals == null ? null : String(body.goals),
  };
}

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    const admin = createSupabaseAdminClient();
    const childId = body.child_id ? String(body.child_id) : "";

    if (childId && typeof body.explore_opt_in === "boolean" && body.action === "explore_opt_in") {
      const child = await updateTutorExploreOptIn(
        admin,
        user.id,
        childId,
        body.explore_opt_in,
      );
      return NextResponse.json({ ok: true, child });
    }

    const input = parseInput(body);
    if (childId) {
      const child = await updateTutorChild(admin, user.id, childId, input);
      return NextResponse.json({ ok: true, child });
    }

    const existing = await syncTutorChildren(admin, user, null);
    const child = await createTutorChild(admin, user, input);
    if (existing.length === 0) {
      fireAndForgetOpsNotify({
        kind: "tutor_signup",
        subject: `Nuevo tutor · ${user.email ?? "sin correo"}`,
        lines: [
          ["Tutor", user.email ?? user.id],
          ["Jugador", child.player_name],
          ["Teléfono", child.guardian_phone],
          ["Código", child.public_code],
          ["Ciudad", child.profile.city],
        ],
      });
    }
    return NextResponse.json({ ok: true, child });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
