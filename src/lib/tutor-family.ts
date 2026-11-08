import { randomBytes, randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { listFamilyOrders, type FamilyOrderRow } from "@/lib/family-orders";
import { mintPublicCode, normalizePublicCode } from "@/lib/public-player-code";

const OPS_BUCKET = "mificha-ops";
const ROSTER = "families/roster.json";
const MATERIALS = "families/materials.json";

/** Piloto gratuito: sin cobro de $1,200. Apagar cuando se active la membresía. */
export const TUTOR_PILOT_FREE = true;
export const TUTOR_PILOT_LABEL = "Ficha sin costo hoy · lo único que se paga es el diagnóstico GPH";

export type TutorMaterialKind = "photo" | "video" | "story";

export interface TutorChildProfile {
  birth_date: string | null;
  position: string | null;
  club: string | null;
  school: string | null;
  city: string | null;
  height_cm: number | null;
  dominant_foot: "left" | "right" | "both" | null;
  bio: string | null;
  goals: string | null;
}

export interface TutorChild {
  id: string;
  guardian_user_id: string;
  guardian_email: string;
  guardian_phone: string | null;
  player_name: string;
  membership_until: string | null;
  source_folios: string[];
  share_token: string;
  /** Código corto visible (ej. MF-A3K9), mismo en tutor y academia. */
  public_code: string;
  profile: TutorChildProfile;
  created_at: string;
  /** Vínculo opcional con jugador de plantel (misma persona). */
  linked_player_id: string | null;
  linked_academy_id: string | null;
  linked_academy_name: string | null;
  linked_player_slug: string | null;
  linked_at: string | null;
}

export interface TutorMaterial {
  id: string;
  child_id: string;
  guardian_user_id: string;
  kind: TutorMaterialKind;
  title: string;
  body: string | null;
  storage_path: string | null;
  created_at: string;
}

export type TutorChildInput = {
  player_name: string;
  guardian_phone?: string | null;
  birth_date?: string | null;
  position?: string | null;
  club?: string | null;
  school?: string | null;
  city?: string | null;
  height_cm?: number | null;
  dominant_foot?: "left" | "right" | "both" | null;
  bio?: string | null;
  goals?: string | null;
};

function phoneKey(value: string | null | undefined) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return "";
}

function nameKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function emptyProfile(): TutorChildProfile {
  return {
    birth_date: null,
    position: null,
    club: null,
    school: null,
    city: null,
    height_cm: null,
    dominant_foot: null,
    bio: null,
    goals: null,
  };
}

function newShareToken() {
  return randomBytes(12).toString("hex");
}

function normalizeChild(raw: TutorChild): TutorChild {
  return {
    ...raw,
    share_token: raw.share_token || newShareToken(),
    public_code: normalizePublicCode(raw.public_code) ?? "",
    profile: {
      ...emptyProfile(),
      ...(raw.profile ?? {}),
    },
    linked_player_id: raw.linked_player_id ?? null,
    linked_academy_id: raw.linked_academy_id ?? null,
    linked_academy_name: raw.linked_academy_name ?? null,
    linked_player_slug: raw.linked_player_slug ?? null,
    linked_at: raw.linked_at ?? null,
  };
}

function assignMissingPublicCodes(roster: TutorChild[]): {
  roster: TutorChild[];
  changed: boolean;
} {
  const used = new Set(
    roster
      .map((child) => normalizePublicCode(child.public_code))
      .filter((code): code is string => Boolean(code)),
  );
  let changed = false;
  const next = roster.map((child) => {
    if (normalizePublicCode(child.public_code)) return child;
    changed = true;
    return { ...child, public_code: mintPublicCode(used) };
  });
  return { roster: next, changed };
}

async function loadRoster(admin: SupabaseClient): Promise<{
  roster: TutorChild[];
  changed: boolean;
}> {
  const base = (await readJson<TutorChild>(admin, ROSTER)).map(normalizeChild);
  return assignMissingPublicCodes(base);
}

export function membershipIsActive(until: string | null | undefined) {
  if (TUTOR_PILOT_FREE) return true;
  if (!until) return false;
  return until.slice(0, 10) >= todayIso();
}

export function tutorSharePath(token: string) {
  return `/fut/f/${token}`;
}

/** Posiciones más usadas en ficha de tutor (texto libre almacenado). */
export const TUTOR_POSITION_OPTIONS = [
  "Portero",
  "Defensa central",
  "Lateral derecho",
  "Lateral izquierdo",
  "Mediocampista defensivo",
  "Mediocampista",
  "Mediocampista ofensivo",
  "Extremo derecho",
  "Extremo izquierdo",
  "Delantero",
] as const;

