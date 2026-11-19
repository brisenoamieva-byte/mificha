/**
 * Helpers para file inputs en iPhone / Android.
 *
 * - FileList es "live": si limpias input.value antes de copiar, queda vacío.
 * - `display:none` / `.hidden` + input.click() falla en Chrome Android.
 * - En iOS, `accept` con JPEG primero hace que HEIC se convierta a JPEG.
 */

/** JPEG primero: iPhone convierte HEIC → JPEG. Android sigue eligiendo JPG/PNG. */
export const MOBILE_PHOTO_ACCEPT =
  "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

export const MOBILE_VIDEO_ACCEPT =
  "video/mp4,video/quicktime,video/webm,video/*,.mp4,.mov,.webm";

/** Clase segura para inputs disparados con ref.click() (no usar `hidden`). */
export const MOBILE_FILE_INPUT_CLASS =
  "absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 opacity-0";

/** Overlay táctil: el dedo cae sobre el input (mejor en Android/iOS). */
export const MOBILE_FILE_OVERLAY_CLASS =
  "absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed";

/** Copia archivos y limpia el input (evita FileList vacío). */
export function readFilesFromInput(input: HTMLInputElement | null): File[] {
  if (!input) return [];
  const files = Array.from(input.files ?? []);
  input.value = "";
  return files;
}

export function readFirstFileFromInput(input: HTMLInputElement | null): File | null {
  return readFilesFromInput(input)[0] ?? null;
}

function isHeicLike(file: File) {
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    type.includes("heic") ||
    type.includes("heif") ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

/**
 * Si llega HEIC (p. ej. Mac Safari o Android HEIF), intenta JPEG vía canvas.
 * En iPhone con accept JPEG-first normalmente ya llega JPEG.
 */
export async function normalizeMobilePhoto(file: File): Promise<File> {
  if (!isHeicLike(file)) return file;
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    throw new Error(
      "Esa foto está en HEIC. En iPhone: Ajustes → Cámara → Formatos → Más compatible, o vuelve a elegirla (debe convertirse a JPG).",
    );
  }
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9),
    );
    if (!blob || blob.size <= 0) throw new Error("empty");
    const base = file.name.replace(/\.(heic|heif)$/i, "") || "foto";
    return new File([blob], `${base}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    throw new Error(
      "No se pudo usar esa foto HEIC. En iPhone elige de Fotos (no Archivos) o activa «Más compatible» en Cámara.",
    );
  }
}
