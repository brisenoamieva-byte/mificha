import { NextResponse } from "next/server";
import {
  addTutorStory,
  commitTutorUpload,
  deleteTutorMaterial,
  getTutorChild,
  getTutorVideoUsageBytes,
  prepareTutorUpload,
  setTutorFeaturedVideo,
  setTutorPhotoCover,
} from "@/lib/tutor-family";
import { TUTOR_VIDEO_QUOTA_BYTES } from "@/lib/tutor-media-limits";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

async function requireUser(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function POST(request: Request) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    child_id?: string;
    material_id?: string;
    kind?: string;
    title?: string;
    body?: string;
    file_name?: string;
    path?: string;
    file_size?: number;
    byte_size?: number;
  };

  try {
    const admin = createSupabaseAdminClient();
    const child = await getTutorChild(admin, user.id, String(body.child_id ?? ""));
    if (!child) {
      return NextResponse.json({ error: "No encontramos a ese jugador." }, { status: 404 });
    }

    if (body.action === "story") {
      const row = await addTutorStory(
        admin,
        child,
        String(body.title ?? ""),
        String(body.body ?? ""),
      );
      return NextResponse.json({ ok: true, material: row });
    }

    if (body.action === "prepare" && (body.kind === "photo" || body.kind === "video")) {
      const upload = await prepareTutorUpload(
        admin,
        child,
        body.kind,
        String(body.file_name ?? "archivo"),
        body.file_size == null ? null : Number(body.file_size),
      );
      return NextResponse.json({ ok: true, ...upload });
    }

    if (body.action === "commit" && (body.kind === "photo" || body.kind === "video")) {
      const row = await commitTutorUpload(admin, child, {
        kind: body.kind,
        title: String(body.title ?? ""),
        path: String(body.path ?? ""),
        byte_size: body.byte_size == null ? body.file_size ?? null : body.byte_size,
      });
      const videoUsed = await getTutorVideoUsageBytes(admin, child.guardian_user_id);
      return NextResponse.json({
        ok: true,
        material: row,
        video_used_bytes: videoUsed,
        video_quota_bytes: TUTOR_VIDEO_QUOTA_BYTES,
      });
    }

    if (body.action === "delete") {
      const result = await deleteTutorMaterial(
        admin,
        child,
        String(body.material_id ?? ""),
      );
      const videoUsed = await getTutorVideoUsageBytes(admin, child.guardian_user_id);
      return NextResponse.json({
        ...result,
        video_used_bytes: videoUsed,
        video_quota_bytes: TUTOR_VIDEO_QUOTA_BYTES,
      });
    }

    if (body.action === "set_cover") {
      const row = await setTutorPhotoCover(
        admin,
        child,
        String(body.material_id ?? ""),
      );
      return NextResponse.json({ ok: true, material: row });
    }

    if (body.action === "set_featured") {
      const row = await setTutorFeaturedVideo(
        admin,
        child,
        String(body.material_id ?? ""),
      );
      return NextResponse.json({ ok: true, material: row });
    }

    return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar.";
    const status = message.includes("membresía") ? 402 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
