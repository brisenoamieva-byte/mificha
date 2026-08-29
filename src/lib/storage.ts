import { supabase } from "@/lib/supabase";

export async function uploadPlayerPhoto(academyId: string, file: File) {
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${academyId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("player-photos")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("player-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPlayerVideo(academyId: string, file: File) {
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("El video debe pesar máximo 50 MB.");
  }

  const extension = file.name.split(".").pop() ?? "mp4";
  const path = `${academyId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("player-videos")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("player-videos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAcademyLogo(academyId: string, file: File) {
  const extension = file.name.split(".").pop() ?? "png";
  const path = `${academyId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("academy-logos")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("academy-logos").getPublicUrl(path);
  return data.publicUrl;
}

const DIAGNOSIS_PHOTO_MAX_BYTES = 12 * 1024 * 1024;
const DIAGNOSIS_VIDEO_MAX_BYTES = 50 * 1024 * 1024;

export function diagnosisEvidenceKindFromFile(file: File): "photo" | "video" | null {
  if (file.type.startsWith("image/")) return "photo";
  if (file.type.startsWith("video/")) return "video";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "webp", "heic", "heif", "gif"].includes(ext)) return "photo";
  if (["mp4", "mov", "webm", "m4v", "qt"].includes(ext)) return "video";
  return null;
}

export async function uploadDiagnosisEvidence(academyId: string, file: File) {
  const kind = diagnosisEvidenceKindFromFile(file);
  if (!kind) {
    throw new Error("Usa una foto (JPG/PNG) o un video corto (MP4).");
  }
  const maxBytes = kind === "video" ? DIAGNOSIS_VIDEO_MAX_BYTES : DIAGNOSIS_PHOTO_MAX_BYTES;
  if (file.size > maxBytes) {
    throw new Error(
      kind === "video"
        ? "El video debe pesar máximo 50 MB."
        : "La foto debe pesar máximo 12 MB.",
    );
  }

  const bucket = kind === "video" ? "player-videos" : "player-photos";
  const extension = (file.name.split(".").pop() || (kind === "video" ? "mp4" : "jpg")).toLowerCase();
  const path = `${academyId}/diagnosis/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24);

  return {
    kind,
    url: data.publicUrl,
    previewUrl: signed?.signedUrl || data.publicUrl,
  };
}
