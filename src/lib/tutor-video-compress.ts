import {
  TUTOR_VIDEO_COMPRESS_THRESHOLD_BYTES,
  TUTOR_VIDEO_MAX_BYTES,
} from "@/lib/tutor-media-limits";

const MAX_WIDTH = 1280;
const TARGET_BITRATE = 2_500_000;
const COMPRESS_TIMEOUT_MS = 120_000;

function pickRecorderMime() {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

/**
 * Si el video es grande, intenta re-encodear a ~720p en el navegador.
 * Si falla o no hay soporte, devuelve el original.
 */
export async function maybeCompressTutorVideo(
  file: File,
  onProgress?: (percent: number | null) => void,
): Promise<{ file: File; compressed: boolean }> {
  if (file.size <= TUTOR_VIDEO_COMPRESS_THRESHOLD_BYTES) {
    return { file, compressed: false };
  }
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { file, compressed: false };
  }
  const mime = pickRecorderMime();
  if (!mime) return { file, compressed: false };

  onProgress?.(0);

  try {
    const compressed = await Promise.race([
      compressWithCanvas(file, mime, onProgress),
      new Promise<File>((_, reject) => {
        window.setTimeout(
          () => reject(new Error("timeout")),
          COMPRESS_TIMEOUT_MS,
        );
      }),
    ]);

    // Solo usar si realmente bajó el peso y sigue dentro del máximo por archivo.
    if (
      compressed.size > 0 &&
      compressed.size < file.size * 0.92 &&
      compressed.size <= TUTOR_VIDEO_MAX_BYTES
    ) {
      onProgress?.(100);
      return { file: compressed, compressed: true };
    }
  } catch {
    /* fallback al original */
  }

  onProgress?.(null);
  return { file, compressed: false };
}

async function compressWithCanvas(
  file: File,
  mime: string,
  onProgress?: (percent: number | null) => void,
): Promise<File> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("No se pudo leer el video."));
    });

    const srcW = video.videoWidth || 1280;
    const srcH = video.videoHeight || 720;
    const scale = Math.min(1, MAX_WIDTH / srcW);
    const width = Math.max(2, Math.round((srcW * scale) / 2) * 2);
    const height = Math.max(2, Math.round((srcH * scale) / 2) * 2);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Sin canvas");

    const stream = canvas.captureStream(30);
    const audioTracks =
      (
        video as HTMLVideoElement & {
          captureStream?: () => MediaStream;
        }
      ).captureStream?.()?.getAudioTracks?.() ?? [];
    for (const track of audioTracks) {
      stream.addTrack(track);
    }

    const recorder = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: TARGET_BITRATE,
    });
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    const done = new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
      recorder.onerror = () => reject(new Error("Falló la compresión."));
    });

    recorder.start(250);
    await video.play();

    const duration = Number.isFinite(video.duration) && video.duration > 0
      ? video.duration
      : 0;

    await new Promise<void>((resolve, reject) => {
      const draw = () => {
        if (video.ended || video.paused) {
          resolve();
          return;
        }
        ctx.drawImage(video, 0, 0, width, height);
        if (duration > 0) {
          onProgress?.(Math.min(95, Math.round((video.currentTime / duration) * 100)));
        }
        requestAnimationFrame(draw);
      };
      video.onended = () => resolve();
      video.onerror = () => reject(new Error("Error al reproducir para comprimir."));
      draw();
    });

    if (recorder.state !== "inactive") recorder.stop();
    for (const track of stream.getTracks()) track.stop();

    const blob = await done;
    const ext = mime.includes("mp4") ? "mp4" : "webm";
    const base = file.name.replace(/\.[^.]+$/, "") || "video";
    return new File([blob], `${base}-opt.${ext}`, {
      type: mime.split(";")[0],
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
