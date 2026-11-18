/** Límites de material del tutor (ficha). Video 100 MB para clips más largos sin editar tanto. */
export const TUTOR_PHOTO_MAX_BYTES = 12 * 1024 * 1024;
export const TUTOR_VIDEO_MAX_BYTES = 100 * 1024 * 1024;

export const TUTOR_PHOTO_MAX_LABEL = "12 MB";
export const TUTOR_VIDEO_MAX_LABEL = "100 MB";

export function tutorMediaMaxBytes(kind: "photo" | "video") {
  return kind === "video" ? TUTOR_VIDEO_MAX_BYTES : TUTOR_PHOTO_MAX_BYTES;
}

export function tutorMediaMaxLabel(kind: "photo" | "video") {
  return kind === "video" ? TUTOR_VIDEO_MAX_LABEL : TUTOR_PHOTO_MAX_LABEL;
}

export function formatBytesAsMb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function assertTutorMediaSize(kind: "photo" | "video", file: File) {
  const max = tutorMediaMaxBytes(kind);
  if (file.size <= max) return;
  const label = kind === "video" ? "video" : "foto";
  throw new Error(
    `Ese ${label} pesa ${formatBytesAsMb(file.size)}. El máximo es ${tutorMediaMaxLabel(kind)}.`,
  );
}

export function friendlyTutorUploadError(message: string, kind: "photo" | "video") {
  const lower = message.toLowerCase();
  if (
    lower.includes("maximum allowed size") ||
    lower.includes("payload too large") ||
    lower.includes("entitytoolarge") ||
    lower.includes("file size") ||
    lower.includes("exceeded")
  ) {
    return `El archivo supera el máximo permitido (${tutorMediaMaxLabel(kind)}).`;
  }
  return message;
}

export type TutorUploadPhase = "prepare" | "upload" | "save";

export type TutorUploadState = {
  kind: "photo" | "video";
  fileName: string;
  phase: TutorUploadPhase;
  /** 0–100 mientras sube el archivo; null en prepare/save. */
  percent: number | null;
  /** Carga múltiple: archivo actual (1-based) y total. */
  index?: number;
  total?: number;
};
