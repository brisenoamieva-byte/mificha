import { NextResponse } from "next/server";
import {
  createTutorChild,
  updateTutorChild,
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
    const input = parseInput(body);
    const childId = body.child_id ? String(body.child_id) : "";
    const child = childId
      ? await updateTutorChild(admin, user.id, childId, input)
      : await createTutorChild(admin, user, input);
    return NextResponse.json({ ok: true, child });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
