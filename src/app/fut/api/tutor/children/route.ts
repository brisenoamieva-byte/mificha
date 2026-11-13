import { NextResponse } from "next/server";
import { fireAndForgetOpsNotify } from "@/lib/email/ops-notify";
import {
  createTutorChild,
  grantTutorLinkedAcademyConsent,
  listGuardianChildren,
  normalizeGuardianKind,
  parseLinesToList,
  parseTitleDetailLines,
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
  const weightRaw = body.weight_kg;
  const weight =
    typeof weightRaw === "number"
      ? weightRaw
      : weightRaw
        ? Number(weightRaw)
        : null;
  return {
    player_name: String(body.player_name ?? ""),
    public_code: body.public_code == null ? null : String(body.public_code),
    guardian_phone: body.guardian_phone == null ? null : String(body.guardian_phone),
    guardian_kind: normalizeGuardianKind(
      body.guardian_kind == null ? undefined : String(body.guardian_kind),
    ),
    birth_date: body.birth_date == null ? null : String(body.birth_date),
    position: body.position == null ? null : String(body.position),
    club: body.club == null ? null : String(body.club),
    school: body.school == null ? null : String(body.school),
    city: body.city == null ? null : String(body.city),
    height_cm: Number.isFinite(height) ? height : null,
    weight_kg: Number.isFinite(weight) ? weight : null,
    nationality: body.nationality == null ? null : String(body.nationality),
    dominant_foot: dominant,
    bio: body.bio == null ? null : String(body.bio),
    goals: body.goals == null ? null : String(body.goals),
    youtube_url: body.youtube_url == null ? null : String(body.youtube_url),
    transfermarkt_url:
      body.transfermarkt_url == null ? null : String(body.transfermarkt_url),
    role_title: body.role_title == null ? null : String(body.role_title),
    tagline: body.tagline == null ? null : String(body.tagline),
    contact_email: body.contact_email == null ? null : String(body.contact_email),
    instagram: body.instagram == null ? null : String(body.instagram),
    highlight_chips: Array.isArray(body.highlight_chips)
      ? body.highlight_chips.map((item) => String(item))
      : parseLinesToList(
          body.highlight_chips_text == null
            ? null
            : String(body.highlight_chips_text),
          4,
        ),
    achievements: Array.isArray(body.achievements)
      ? (body.achievements as Array<{ title: string; detail: string }>)
      : parseTitleDetailLines(
          body.achievements_text == null ? null : String(body.achievements_text),
          12,
        ),
    callups: Array.isArray(body.callups)
      ? (body.callups as Array<{ level: string; detail: string }>).map((row) => ({
          level: row.level,
          detail: row.detail,
        }))
      : parseTitleDetailLines(
          body.callups_text == null ? null : String(body.callups_text),
          12,
        ).map((row) => ({ level: row.title, detail: row.detail })),
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
        { consentAck: body.consent_ack === true || body.explore_opt_in === false },
      );
      return NextResponse.json({ ok: true, child });
    }

    if (childId && body.action === "linked_academy_consent") {
      const child = await grantTutorLinkedAcademyConsent(admin, user.id, childId, {
        consentAck: body.consent_ack === true,
      });
      return NextResponse.json({ ok: true, child });
    }

    const input = parseInput(body);
    if (childId) {
      const child = await updateTutorChild(admin, user.id, childId, input);
      return NextResponse.json({ ok: true, child });
    }

    const existing = await listGuardianChildren(admin, user, null, "all");
    const child = await createTutorChild(admin, user, input);
    if (existing.length === 0) {
      fireAndForgetOpsNotify({
        kind: "tutor_signup",
        subject: `Nueva cuenta persona · ${user.email ?? "sin correo"}`,
        lines: [
          ["Cuenta", user.email ?? user.id],
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
