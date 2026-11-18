/** Límites de material del tutor (ficha). */
export const TUTOR_PHOTO_MAX_BYTES = 12 * 1024 * 1024;
export const TUTOR_VIDEO_MAX_BYTES = 100 * 1024 * 1024;

/** Tope de video por cuenta (todas las fichas del tutor). */
export const TUTOR_VIDEO_QUOTA_BYTES = 500 * 1024 * 1024;

/** Por encima de esto se intenta comprimir en el navegador antes de subir. */
export const TUTOR_VIDEO_COMPRESS_THRESHOLD_BYTES = 25 * 1024 * 1024;

export const TUTOR_PHOTO_MAX_LABEL = "12 MB";
export const TUTOR_VIDEO_MAX_LABEL = "100 MB";
export const TUTOR_VIDEO_QUOTA_LABEL = "500 MB";

export function tutorMediaMaxBytes(kind: "photo" | "video") {
  return kind === "video" ? TUTOR_VIDEO_MAX_BYTES : TUTOR_PHOTO_MAX_BYTES;
}

export function tutorMediaMaxLabel(kind: "photo" | "video") {
  return kind === "video" ? TUTOR_VIDEO_MAX_LABEL : TUTOR_PHOTO_MAX_LABEL;
}

export function formatBytesAsMb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatQuotaMb(usedBytes: number, quotaBytes = TUTOR_VIDEO_QUOTA_BYTES) {
  const used = Math.max(0, usedBytes) / (1024 * 1024);
  const quota = quotaBytes / (1024 * 1024);
  return {
    usedLabel: `${used.toFixed(0)} MB`,
    quotaLabel: `${quota.toFixed(0)} MB`,
    percent: Math.min(100, Math.round((Math.max(0, usedBytes) / quotaBytes) * 100)),
    remainingBytes: Math.max(0, quotaBytes - Math.max(0, usedBytes)),
  };
}

export function assertTutorMediaSize(kind: "photo" | "video", file: File) {
  const max = tutorMediaMaxBytes(kind);
  if (file.size <= max) return;
  const label = kind === "video" ? "video" : "foto";
  throw new Error(
    `Ese ${label} pesa ${formatBytesAsMb(file.size)}. El máximo es ${tutorMediaMaxLabel(kind)}.`,
  );
}

export function assertTutorVideoQuota(usedBytes: number, incomingBytes: number) {
  if (usedBytes + incomingBytes <= TUTOR_VIDEO_QUOTA_BYTES) return;
  throw new Error(
    `Llegaste al límite de ${TUTOR_VIDEO_QUOTA_LABEL} de video en tu cuenta. Borra un video para subir otro.`,
  );
}

export function friendlyTutorUploadError(message: string, kind: "photo" | "video") {
  const lower = message.toLowerCase();
  if (lower.includes("límite") && lower.includes("video")) {
    return message;
  }
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

export type TutorUploadPhase = "compress" | "prepare" | "upload" | "save";

export type TutorUploadState = {
  kind: "photo" | "video";
  fileName: string;
  phase: TutorUploadPhase;
  /** 0–100 mientras sube/comprime; null en prepare/save. */
  percent: number | null;
  /** Carga múltiple: archivo actual (1-based) y total. */
  index?: number;
  total?: number;
};
