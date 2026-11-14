import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TutorChild, TutorSeasonStat } from "@/lib/tutor-family";

const OPS_BUCKET = "mificha-ops";
const CLAIMS_PATH = "families/tutor-season-claims.json";

export type TutorSeasonClaimStatus = "pending" | "accepted" | "rejected";

export interface TutorSeasonClaim {
  id: string;
  status: TutorSeasonClaimStatus;
  season_id: string;
  child_id: string;
  guardian_user_id: string;
  child_name: string;
  player_id: string;
  academy_id: string;
  academy_name: string | null;
  tournament_name: string;
  season_label: string;
  team_name: string | null;
  matches: number;
  goals: number;
  assists: number;
  minutes: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolve_note: string | null;
}

async function ensureOpsBucket(admin: SupabaseClient) {
  const { data } = await admin.storage.listBuckets();
  if (data?.some((bucket) => bucket.name === OPS_BUCKET)) return;
  await admin.storage.createBucket(OPS_BUCKET, { public: false });
}

async function readClaims(admin: SupabaseClient): Promise<TutorSeasonClaim[]> {
  const { data, error } = await admin.storage.from(OPS_BUCKET).download(CLAIMS_PATH);
  if (error || !data) return [];
  try {
    const parsed = JSON.parse(await data.text()) as TutorSeasonClaim[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeClaims(admin: SupabaseClient, rows: TutorSeasonClaim[]) {
  await ensureOpsBucket(admin);
  const body = new Blob([JSON.stringify(rows.slice(0, 3000))], {
    type: "application/json",
  });
  const { error } = await admin.storage.from(OPS_BUCKET).upload(CLAIMS_PATH, body, {
    upsert: true,
    contentType: "application/json",
    cacheControl: "0",
  });
  if (error) throw new Error(error.message);
}

/**
 * Si el hijo está ligado a plantel, propone el torneo a la academia.
 * No escribe en match_stats (eso sigue siendo acta oficial partido a partido).
 */
export async function syncSeasonClaimForLinkedChild(
  admin: SupabaseClient,
  child: TutorChild,
  season: TutorSeasonStat,
): Promise<TutorSeasonClaim | null> {
  if (!child.linked_player_id || !child.linked_academy_id) return null;

  const hasNumbers =
    season.matches > 0 ||
    season.goals > 0 ||
    season.assists > 0 ||
    season.minutes > 0;
  if (!hasNumbers) return null;

  const rows = await readClaims(admin);
  const now = new Date().toISOString();
  const existingIndex = rows.findIndex(
    (row) =>
      row.season_id === season.id &&
      row.child_id === child.id &&
      (row.status === "pending" || row.status === "accepted"),
  );

  const base = {
    season_id: season.id,
    child_id: child.id,
    guardian_user_id: child.guardian_user_id,
    child_name: child.player_name,
    player_id: child.linked_player_id,
    academy_id: child.linked_academy_id,
    academy_name: child.linked_academy_name,
    tournament_name: season.tournament_name,
    season_label: season.season_label,
    team_name: season.team_name,
    matches: season.matches,
    goals: season.goals,
    assists: season.assists,
    minutes: season.minutes,
    notes: season.notes,
    updated_at: now,
  };

  if (existingIndex >= 0) {
    const prev = rows[existingIndex];
    // Si ya estaba aceptado y cambian números, vuelve a pending para re-revisión.
    const next: TutorSeasonClaim = {
      ...prev,
      ...base,
      status: "pending",
      resolved_at: null,
      resolve_note: null,
    };
    rows[existingIndex] = next;
    await writeClaims(admin, rows);
    return next;
  }

  const claim: TutorSeasonClaim = {
    id: randomUUID(),
    status: "pending",
    created_at: now,
    resolved_at: null,
    resolve_note: null,
    ...base,
  };
  rows.unshift(claim);
  await writeClaims(admin, rows);
  return claim;
}

export async function listSeasonClaimsForGuardian(
  admin: SupabaseClient,
  guardianUserId: string,
) {
  const rows = await readClaims(admin);
  return rows
    .filter((row) => row.guardian_user_id === guardianUserId)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function listSeasonClaimsForAcademy(
  admin: SupabaseClient,
  academyId: string,
  options?: { status?: TutorSeasonClaimStatus | "open" },
) {
  const rows = await readClaims(admin);
  return rows
    .filter((row) => {
      if (row.academy_id !== academyId) return false;
      if (options?.status === "open") return row.status === "pending";
      if (options?.status) return row.status === options.status;
      return true;
    })
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function resolveSeasonClaim(
  admin: SupabaseClient,
  input: {
    claimId: string;
    academyId: string;
    decision: "accepted" | "rejected";
    note?: string | null;
  },
) {
  const rows = await readClaims(admin);
  const index = rows.findIndex((row) => row.id === input.claimId);
  if (index < 0) throw new Error("No encontramos esa propuesta.");
  const claim = rows[index];
  if (claim.academy_id !== input.academyId) {
    throw new Error("No autorizado.");
  }
  if (claim.status !== "pending") {
    throw new Error("Esta propuesta ya fue resuelta.");
  }

  const now = new Date().toISOString();
  rows[index] = {
    ...claim,
    status: input.decision,
    resolve_note: input.note?.replace(/\s+/g, " ").trim().slice(0, 400) || null,
    resolved_at: now,
    updated_at: now,
  };
  await writeClaims(admin, rows);
  return rows[index];
}

export async function getSeasonClaimMapForChild(
  admin: SupabaseClient,
  childId: string,
): Promise<Record<string, TutorSeasonClaim>> {
  const rows = await readClaims(admin);
  const map: Record<string, TutorSeasonClaim> = {};
  for (const row of rows) {
    if (row.child_id !== childId) continue;
    const prev = map[row.season_id];
    if (!prev || row.updated_at > prev.updated_at) {
      map[row.season_id] = row;
    }
  }
  return map;
}

export function claimStatusLabel(status: TutorSeasonClaimStatus) {
  if (status === "accepted") return "Aceptado por academia";
  if (status === "rejected") return "Rechazado por academia";
  return "En revisión academia";
}
