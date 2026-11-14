import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizePublicCode } from "@/lib/public-player-code";
import {
  EMPTY_SEASON_STATS,
  type DirectoryPlayer,
  type DirectorySeasonStats,
} from "@/lib/public-directory";
import type { TutorChild, TutorMaterial } from "@/lib/tutor-family";
import type { PlayerPosition } from "@/types/database";

const OPS_BUCKET = "mificha-ops";
const ROSTER = "families/roster.json";
const MATERIALS = "families/materials.json";
const SEASONS = "families/tutor-seasons.json";

type TutorSeasonLite = {
  child_id: string;
  guardian_user_id: string;
  matches?: number;
  goals?: number;
  assists?: number;
  minutes?: number;
};

function aggregateTutorSeasonStats(rows: TutorSeasonLite[]): DirectorySeasonStats {
  return rows.reduce<DirectorySeasonStats>(
    (acc, row) => ({
      matches: acc.matches + (Number(row.matches) || 0),
      goals: acc.goals + (Number(row.goals) || 0),
      assists: acc.assists + (Number(row.assists) || 0),
      minutes: acc.minutes + (Number(row.minutes) || 0),
    }),
    { ...EMPTY_SEASON_STATS },
  );
}

function mapTutorPosition(raw: string | null | undefined): PlayerPosition {
  const value = String(raw ?? "").toLowerCase();
  if (value.includes("porter")) return "goalkeeper";
  if (value.includes("defens") || value.includes("lateral")) return "defender";
  if (value.includes("medio") || value.includes("volante")) return "midfielder";
  if (value.includes("delant") || value.includes("extrem")) return "forward";
  return "forward";
}

function splitPlayerName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: "Jugador", last_name: "" };
  if (parts.length === 1) return { first_name: parts[0], last_name: "" };
  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(" "),
  };
}

async function readOpsJson<T>(admin: SupabaseClient, path: string): Promise<T[]> {
  const { data, error } = await admin.storage
    .from(OPS_BUCKET)
    .download(path, { cacheNonce: String(Date.now()) }, { cache: "no-store" });
  if (error || !data) return [];
  try {
    const parsed = JSON.parse(await data.text()) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Fichas tutor con consentimiento (explore_opt_in) para Explorar.
 * Criterio: opt-in firmado + código MF + identidad básica.
 */
export async function fetchTutorDirectoryPlayers(
  admin: SupabaseClient,
): Promise<DirectoryPlayer[]> {
  const [roster, materials, seasons] = await Promise.all([
    readOpsJson<TutorChild>(admin, ROSTER),
    readOpsJson<TutorMaterial>(admin, MATERIALS),
    readOpsJson<TutorSeasonLite>(admin, SEASONS),
  ]);

  const candidates = roster.filter((child) => {
    if (!child.explore_opt_in) return false;
    const code = normalizePublicCode(child.public_code);
    if (!code) return false;
    if (!child.player_name?.trim()) return false;
    if (!child.profile?.birth_date || !child.profile?.position) return false;
    return true;
  });

  const out: DirectoryPlayer[] = [];

  for (const child of candidates) {
    const code = normalizePublicCode(child.public_code)!;
    const mine = materials.filter(
      (row) =>
        row.child_id === child.id && row.guardian_user_id === child.guardian_user_id,
    );
    const mySeasons = seasons.filter(
      (row) =>
        row.child_id === child.id && row.guardian_user_id === child.guardian_user_id,
    );

    const photoRows = mine.filter((item) => item.kind === "photo" && item.storage_path);
    const videoRows = mine.filter((item) => item.kind === "video" && item.storage_path);
    const storyRows = mine.filter((item) => item.kind === "story");
    const materialCount = {
      photos: photoRows.length,
      stories: storyRows.length,
      videos: videoRows.length,
    };
    const season_stats = aggregateTutorSeasonStats(mySeasons);
    const hasSeasonStats =
      season_stats.matches > 0 ||
      season_stats.minutes > 0 ||
      season_stats.goals > 0 ||
      season_stats.assists > 0;

    const coverRow =
      photoRows.find((item) => item.is_cover) ?? photoRows[0] ?? null;
    const featuredVideoRow =
      videoRows.find((item) => item.is_featured) ?? videoRows[0] ?? null;

    let photo_url: string | null = null;
    let video_url: string | null = null;
    if (coverRow?.storage_path) {
      const signed = await admin.storage
        .from(OPS_BUCKET)
        .createSignedUrl(coverRow.storage_path, 60 * 60);
      photo_url = signed.data?.signedUrl ?? null;
    }
    if (featuredVideoRow?.storage_path) {
      const signed = await admin.storage
        .from(OPS_BUCKET)
        .createSignedUrl(featuredVideoRow.storage_path, 60 * 60);
      video_url = signed.data?.signedUrl ?? null;
    }

    const { first_name, last_name } = splitPlayerName(child.player_name);
    const clubOrSchool =
      child.profile.club || child.profile.school || "Ficha del jugador";
    const city = child.profile.city;

    out.push({
      id: child.id,
      slug: `tutor-${code.toLowerCase()}`,
      first_name,
      last_name,
      birth_date: child.profile.birth_date!,
      position: mapTutorPosition(child.profile.position),
      passport_score: hasSeasonStats ? 55 : materialCount.photos > 0 ? 45 : 35,
      photo_url,
      video_url,
      has_gph_evaluation: false,
      source: "tutor",
      public_code: code,
      season_stats,
      academies: {
        name: clubOrSchool,
        city,
        state: city === "Querétaro" ? "Querétaro" : null,
        slug: "ficha-tutor",
        is_certified: false,
      },
    });
  }

  return out.sort((a, b) => b.passport_score - a.passport_score);
}
