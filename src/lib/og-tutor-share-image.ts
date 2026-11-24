import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildOgTutorSharePayload,
  type OgTutorSharePayload,
} from "@/lib/og-tutor-share";
import { listTutorMaterials, type TutorChild } from "@/lib/tutor-family";

/** Portada del tutor (signed URL cruda). Solo servidor. */
export async function resolveTutorOgCoverPhotoUrl(
  admin: SupabaseClient,
  child: TutorChild,
) {
  try {
    const materials = await listTutorMaterials(admin, child);
    const cover =
      materials.find((row) => row.kind === "photo" && row.is_cover && row.url) ||
      materials.find((row) => row.kind === "photo" && row.url);
    return cover?.url ?? null;
  } catch {
    return null;
  }
}

/**
 * next/og ignora EXIF: fotos de celular salen de lado.
 * Import dinámico de sharp: si falla en el runtime (Vercel/libvips),
 * devolvemos null y el OG usa la URL firmada o el fallback sin foto.
 */
export async function orientPhotoForOg(photoUrl: string): Promise<string | null> {
  try {
    const sharpMod = await import("sharp").catch(() => null);
    if (!sharpMod?.default) return null;
    const sharp = sharpMod.default;
    const res = await fetch(photoUrl);
    if (!res.ok) return null;
    const input = Buffer.from(await res.arrayBuffer());
    const oriented = await sharp(input)
      .rotate()
      .resize(840, 1260, { fit: "cover", position: "attention" })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();
    return `data:image/jpeg;base64,${oriented.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function buildOgTutorSharePayloadWithPhoto(
  admin: SupabaseClient,
  child: TutorChild,
): Promise<OgTutorSharePayload> {
  const base = buildOgTutorSharePayload(child);
  const rawUrl = await resolveTutorOgCoverPhotoUrl(admin, child);
  if (!rawUrl) return base;
  const photoUrl = (await orientPhotoForOg(rawUrl)) || rawUrl;
  return { ...base, photoUrl };
}