/** Ciudades frecuentes para el piloto GPH / Bajío (+ principales). */
export const TUTOR_CITY_OPTIONS = [
  "Querétaro",
  "Corregidora",
  "El Marqués",
  "San Juan del Río",
  "Tequisquiapan",
  "Celaya",
  "Irapuato",
  "León",
  "San Luis Potosí",
  "Guanajuato",
  "Morelia",
  "Ciudad de México",
  "Guadalajara",
  "Monterrey",
  "Puebla",
  "Toluca",
  "Otra",
] as const;

async function ensureOpsBucket(admin: SupabaseClient) {
  const { data } = await admin.storage.listBuckets();
  if (data?.some((bucket) => bucket.name === OPS_BUCKET)) return;
  await admin.storage.createBucket(OPS_BUCKET, { public: false });
}

async function readJson<T>(admin: SupabaseClient, path: string): Promise<T[]> {
  const { data, error } = await admin.storage.from(OPS_BUCKET).download(path);
  if (error || !data) return [];
  try {
    const parsed = JSON.parse(await data.text()) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJson(admin: SupabaseClient, path: string, rows: unknown[]) {
  await ensureOpsBucket(admin);
  const body = new Blob([JSON.stringify(rows)], { type: "application/json" });
  const { error } = await admin.storage
    .from(OPS_BUCKET)
    .upload(path, body, { upsert: true, contentType: "application/json" });
  if (error) throw new Error(error.message);
}

function orderMatchesGuardian(order: FamilyOrderRow, email: string, phone: string) {
  if (order.status !== "paid") return false;
  if (!TUTOR_PILOT_FREE && !membershipIsActive(order.membership_until)) return false;
  const orderEmail = (order.payer_email ?? "").trim().toLowerCase();
  const orderPhone = phoneKey(order.payer_phone);
  if (email && orderEmail && orderEmail === email) return true;
  if (phone && orderPhone && orderPhone === phone) return true;
  return false;
}

function assertCanUpload(child: TutorChild) {
  if (membershipIsActive(child.membership_until)) return;
  throw new Error("La membresía no está vigente. Paga el año para subir material.");
}

export async function syncTutorChildren(
  admin: SupabaseClient,
  user: { id: string; email?: string | null },
  phoneRaw: string | null,
) {
  const email = (user.email ?? "").trim().toLowerCase();
  const phone = phoneKey(phoneRaw);
  const orders = await listFamilyOrders(admin);
  const matched = orders.filter((order) => orderMatchesGuardian(order, email, phone));
  const loaded = await loadRoster(admin);
  let roster = loaded.roster;
  let changed = loaded.changed;
  const usedCodes = new Set(
    roster
      .map((child) => normalizePublicCode(child.public_code))
      .filter((code): code is string => Boolean(code)),
  );

  for (const order of matched) {
    const playerName = (order.player_name ?? "").trim() || "Jugador";
    const key = nameKey(playerName);
    const existing = roster.find(
      (child) =>
        child.guardian_user_id === user.id && nameKey(child.player_name) === key,
    );
    if (existing) {
      if (!existing.source_folios.includes(order.folio)) {
        existing.source_folios.push(order.folio);
        changed = true;
      }
      if (
        order.membership_until &&
        (!existing.membership_until || order.membership_until > existing.membership_until)
      ) {
        existing.membership_until = order.membership_until;
        changed = true;
      }
      if (email && existing.guardian_email !== email) {
        existing.guardian_email = email;
        changed = true;
      }
      if (phone && existing.guardian_phone !== phone) {
        existing.guardian_phone = phone;
        changed = true;
      }
      continue;
    }
    roster.unshift({
      id: randomUUID(),
      guardian_user_id: user.id,
      guardian_email: email,
      guardian_phone: phone || null,
      player_name: playerName,
      membership_until: order.membership_until,
      source_folios: [order.folio],
      share_token: newShareToken(),
      public_code: mintPublicCode(usedCodes),
      profile: emptyProfile(),
      created_at: new Date().toISOString(),
      linked_player_id: null,
      linked_academy_id: null,
      linked_academy_name: null,
      linked_player_slug: null,
      linked_at: null,
    });
    changed = true;
  }

  // Persist share_token / profile / public_code backfill for older rows.
  roster = roster.map((child) => {
    if (child.guardian_user_id !== user.id) return child;
    if (!child.share_token || !child.profile || !child.public_code) {
      changed = true;
      return normalizeChild(child);
    }
    return child;
  });
  const assigned = assignMissingPublicCodes(roster);
  roster = assigned.roster;
  if (assigned.changed) changed = true;

  if (changed) await writeJson(admin, ROSTER, roster);
  return roster
    .filter((child) => child.guardian_user_id === user.id)
    .sort((a, b) => a.player_name.localeCompare(b.player_name, "es"));
}

export async function createTutorChild(
  admin: SupabaseClient,
  user: { id: string; email?: string | null },
  input: TutorChildInput,
) {
  const playerName = input.player_name.trim();
  if (playerName.length < 2) throw new Error("Escribe el nombre completo del jugador.");

  const email = (user.email ?? "").trim().toLowerCase();
  const phone = phoneKey(input.guardian_phone);
  const loaded = await loadRoster(admin);
  const roster = loaded.roster;
  const duplicate = roster.find(
    (child) =>
      child.guardian_user_id === user.id && nameKey(child.player_name) === nameKey(playerName),
  );
  if (duplicate) throw new Error("Ese jugador ya está en tu cuenta.");

  const usedCodes = new Set(
    roster
      .map((child) => normalizePublicCode(child.public_code))
      .filter((code): code is string => Boolean(code)),
  );

  const child: TutorChild = {
    id: randomUUID(),
    guardian_user_id: user.id,
    guardian_email: email,
    guardian_phone: phone || null,
    player_name: playerName,
    membership_until: TUTOR_PILOT_FREE ? "2099-12-31" : null,
    source_folios: [],
    share_token: newShareToken(),
    public_code: mintPublicCode(usedCodes),
    profile: {
      birth_date: input.birth_date?.trim() || null,
      position: input.position?.trim() || null,
      club: input.club?.trim() || null,
      school: input.school?.trim() || null,
      city: input.city?.trim() || null,
      height_cm: input.height_cm ?? null,
      dominant_foot: input.dominant_foot ?? null,
      bio: input.bio?.trim() || null,
      goals: input.goals?.trim() || null,
    },
    created_at: new Date().toISOString(),
    linked_player_id: null,
    linked_academy_id: null,
    linked_academy_name: null,
    linked_player_slug: null,
    linked_at: null,
  };
  roster.unshift(child);
  await writeJson(admin, ROSTER, roster);
  return child;
}

export async function updateTutorChild(
  admin: SupabaseClient,
  userId: string,
  childId: string,
  input: TutorChildInput,
) {
  const loaded = await loadRoster(admin);
  const roster = loaded.roster;
  const index = roster.findIndex(
    (child) => child.id === childId && child.guardian_user_id === userId,
  );
  if (index < 0) throw new Error("No encontramos a ese jugador.");

  const current = roster[index];
  const playerName = input.player_name.trim() || current.player_name;
  roster[index] = {
    ...current,
    player_name: playerName,
    guardian_phone: phoneKey(input.guardian_phone) || current.guardian_phone,
    profile: {
      birth_date: input.birth_date?.trim() || null,
      position: input.position?.trim() || null,
      club: input.club?.trim() || null,
      school: input.school?.trim() || null,
      city: input.city?.trim() || null,
      height_cm: input.height_cm ?? null,
      dominant_foot: input.dominant_foot ?? null,
      bio: input.bio?.trim() || null,
      goals: input.goals?.trim() || null,
    },
  };
  await writeJson(admin, ROSTER, roster);
  return roster[index];
}

export async function listTutorMaterials(admin: SupabaseClient, child: TutorChild) {
  const rows = await readJson<TutorMaterial>(admin, MATERIALS);
  const mine = rows
    .filter(
      (row) => row.child_id === child.id && row.guardian_user_id === child.guardian_user_id,
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const withUrls = await Promise.all(
    mine.map(async (row) => {
      if (!row.storage_path) return { ...row, url: null as string | null };
      const signed = await admin.storage
        .from(OPS_BUCKET)
        .createSignedUrl(row.storage_path, 60 * 60);
      return { ...row, url: signed.data?.signedUrl ?? null };
    }),
  );
  return withUrls;
}

export async function getTutorChild(
  admin: SupabaseClient,
  userId: string,
  childId: string,
) {
  const { roster, changed } = await loadRoster(admin);
  if (changed) await writeJson(admin, ROSTER, roster);
  return (
    roster.find((child) => child.id === childId && child.guardian_user_id === userId) ??
    null
  );
}

export const getTutorChildForGuardian = getTutorChild;

export async function updateTutorChildLink(
  admin: SupabaseClient,
  userId: string,
  childId: string,
  link: {
    linked_player_id: string | null;
    linked_academy_id: string | null;
    linked_academy_name: string | null;
    linked_player_slug: string | null;
    linked_at: string | null;
  },
) {
  const { roster } = await loadRoster(admin);
  const index = roster.findIndex(
    (child) => child.id === childId && child.guardian_user_id === userId,
  );
  if (index < 0) throw new Error("No encontramos a ese jugador.");
  roster[index] = { ...roster[index], ...link };
  await writeJson(admin, ROSTER, roster);
  return roster[index];
}

/** Fija el código público del hijo tutor (p. ej. al unificar con academia). */
export async function setTutorChildPublicCode(
  admin: SupabaseClient,
  userId: string,
  childId: string,
  publicCode: string,
) {
  const code = normalizePublicCode(publicCode);
  if (!code) throw new Error("Código de jugador inválido.");
  const { roster, changed } = await loadRoster(admin);
  const index = roster.findIndex(
    (child) => child.id === childId && child.guardian_user_id === userId,
  );
  if (index < 0) throw new Error("No encontramos a ese jugador.");
  const taken = roster.find(
    (child, i) => i !== index && normalizePublicCode(child.public_code) === code,
  );
  if (taken) throw new Error("Ese código ya está en uso.");
  roster[index] = { ...roster[index], public_code: code };
  await writeJson(admin, ROSTER, roster);
  return roster[index];
}

/** Mapa player_id → ficha tutor ligada, para una academia. */
export async function listTutorLinksByAcademy(admin: SupabaseClient, academyId: string) {
  const { roster, changed } = await loadRoster(admin);
  if (changed) await writeJson(admin, ROSTER, roster);
  return roster
    .filter(
      (child) =>
        child.linked_academy_id === academyId && Boolean(child.linked_player_id),
    )
    .map((child) => ({
      player_id: child.linked_player_id as string,
      tutor_child_id: child.id,
      player_name: child.player_name,
      share_token: child.share_token,
      public_code: child.public_code,
      guardian_email: child.guardian_email,
    }));
}

export async function listTutorPublicCodes(admin: SupabaseClient): Promise<string[]> {
  const { roster, changed } = await loadRoster(admin);
  if (changed) await writeJson(admin, ROSTER, roster);
  return roster
    .map((child) => normalizePublicCode(child.public_code))
    .filter((code): code is string => Boolean(code));
}

export async function getTutorChildByShareToken(admin: SupabaseClient, token: string) {
  const raw = token.trim();
  if (!raw) return null;
  const { roster, changed } = await loadRoster(admin);
  if (changed) await writeJson(admin, ROSTER, roster);
  const asCode = normalizePublicCode(raw);
  if (asCode) {
    const byCode = roster.find(
      (child) => normalizePublicCode(child.public_code) === asCode,
    );
    if (byCode) return byCode;
  }
  const clean = raw.toLowerCase();
  return roster.find((child) => child.share_token === clean) ?? null;
}

export async function addTutorStory(
  admin: SupabaseClient,
  child: TutorChild,
  title: string,
  body: string,
) {
  assertCanUpload(child);
  const rows = await readJson<TutorMaterial>(admin, MATERIALS);
  const row: TutorMaterial = {
    id: randomUUID(),
    child_id: child.id,
    guardian_user_id: child.guardian_user_id,
    kind: "story",
    title: title.trim() || "Nota",
    body: body.trim(),
    storage_path: null,
    created_at: new Date().toISOString(),
  };
  rows.unshift(row);
  await writeJson(admin, MATERIALS, rows);
  return row;
}

export async function prepareTutorUpload(
  admin: SupabaseClient,
  child: TutorChild,
  kind: "photo" | "video",
  fileName: string,
) {
  assertCanUpload(child);
  await ensureOpsBucket(admin);
  const safe = fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "archivo";
  const storagePath = `families/${child.id}/${randomUUID()}-${safe}`;
  const signed = await admin.storage.from(OPS_BUCKET).createSignedUploadUrl(storagePath);
  if (signed.error || !signed.data) {
    throw new Error(signed.error?.message || "No se pudo preparar la carga.");
  }
  return {
    path: storagePath,
    token: signed.data.token,
  };
}

export async function commitTutorUpload(
  admin: SupabaseClient,
  child: TutorChild,
  input: { kind: "photo" | "video"; title: string; path: string },
) {
  assertCanUpload(child);
  if (!input.path.startsWith(`families/${child.id}/`)) {
    throw new Error("Archivo inválido.");
  }
  const rows = await readJson<TutorMaterial>(admin, MATERIALS);
  const row: TutorMaterial = {
    id: randomUUID(),
    child_id: child.id,
    guardian_user_id: child.guardian_user_id,
    kind: input.kind,
    title: input.title.trim() || (input.kind === "photo" ? "Foto" : "Video"),
    body: null,
    storage_path: input.path,
    created_at: new Date().toISOString(),
  };
  rows.unshift(row);
  await writeJson(admin, MATERIALS, rows);
  return row;
}
