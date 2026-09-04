import { NextResponse } from "next/server";
import { requireDiagnosisAccess } from "@/lib/player-diagnosis-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const PHOTO_MAX = 12 * 1024 * 1024;
const VIDEO_MAX = 50 * 1024 * 1024;

type MediaKind = "photo" | "video" | "logo" | "diagnosis-photo" | "diagnosis-video";

function bucketFor(kind: MediaKind) {
  if (kind === "logo") return "academy-logos" as const;
  if (kind === "video" || kind === "diagnosis-video") return "player-videos" as const;
  return "player-photos" as const;
}

function folderFor(kind: MediaKind, academyId: string) {
  if (kind === "diagnosis-photo" || kind === "diagnosis-video") {
    return `${academyId}/diagnosis`;
  }
  return academyId;
}

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const academyId = String(form.get("academy_id") ?? "").trim();
    const kind = String(form.get("kind") ?? "photo").trim() as MediaKind;

    if (!(file instanceof File) || !academyId) {
      return NextResponse.json(
        { error: "file y academy_id son obligatorios." },
        { status: 400 },
      );
    }

    if (
      !["photo", "video", "logo", "diagnosis-photo", "diagnosis-video"].includes(kind)
    ) {
      return NextResponse.json({ error: "kind inválido." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    await requireDiagnosisAccess(supabase, user, academyId);

    const max = kind.includes("video") ? VIDEO_MAX : PHOTO_MAX;
    if (file.size > max) {
      return NextResponse.json(
        {
          error: kind.includes("video")
            ? "El video debe pesar máximo 50 MB."
            : "La foto debe pesar máximo 12 MB.",
        },
        { status: 400 },
      );
    }

    const bucket = bucketFor(kind);
    const extension =
      (file.name.split(".").pop() || (kind.includes("video") ? "mp4" : "jpg")).toLowerCase();
    const path = `${folderFor(kind, academyId)}/${crypto.randomUUID()}.${extension}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await admin.storage.from(bucket).upload(path, buffer, {
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) throw new Error(error.message);

    const { data: publicData } = admin.storage.from(bucket).getPublicUrl(path);
    const { data: signed } = await admin.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60 * 24 * 7);

    return NextResponse.json({
      path,
      bucket,
      url: publicData.publicUrl,
      previewUrl: signed?.signedUrl || publicData.publicUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo subir el archivo.";
    const status = message === "No autorizado." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
