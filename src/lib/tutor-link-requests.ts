import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  normalizePublicCode,
  readPlayerPublicCodeMap,
} from "@/lib/public-player-code";
import {
  getTutorChildForGuardian,
  listAllTutorChildrenForOps,
  type TutorChild,
} from "@/lib/tutor-family";
import {
  linkTutorChildToPlayer,
  unlinkTutorChild,
} from "@/lib/tutor-player-link";

const OPS_BUCKET = "mificha-ops";
const REQUESTS_PATH = "families/link-requests.json";

export type LinkRequestStatus =
  | "pending_academy"
  | "pending_tutor"
  | "active"
  | "rejected"
  | "cancelled";

export type LinkRequestInitiator = "tutor" | "academy";

export interface TutorLinkRequest {
  id: string;
  status: LinkRequestStatus;
  initiated_by: LinkRequestInitiator;
  child_id: string;
  guardian_user_id: string;
  child_name: string;
  child_public_code: string;
  player_id: string;
  player_name: string;
  player_slug: string;
  academy_id: string;
  academy_name: string;
  match_kind: "code" | "birth" | "contact" | "manual";
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolved_by: LinkRequestInitiator | null;
}

async function ensureOpsBucket(admin: SupabaseClient) {
  const { data } = await admin.storage.listBuckets();
  if (data?.some((bucket) => bucket.name === OPS_BUCKET)) return;
  await admin.storage.createBucket(OPS_BUCKET, { public: false });
}

