import type { SupabaseClient } from "@supabase/supabase-js";
import { MARKETING_IMAGES } from "@/lib/marketing-assets";

const OPS_BUCKET = "mificha-ops";
const COVER_STORE = "academies/covers.json";

type CoverMap = Record<string, string>;

async function readMap(admin: SupabaseClient): Promise<CoverMap> {
  const { data, error } = await admin.storage.from(OPS_BUCKET).download(COVER_STORE);
  if (error || !data) return {};
  try {
    const parsed = JSON.parse(await data.text()) as CoverMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeMap(admin: SupabaseClient, map: CoverMap) {
  const body = JSON.stringify(map, null, 2);
  const { error } = await admin.storage.from(OPS_BUCKET).upload(COVER_STORE, body, {
    contentType: "application/json",
    upsert: true,
  });
  if (error) throw new Error(error.message || "No se pudo guardar la portada.");
}

/** Persistencia de portada aunque `academies.cover_url` aún no exista en SQL. */
export async function setAcademyCoverUrl(
  admin: SupabaseClient,
  academyId: string,
  coverUrl: string | null,
) {
  const map = await readMap(admin);
  if (coverUrl?.trim()) {
    map[academyId] = coverUrl.trim();
  } else {
    delete map[academyId];
  }
  await writeMap(admin, map);

  // Si la columna ya existe en prod, también la escribimos.
  const { error } = await admin
    .from("academies")
    .update({ cover_url: coverUrl?.trim() || null })
    .eq("id", academyId);
  if (error && !/cover_url/i.test(error.message)) {
    throw new Error(error.message);
  }

  return coverUrl?.trim() || null;
}

export async function getAcademyCoverUrl(
  admin: SupabaseClient,
  academyId: string,
  fromRow?: string | null,
) {
  if (fromRow?.trim()) return fromRow.trim();
  const map = await readMap(admin);
  return map[academyId]?.trim() || null;
}

export function defaultAcademyCoverFallback(slug: string | null | undefined) {
  if (!slug) return null;
  if (slug === "academia-gph" || slug.includes("gph")) {
    return MARKETING_IMAGES.audienceAcademias;
  }
  return MARKETING_IMAGES.featureCaptura;
}
