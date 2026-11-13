import type { TutorChild, TutorMaterial, TutorSeasonStat } from "@/lib/tutor-family";
import { tutorSharePath } from "@/lib/tutor-family";

export function agentMaterialsPath(token: string) {
  return `/fut/agente/m/${encodeURIComponent(token)}`;
}

export function agentMaterialsAccess(child: Pick<TutorChild, "public_code" | "share_token">) {
  return child.public_code || child.share_token;
}

export type AgentMaterialDoc = "onepager" | "ficha" | "deck";

export function galleryPhotoUrls(
  materials: Array<TutorMaterial & { url?: string | null }>,
  limit = 2,
) {
  return materials
    .filter((item) => item.kind === "photo" && item.url)
    .sort((a, b) => Number(Boolean(b.is_cover)) - Number(Boolean(a.is_cover)))
    .map((item) => item.url as string)
    .slice(0, limit);
}

const FOOT_LABEL = {
  left: "Zurdo",
  right: "Diestro",
  both: "Ambidiestro",
} as const;

export function ageFromBirthDate(iso: string | null) {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const birth = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 80 ? age : null;
}

export function footLabel(value: TutorChild["profile"]["dominant_foot"]) {
  return value ? FOOT_LABEL[value] : null;
}

export function coverPhotoUrl(
  materials: Array<TutorMaterial & { url?: string | null }>,
) {
  const photos = materials.filter((item) => item.kind === "photo" && item.url);
  return photos.find((item) => item.is_cover)?.url ?? photos[0]?.url ?? null;
}

export function featuredVideoUrl(
  materials: Array<TutorMaterial & { url?: string | null }>,
) {
  const videos = materials.filter((item) => item.kind === "video" && item.url);
  return videos.find((item) => item.is_featured)?.url ?? videos[0]?.url ?? null;
}

export function videoLinks(
  materials: Array<TutorMaterial & { url?: string | null }>,
) {
  return materials
    .filter((item) => item.kind === "video" && item.url)
    .map((item) => ({
      title: item.title?.trim() || "Video",
      url: item.url as string,
    }));
}

export function digitalFichaPath(child: Pick<TutorChild, "public_code" | "share_token">) {
  return tutorSharePath(agentMaterialsAccess(child));
}

export function seasonSummaryLines(seasons: TutorSeasonStat[], limit = 3) {
  return seasons.slice(0, limit).map((season) => {
    const bits = [
      season.tournament_name,
      season.season_label,
      season.team_name,
    ].filter(Boolean);
    const stats = [
      season.matches != null ? `${season.matches} PJ` : null,
      season.goals != null ? `${season.goals} G` : null,
      season.assists != null ? `${season.assists} A` : null,
      season.minutes != null ? `${season.minutes}'` : null,
    ].filter(Boolean);
    return {
      id: season.id,
      headline: bits.join(" · ") || "Temporada",
      stats: stats.join(" · ") || "—",
      notes: season.notes?.trim() || null,
    };
  });
}

/** Formato tipo currículum de agente: 1,70 m. */
export function formatHeightMeters(heightCm: number | null | undefined) {
  if (heightCm == null || !Number.isFinite(heightCm) || heightCm <= 0) return null;
  const meters = heightCm / 100;
  return `${meters.toFixed(2).replace(".", ",")} m`;
}

export function formatBirthDisplay(iso: string | null | undefined) {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

/** Línea de trayectoria (club + etapa), estilo one-pager de agente. */
export function careerTimelineLines(seasons: TutorSeasonStat[], limit = 6) {
  return seasons.slice(0, limit).map((season) => {
    const club = season.team_name?.trim() || season.tournament_name.trim() || "Club";
    const stageBits = [
      season.tournament_name !== club ? season.tournament_name : null,
      season.season_label || null,
    ].filter(Boolean);
    const stats = [
      season.matches ? `${season.matches} PJ` : null,
      season.goals ? `${season.goals} G` : null,
      season.assists ? `${season.assists} A` : null,
    ].filter(Boolean);
    return {
      id: season.id,
      club,
      stage: stageBits.join(" · ") || season.notes?.trim() || "Temporada",
      stats: stats.join(" · ") || null,
    };
  });
}

export function resolveHighlightsUrl(
  profileYoutube: string | null | undefined,
  materials: Array<TutorMaterial & { url?: string | null }>,
) {
  if (profileYoutube?.trim()) return profileYoutube.trim();
  const featured = featuredVideoUrl(materials);
  if (featured && /youtu\.?be|youtube\.com/i.test(featured)) return featured;
  return featured;
}