async function readRequests(admin: SupabaseClient): Promise<TutorLinkRequest[]> {
  const { data, error } = await admin.storage.from(OPS_BUCKET).download(REQUESTS_PATH);
  if (error || !data) return [];
  try {
    const parsed = JSON.parse(await data.text()) as TutorLinkRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeRequests(admin: SupabaseClient, rows: TutorLinkRequest[]) {
  await ensureOpsBucket(admin);
  const body = new Blob([JSON.stringify(rows.slice(0, 2000))], {
    type: "application/json",
  });
  const { error } = await admin.storage.from(OPS_BUCKET).upload(REQUESTS_PATH, body, {
    upsert: true,
    contentType: "application/json",
    cacheControl: "0",
  });
  if (error) throw new Error(error.message);
}

async function loadPlayerMeta(admin: SupabaseClient, playerId: string) {
  const { data: player, error } = await admin
    .from("players")
    .select("id, academy_id, first_name, last_name, slug, academies(name)")
    .eq("id", playerId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!player) throw new Error("Jugador de academia no encontrado.");

  const academyRel = player.academies as { name?: string } | { name?: string }[] | null;
  const academyName = Array.isArray(academyRel)
    ? academyRel[0]?.name
    : academyRel?.name;

  return {
    playerId: String(player.id),
    academyId: String(player.academy_id),
    academyName: academyName || "Academia",
    playerName: `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim(),
    playerSlug: String(player.slug ?? ""),
  };
}

async function samePublicCode(
  admin: SupabaseClient,
  child: TutorChild,
  playerId: string,
) {
  const childCode = normalizePublicCode(child.public_code);
  if (!childCode) return false;
  const map = await readPlayerPublicCodeMap(admin);
  const playerCode = normalizePublicCode(map[playerId] ?? null);
  return Boolean(playerCode && playerCode === childCode);
}

function openConflict(
  rows: TutorLinkRequest[],
  childId: string,
  playerId: string,
) {
  return rows.find(
    (row) =>
      (row.status === "pending_academy" || row.status === "pending_tutor") &&
      (row.child_id === childId || row.player_id === playerId),
  );
}

async function activateLink(
  admin: SupabaseClient,
  guardianUserId: string,
  childId: string,
  playerId: string,
) {
  return linkTutorChildToPlayer(admin, guardianUserId, childId, playerId);
}

/**
 * Tutor pide vincular (o se activa al instante si ya comparten MF-).
 */
export async function requestLinkFromTutor(
  admin: SupabaseClient,
  guardianUserId: string,
  childId: string,
  playerId: string,
  matchKind: TutorLinkRequest["match_kind"] = "manual",
) {
  const child = await getTutorChildForGuardian(admin, guardianUserId, childId);
  if (!child) throw new Error("No encontramos a ese jugador en tu cuenta de tutor.");
  if (child.linked_player_id) {
    throw new Error("Este jugador ya está vinculado a una academia.");
  }

  const meta = await loadPlayerMeta(admin, playerId);
  const rows = await readRequests(admin);
  const conflict = openConflict(rows, childId, playerId);
  if (conflict) {
    throw new Error("Ya hay una solicitud de vínculo pendiente para este jugador.");
  }

  // Misma identidad MF-: activar sin segunda confirmación.
  if (matchKind === "code" || (await samePublicCode(admin, child, playerId))) {
    const linked = await activateLink(admin, guardianUserId, childId, playerId);
    const now = new Date().toISOString();
    const active: TutorLinkRequest = {
      id: randomUUID(),
      status: "active",
      initiated_by: "tutor",
      child_id: childId,
      guardian_user_id: guardianUserId,
      child_name: child.player_name,
      child_public_code: child.public_code,
      player_id: meta.playerId,
      player_name: meta.playerName,
      player_slug: meta.playerSlug,
      academy_id: meta.academyId,
      academy_name: meta.academyName,
      match_kind: "code",
      created_at: now,
      updated_at: now,
      resolved_at: now,
      resolved_by: "tutor",
    };
    rows.unshift(active);
    await writeRequests(admin, rows);
    return { mode: "active" as const, child: linked, request: active };
  }

  const now = new Date().toISOString();
  const request: TutorLinkRequest = {
    id: randomUUID(),
    status: "pending_academy",
    initiated_by: "tutor",
    child_id: childId,
    guardian_user_id: guardianUserId,
    child_name: child.player_name,
    child_public_code: child.public_code,
    player_id: meta.playerId,
    player_name: meta.playerName,
    player_slug: meta.playerSlug,
    academy_id: meta.academyId,
    academy_name: meta.academyName,
    match_kind: matchKind,
    created_at: now,
    updated_at: now,
    resolved_at: null,
    resolved_by: null,
  };
  rows.unshift(request);
  await writeRequests(admin, rows);
  return { mode: "pending" as const, child, request };
}

/**
 * Academia pide vincular (pendiente de aceptación del tutor, salvo MF- igual).
 */
export async function requestLinkFromAcademy(
  admin: SupabaseClient,
  academyId: string,
  playerId: string,
  childId: string,
  matchKind: TutorLinkRequest["match_kind"] = "manual",
) {
  const meta = await loadPlayerMeta(admin, playerId);
  if (meta.academyId !== academyId) {
    throw new Error("Ese jugador no pertenece a tu academia.");
  }

  const roster = await listAllTutorChildrenForOps(admin);
  const child = roster.find((row) => row.id === childId);
  if (!child) throw new Error("No encontramos la ficha tutor.");
  if (child.linked_player_id && child.linked_player_id !== playerId) {
    throw new Error("Esa ficha tutor ya está vinculada a otro jugador.");
  }
  if (child.linked_player_id === playerId) {
    return { mode: "active" as const, child, request: null };
  }

  const rows = await readRequests(admin);
  const conflict = openConflict(rows, childId, playerId);
  if (conflict) {
    throw new Error("Ya hay una solicitud de vínculo pendiente para este jugador.");
  }

  if (matchKind === "code" || (await samePublicCode(admin, child, playerId))) {
    const linked = await activateLink(
      admin,
      child.guardian_user_id,
      childId,
      playerId,
    );
    const now = new Date().toISOString();
    const active: TutorLinkRequest = {
      id: randomUUID(),
      status: "active",
      initiated_by: "academy",
      child_id: childId,
      guardian_user_id: child.guardian_user_id,
      child_name: child.player_name,
      child_public_code: child.public_code,
      player_id: meta.playerId,
      player_name: meta.playerName,
      player_slug: meta.playerSlug,
      academy_id: meta.academyId,
      academy_name: meta.academyName,
      match_kind: "code",
      created_at: now,
      updated_at: now,
      resolved_at: now,
      resolved_by: "academy",
    };
    rows.unshift(active);
    await writeRequests(admin, rows);
    return { mode: "active" as const, child: linked, request: active };
  }

  const now = new Date().toISOString();
  const request: TutorLinkRequest = {
    id: randomUUID(),
    status: "pending_tutor",
    initiated_by: "academy",
    child_id: childId,
    guardian_user_id: child.guardian_user_id,
    child_name: child.player_name,
    child_public_code: child.public_code,
    player_id: meta.playerId,
    player_name: meta.playerName,
    player_slug: meta.playerSlug,
    academy_id: meta.academyId,
    academy_name: meta.academyName,
    match_kind: matchKind,
    created_at: now,
    updated_at: now,
    resolved_at: null,
    resolved_by: null,
  };
  rows.unshift(request);
  await writeRequests(admin, rows);
  return { mode: "pending" as const, child, request };
}

export async function acceptLinkRequest(
  admin: SupabaseClient,
  input: {
    requestId: string;
    actor: LinkRequestInitiator;
    guardianUserId?: string;
    academyId?: string;
  },
) {
  const rows = await readRequests(admin);
  const index = rows.findIndex((row) => row.id === input.requestId);
  if (index < 0) throw new Error("No encontramos esa solicitud.");
  const req = rows[index];

  if (input.actor === "tutor") {
    if (req.status !== "pending_tutor") {
      throw new Error("Esta solicitud no está esperando al tutor.");
    }
    if (req.guardian_user_id !== input.guardianUserId) {
      throw new Error("No autorizado.");
    }
  } else {
    if (req.status !== "pending_academy") {
      throw new Error("Esta solicitud no está esperando a la academia.");
    }
    if (req.academy_id !== input.academyId) {
      throw new Error("No autorizado.");
    }
  }

  const linked = await activateLink(
    admin,
    req.guardian_user_id,
    req.child_id,
    req.player_id,
  );
  const now = new Date().toISOString();
  rows[index] = {
    ...req,
    status: "active",
    updated_at: now,
    resolved_at: now,
    resolved_by: input.actor,
  };
  await writeRequests(admin, rows);
  return { child: linked, request: rows[index] };
}

export async function rejectLinkRequest(
  admin: SupabaseClient,
  input: {
    requestId: string;
    actor: LinkRequestInitiator;
    guardianUserId?: string;
    academyId?: string;
  },
) {
  const rows = await readRequests(admin);
  const index = rows.findIndex((row) => row.id === input.requestId);
  if (index < 0) throw new Error("No encontramos esa solicitud.");
  const req = rows[index];

  if (input.actor === "tutor") {
    if (
      req.status !== "pending_tutor" &&
      !(req.status === "pending_academy" && req.guardian_user_id === input.guardianUserId)
    ) {
      throw new Error("No puedes rechazar esta solicitud.");
    }
    if (req.guardian_user_id !== input.guardianUserId) {
      throw new Error("No autorizado.");
    }
  } else {
    if (
      req.status !== "pending_academy" &&
      !(req.status === "pending_tutor" && req.academy_id === input.academyId)
    ) {
      throw new Error("No puedes rechazar esta solicitud.");
    }
    if (req.academy_id !== input.academyId) {
      throw new Error("No autorizado.");
    }
  }

  const now = new Date().toISOString();
  rows[index] = {
    ...req,
    status: "rejected",
    updated_at: now,
    resolved_at: now,
    resolved_by: input.actor,
  };
  await writeRequests(admin, rows);
  return rows[index];
}

export async function listPendingLinkRequestsForTutor(
  admin: SupabaseClient,
  guardianUserId: string,
) {
  const rows = await readRequests(admin);
  return rows
    .filter(
      (row) =>
        row.guardian_user_id === guardianUserId &&
        (row.status === "pending_tutor" || row.status === "pending_academy"),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function listPendingLinkRequestsForAcademy(
  admin: SupabaseClient,
  academyId: string,
) {
  const rows = await readRequests(admin);
  return rows
    .filter(
      (row) =>
        row.academy_id === academyId &&
        (row.status === "pending_academy" || row.status === "pending_tutor"),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function cancelActiveLinkAsTutor(
  admin: SupabaseClient,
  guardianUserId: string,
  childId: string,
) {
  const child = await unlinkTutorChild(admin, guardianUserId, childId);
  const rows = await readRequests(admin);
  const now = new Date().toISOString();
  let changed = false;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (
      row.child_id === childId &&
      (row.status === "active" ||
        row.status === "pending_academy" ||
        row.status === "pending_tutor")
    ) {
      rows[i] = {
        ...row,
        status: row.status === "active" ? "cancelled" : "cancelled",
        updated_at: now,
        resolved_at: now,
        resolved_by: "tutor",
      };
      changed = true;
    }
  }
  if (changed) await writeRequests(admin, rows);
  return child;
}
