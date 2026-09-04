import { supabase } from "@/lib/supabase";

async function uploadViaApi(
  academyId: string,
  file: File,
  kind: "photo" | "video" | "logo" | "diagnosis-photo" | "diagnosis-video",
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Inicia sesión para subir archivos.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("academy_id", academyId);
  form.append("kind", kind);

  const response = await fetch("/fut/api/media/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: form,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    url?: string;
    previewUrl?: string;
    kind?: "photo" | "video";
  };

  if (!response.ok || !payload.url) {
    throw new Error(payload.error || "No se pudo subir el archivo.");
  }

  return payload;
}

export async function uploadPlayerPhoto(academyId: string, file: File) {
  const payload = await uploadViaApi(academyId, file, "photo");
  return payload.url!;
}

export async function uploadPlayerVideo(academyId: string, file: File) {
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("El video debe pesar máximo 50 MB.");
  }
  const payload = await uploadViaApi(academyId, file, "video");
  return payload.url!;
}

export async function uploadAcademyLogo(academyId: string, file: File) {
  const payload = await uploadViaApi(academyId, file, "logo");
  return payload.url!;
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

  const payload = await uploadViaApi(
    academyId,
    file,
    kind === "video" ? "diagnosis-video" : "diagnosis-photo",
  );

  return {
    kind,
    url: payload.url!,
    previewUrl: payload.previewUrl || payload.url!,
  };
}
