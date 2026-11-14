import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { listAllTutorChildrenForOps, type TutorChild } from "@/lib/tutor-family";

const OPS_BUCKET = "mificha-ops";
const ACTIVITY_PATH = "families/tutor-activity.json";

export type TutorActivityStatus = "published" | "acknowledged" | "disputed";

export interface TutorActivityEvent {
  id: string;
  kind: "academy_match_stat";
  status: TutorActivityStatus;
  dedupe_key: string;
  child_id: string;
  guardian_user_id: string;
  player_id: string;
  player_name: string;
  academy_id: string;
  academy_name: string | null;
  match_id: string;
  opponent: string;
  match_date: string | null;
  goals: number;
  assists: number;
  minutes: number;
  created_at: string;
  updated_at: string;
  dispute_note: string | null;
  disputed_at: string | null;
  acknowledged_at: string | null;
}

async function ensureOpsBucket(admin: SupabaseClient) {
  const { data } = await admin.storage.listBuckets();
  if (data?.some((bucket) => bucket.name === OPS_BUCKET)) return;
  await admin.storage.createBucket(OPS_BUCKET, { public: false });
}

async function readActivity(admin: SupabaseClient): Promise<TutorActivityEvent[]> {
  const { data, error } = await admin.storage.from(OPS_BUCKET).download(ACTIVITY_PATH);
  if (error || !data) return [];
  try {
    const parsed = JSON.parse(await data.text()) as TutorActivityEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeActivity(admin: SupabaseClient, rows: TutorActivityEvent[]) {
  await ensureOpsBucket(admin);
  const body = new Blob([JSON.stringify(rows)], { type: "application/json" });
  const { error } = await admin.storage.from(OPS_BUCKET).upload(ACTIVITY_PATH, body, {
    upsert: true,
    contentType: "application/json",
    cacheControl: "0",
  });
  if (error) throw new Error(error.message);
}

function linkedChildrenForPlayers(
  roster: TutorChild[],
  playerIds: string[],
  academyId: string,
) {
  const wanted = new Set(playerIds);
  return roster.filter(
    (child) =>
      child.linked_academy_id === academyId &&
      child.linked_player_id &&
      wanted.has(child.linked_player_id),
  );
}

export async function publishAcademyMatchActivity(
  admin: SupabaseClient,
  input: {
    academyId: string;
    academyName?: string | null;
    matchId: string;
    opponent: string;
    matchDate?: string | null;
    playerIds: string[];
  },
): Promise<TutorActivityEvent[]> {
  if (input.playerIds.length === 0) return [];

  const roster = await listAllTutorChildrenForOps(admin);
  const linked = linkedChildrenForPlayers(roster, input.playerIds, input.academyId);
  if (linked.length === 0) return [];

  const { data: statsRows } = await admin
    .from("match_stats")
    .select("player_id, goals, assists, minutes_played")
    .eq("match_id", input.matchId)
    .in(
      "player_id",
      linked.map((child) => child.linked_player_id as string),
    );

  const statsByPlayer = new Map(
    (statsRows ?? []).map((row) => [
      String(row.player_id),
      {
        goals: Number(row.goals ?? 0),
        assists: Number(row.assists ?? 0),
        minutes: Number(row.minutes_played ?? 0),
      },
    ]),
  );

  let academyName = input.academyName ?? null;
  if (!academyName) {
    const { data: academy } = await admin
      .from("academies")
      .select("name")
      .eq("id", input.academyId)
      .maybeSingle();
    academyName = academy?.name ?? null;
  }

  const now = new Date().toISOString();
  const rows = await readActivity(admin);
  const created: TutorActivityEvent[] = [];

  for (const child of linked) {
    const playerId = child.linked_player_id as string;
    const stats = statsByPlayer.get(playerId) ?? {
      goals: 0,
      assists: 0,
      minutes: 0,
    };
    const dedupeKey = `${input.matchId}:${playerId}:${child.id}`;
    const existingIndex = rows.findIndex((row) => row.dedupe_key === dedupeKey);

    if (existingIndex >= 0) {
      const prev = rows[existingIndex];
      // No pisar una disputa abierta; sí refrescar números si sigue published/ack.
      if (prev.status === "disputed") continue;
      const next: TutorActivityEvent = {
        ...prev,
        goals: stats.goals,
        assists: stats.assists,
        minutes: stats.minutes,
        opponent: input.opponent,
        match_date: input.matchDate ?? prev.match_date,
        academy_name: academyName,
        player_name: child.player_name,
        updated_at: now,
        status: "published",
        acknowledged_at: null,
      };
      rows[existingIndex] = next;
      created.push(next);
      continue;
    }

    const event: TutorActivityEvent = {
      id: randomUUID(),
      kind: "academy_match_stat",
      status: "published",
      dedupe_key: dedupeKey,
      child_id: child.id,
      guardian_user_id: child.guardian_user_id,
      player_id: playerId,
      player_name: child.player_name,
      academy_id: input.academyId,
      academy_name: academyName,
      match_id: input.matchId,
      opponent: input.opponent,
      match_date: input.matchDate ?? null,
      goals: stats.goals,
      assists: stats.assists,
      minutes: stats.minutes,
      created_at: now,
      updated_at: now,
      dispute_note: null,
      disputed_at: null,
      acknowledged_at: null,
    };
    rows.unshift(event);
    created.push(event);
  }

  if (created.length > 0) {
    // Cap de historial para no crecer sin control.
    await writeActivity(admin, rows.slice(0, 2000));
  }
  return created;
}

export async function listTutorActivityForGuardian(
  admin: SupabaseClient,
  guardianUserId: string,
  options?: { limit?: number },
) {
  const limit = options?.limit ?? 40;
  const rows = await readActivity(admin);
  return rows
    .filter((row) => row.guardian_user_id === guardianUserId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

export async function acknowledgeTutorActivity(
  admin: SupabaseClient,
  guardianUserId: string,
  eventId: string,
) {
  const rows = await readActivity(admin);
  const index = rows.findIndex(
    (row) => row.id === eventId && row.guardian_user_id === guardianUserId,
  );
  if (index < 0) throw new Error("No encontramos esa actividad.");
  const now = new Date().toISOString();
  rows[index] = {
    ...rows[index],
    status: "acknowledged",
    acknowledged_at: now,
    updated_at: now,
  };
  await writeActivity(admin, rows);
  return rows[index];
}

export async function disputeTutorActivity(
  admin: SupabaseClient,
  guardianUserId: string,
  eventId: string,
  note: string,
) {
  const cleaned = note.replace(/\s+/g, " ").trim();
  if (cleaned.length < 8) {
    throw new Error("Cuéntanos qué hay que revisar (mínimo unas palabras).");
  }
  const rows = await readActivity(admin);
  const index = rows.findIndex(
    (row) => row.id === eventId && row.guardian_user_id === guardianUserId,
  );
  if (index < 0) throw new Error("No encontramos esa actividad.");
  const now = new Date().toISOString();
  rows[index] = {
    ...rows[index],
    status: "disputed",
    dispute_note: cleaned.slice(0, 500),
    disputed_at: now,
    updated_at: now,
    acknowledged_at: null,
  };
  await writeActivity(admin, rows);
  return rows[index];
}

/** Disputas abiertas de jugadores ligados a una academia (para el staff). */
export async function listAcademyActivityDisputes(
  admin: SupabaseClient,
  academyId: string,
  options?: { limit?: number },
) {
  const limit = options?.limit ?? 40;
  const rows = await readActivity(admin);
  return rows
    .filter((row) => row.academy_id === academyId && row.status === "disputed")
    .sort((a, b) => (b.disputed_at ?? b.updated_at).localeCompare(a.disputed_at ?? a.updated_at))
    .slice(0, limit);
}

export function countUnreadTutorActivity(events: TutorActivityEvent[]) {
  return events.filter((row) => row.status === "published").length;
}
