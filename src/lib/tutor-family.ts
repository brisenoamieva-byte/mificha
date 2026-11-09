import { randomBytes, randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { listFamilyOrders, type FamilyOrderRow } from "@/lib/family-orders";
import {
  collectUsedPublicCodes,
  ensureTutorPublicCodes,
  mintPublicCode,
  normalizePublicCode,
} from "@/lib/public-player-code";

const OPS_BUCKET = "mificha-ops";
const ROSTER = "families/roster.json";
const MATERIALS = "families/materials.json";
const SEASONS = "families/tutor-seasons.json";

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
  /**
   * Opt-in explícito: si es true, la ficha puede listarse en /fut/explorar.
   * El link /fut/f/… sigue funcionando aunque esté en false.
   */
  explore_opt_in: boolean;
  explore_opt_in_at: string | null;
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
  /** Foto principal del hero. */
  is_cover?: boolean;
  /** Video que aparece primero en la ficha. */
  is_featured?: boolean;
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
    explore_opt_in: Boolean(raw.explore_opt_in),
    explore_opt_in_at: raw.explore_opt_in_at ?? null,
  };
}

async function assignMissingPublicCodes(
  admin: SupabaseClient,
  roster: TutorChild[],
): Promise<{
  roster: TutorChild[];
  changed: boolean;
}> {
  const missing = roster.filter((child) => !normalizePublicCode(child.public_code));
  if (missing.length === 0) return { roster, changed: false };

  const preferred: Record<string, string | null | undefined> = {};
  for (const child of roster) {
    preferred[child.id] = child.public_code;
  }
  const assigned = await ensureTutorPublicCodes(
    admin,
    roster.map((child) => child.id),
    preferred,
  );
  let changed = false;
  const next = roster.map((child) => {
    const code = assigned[child.id];
    if (!code || normalizePublicCode(child.public_code) === code) return child;
    changed = true;
    return { ...child, public_code: code };
  });
  return { roster: next, changed };
}

async function loadRoster(admin: SupabaseClient): Promise<{
  roster: TutorChild[];
  changed: boolean;
}> {
  const base = (await readJson<TutorChild>(admin, ROSTER)).map(normalizeChild);
  return assignMissingPublicCodes(admin, base);
}

export function membershipIsActive(until: string | null | undefined) {
  if (TUTOR_PILOT_FREE) return true;
  if (!until) return false;
  return until.slice(0, 10) >= todayIso();
}

export function tutorSharePath(token: string) {
  return `/fut/f/${token}`;
}

/** Atajos para capturar torneos sin pensar el nombre desde cero. */
export const TUTOR_TOURNAMENT_PRESETS = [
  "Liga Municipal Querétaro",
  "Liga Estatal Querétaro",
  "Copa IDA",
  "Torneo escolar",
  "Amistosos / invitacionales",
] as const;

export function defaultTutorSeasonLabel(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  return month >= 7 ? `Apertura ${year}` : `Clausura ${year}`;
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
  const usedCodes = await collectUsedPublicCodes(admin);

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
    const childId = randomUUID();
    const codes = await ensureTutorPublicCodes(admin, [childId]);
    const publicCode = codes[childId] ?? mintPublicCode(usedCodes);
    usedCodes.add(publicCode);
    roster.unshift({
      id: childId,
      guardian_user_id: user.id,
      guardian_email: email,
      guardian_phone: phone || null,
      player_name: playerName,
      membership_until: order.membership_until,
      source_folios: [order.folio],
      share_token: newShareToken(),
      public_code: publicCode,
      profile: emptyProfile(),
      created_at: new Date().toISOString(),
      linked_player_id: null,
      linked_academy_id: null,
      linked_academy_name: null,
      linked_player_slug: null,
      linked_at: null,
      explore_opt_in: false,
      explore_opt_in_at: null,
    });
    changed = true;
  }

  // Inscritos a visorías con el mismo WhatsApp → ficha tutor (sin meterlos a plantel).
  if (phone) {
    const { listVisoriaRegistrations } = await import("@/lib/visoria-server");
    const { VISORIA_POSITIONS } = await import("@/lib/visoria-event");
    const regs = await listVisoriaRegistrations(admin).catch(() => []);
    const matchedRegs = regs.filter(
      (row) => phoneKey(row.guardian_phone) === phone,
    );
    for (const reg of matchedRegs) {
      const playerName = (reg.player_full_name ?? "").trim();
      if (playerName.length < 2) continue;
      const key = nameKey(playerName);
      const existing =
        roster.find(
          (child) =>
            child.guardian_user_id === user.id && nameKey(child.player_name) === key,
        ) ??
        roster.find(
          (child) =>
            isPendingVisoriaGuardian(child.guardian_user_id) &&
            nameKey(child.player_name) === key &&
            phoneKey(child.guardian_phone) === phone,
        );
      const positionLabel =
        VISORIA_POSITIONS.find((item) => item.value === reg.position)?.label ??
        reg.position;
      const preferredCode = normalizePublicCode(reg.public_code);
      if (existing) {
        if (isPendingVisoriaGuardian(existing.guardian_user_id)) {
          existing.guardian_user_id = user.id;
          changed = true;
        }
        if (reg.folio && !existing.source_folios.includes(reg.folio)) {
          existing.source_folios.push(reg.folio);
          changed = true;
        }
        if (!existing.guardian_phone && phone) {
          existing.guardian_phone = phone;
          changed = true;
        }
        if (reg.guardian_email && !existing.guardian_email) {
          existing.guardian_email = reg.guardian_email.trim().toLowerCase();
          changed = true;
        }
        if (preferredCode) {
          const currentCode = normalizePublicCode(existing.public_code);
          if (currentCode !== preferredCode) {
            const codes = await ensureTutorPublicCodes(admin, [existing.id], {
              [existing.id]: preferredCode,
            });
            const adopted = normalizePublicCode(codes[existing.id] ?? null);
            if (adopted === preferredCode) {
              existing.public_code = preferredCode;
              usedCodes.add(preferredCode);
              changed = true;
            }
          } else if (!currentCode) {
            existing.public_code = preferredCode;
            usedCodes.add(preferredCode);
            changed = true;
          }
        }
        const profile = existing.profile ?? emptyProfile();
        let profileChanged = false;
        if (!profile.birth_date && reg.birth_date) {
          profile.birth_date = reg.birth_date;
          profileChanged = true;
        }
        if (!profile.position && positionLabel) {
          profile.position = positionLabel;
          profileChanged = true;
        }
        if (!profile.club && reg.current_club) {
          profile.club = reg.current_club;
          profileChanged = true;
        }
        if (!profile.city && reg.city) {
          profile.city = reg.city;
          profileChanged = true;
        }
        if (profileChanged) {
          existing.profile = profile;
          changed = true;
        }
        continue;
      }

      const childId = randomUUID();
      const codes = await ensureTutorPublicCodes(admin, [childId], {
        [childId]: preferredCode,
      });
      const code = codes[childId] ?? mintPublicCode(usedCodes);
      usedCodes.add(code);

      roster.unshift({
        id: childId,
        guardian_user_id: user.id,
        guardian_email: (reg.guardian_email ?? email).trim().toLowerCase() || email,
        guardian_phone: phone,
        player_name: playerName,
        membership_until: TUTOR_PILOT_FREE ? "2099-12-31" : null,
        source_folios: reg.folio ? [reg.folio] : [],
        share_token: newShareToken(),
        public_code: code,
        profile: {
          ...emptyProfile(),
          birth_date: reg.birth_date || null,
          position: positionLabel || null,
          club: reg.current_club || null,
          city: reg.city || null,
        },
        created_at: new Date().toISOString(),
        linked_player_id: null,
        linked_academy_id: null,
        linked_academy_name: null,
        linked_player_slug: null,
        linked_at: null,
        explore_opt_in: false,
        explore_opt_in_at: null,
      });
      changed = true;
    }
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
  const assigned = await assignMissingPublicCodes(admin, roster);
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

  const childId = randomUUID();
  const codes = await ensureTutorPublicCodes(admin, [childId]);
  const publicCode = codes[childId];
  if (!publicCode) throw new Error("No se pudo asignar un código único.");

  const child: TutorChild = {
    id: childId,
    guardian_user_id: user.id,
    guardian_email: email,
    guardian_phone: phone || null,
    player_name: playerName,
    membership_until: TUTOR_PILOT_FREE ? "2099-12-31" : null,
    source_folios: [],
    share_token: newShareToken(),
    public_code: publicCode,
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
    explore_opt_in: false,
    explore_opt_in_at: null,
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

function compareTutorMaterials(a: TutorMaterial, b: TutorMaterial) {
  const aCover = a.kind === "photo" && Boolean(a.is_cover);
  const bCover = b.kind === "photo" && Boolean(b.is_cover);
  if (aCover !== bCover) return aCover ? -1 : 1;

  const aFeatured = a.kind === "video" && Boolean(a.is_featured);
  const bFeatured = b.kind === "video" && Boolean(b.is_featured);
  if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;

  // Fotos antes que videos/notas para que la portada lidera la lista visual.
  const kindRank = (kind: TutorMaterialKind) =>
    kind === "photo" ? 0 : kind === "video" ? 1 : 2;
  const byKind = kindRank(a.kind) - kindRank(b.kind);
  if (byKind !== 0) return byKind;

  return b.created_at.localeCompare(a.created_at);
}

export async function listTutorMaterials(admin: SupabaseClient, child: TutorChild) {
  const rows = await readJson<TutorMaterial>(admin, MATERIALS);
  const mine = rows
    .filter(
      (row) => row.child_id === child.id && row.guardian_user_id === child.guardian_user_id,
    )
    .sort(compareTutorMaterials);

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

/** Activa o apaga el listado de la ficha en Explorar (opt-in). */
export async function updateTutorExploreOptIn(
  admin: SupabaseClient,
  userId: string,
  childId: string,
  exploreOptIn: boolean,
) {
  const { roster } = await loadRoster(admin);
  const index = roster.findIndex(
    (child) => child.id === childId && child.guardian_user_id === userId,
  );
  if (index < 0) throw new Error("No encontramos a ese jugador.");
  const now = new Date().toISOString();
  roster[index] = {
    ...roster[index],
    explore_opt_in: Boolean(exploreOptIn),
    explore_opt_in_at: exploreOptIn ? now : null,
  };
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
  const { roster } = await loadRoster(admin);
  const index = roster.findIndex(
    (child) => child.id === childId && child.guardian_user_id === userId,
  );
  if (index < 0) throw new Error("No encontramos a ese jugador.");
  const takenLocal = roster.find(
    (child, i) => i !== index && normalizePublicCode(child.public_code) === code,
  );
  if (takenLocal) throw new Error("Ese código ya está en uso.");

  const assigned = await ensureTutorPublicCodes(admin, [childId], {
    [childId]: code,
  });
  if (assigned[childId] !== code) {
    throw new Error("Ese código ya está en uso por otro jugador.");
  }
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

function findChildByShareAccess(roster: TutorChild[], token: string) {
  const raw = token.trim();
  if (!raw) return null;
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

export async function getTutorChildByShareToken(admin: SupabaseClient, token: string) {
  const { roster, changed } = await loadRoster(admin);
  if (changed) await writeJson(admin, ROSTER, roster);
  return findChildByShareAccess(roster, token);
}

/** Solo lectura: para OG/metadata sin mutar códigos ni roster. */
export async function peekTutorChildByShareToken(
  admin: SupabaseClient,
  token: string,
) {
  const roster = (await readJson<TutorChild>(admin, ROSTER)).map(normalizeChild);
  return findChildByShareAccess(roster, token);
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
  const hasCover = rows.some(
    (row) =>
      row.child_id === child.id &&
      row.guardian_user_id === child.guardian_user_id &&
      row.kind === "photo" &&
      row.is_cover,
  );
  const hasFeatured = rows.some(
    (row) =>
      row.child_id === child.id &&
      row.guardian_user_id === child.guardian_user_id &&
      row.kind === "video" &&
      row.is_featured,
  );
  const row: TutorMaterial = {
    id: randomUUID(),
    child_id: child.id,
    guardian_user_id: child.guardian_user_id,
    kind: input.kind,
    title: input.title.trim() || (input.kind === "photo" ? "Foto" : "Video"),
    body: null,
    storage_path: input.path,
    created_at: new Date().toISOString(),
    is_cover: input.kind === "photo" ? !hasCover : false,
    is_featured: input.kind === "video" ? !hasFeatured : false,
  };
  rows.unshift(row);
  await writeJson(admin, MATERIALS, rows);
  return row;
}

function ownMaterialIndex(
  rows: TutorMaterial[],
  child: TutorChild,
  materialId: string,
) {
  return rows.findIndex(
    (row) =>
      row.id === materialId &&
      row.child_id === child.id &&
      row.guardian_user_id === child.guardian_user_id,
  );
}

export async function deleteTutorMaterial(
  admin: SupabaseClient,
  child: TutorChild,
  materialId: string,
) {
  const rows = await readJson<TutorMaterial>(admin, MATERIALS);
  const index = ownMaterialIndex(rows, child, materialId);
  if (index < 0) throw new Error("No encontramos ese material.");
  const [removed] = rows.splice(index, 1);
  await writeJson(admin, MATERIALS, rows);

  if (removed.storage_path) {
    await admin.storage.from(OPS_BUCKET).remove([removed.storage_path]);
  }

  // Si borramos la portada/featured, promociona el más reciente del mismo tipo.
  if (removed.kind === "photo" && removed.is_cover) {
    const nextPhoto = rows
      .filter(
        (row) =>
          row.child_id === child.id &&
          row.guardian_user_id === child.guardian_user_id &&
          row.kind === "photo",
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    if (nextPhoto) {
      for (const row of rows) {
        if (row.child_id !== child.id || row.kind !== "photo") continue;
        row.is_cover = row.id === nextPhoto.id;
      }
      await writeJson(admin, MATERIALS, rows);
    }
  }
  if (removed.kind === "video" && removed.is_featured) {
    const nextVideo = rows
      .filter(
        (row) =>
          row.child_id === child.id &&
          row.guardian_user_id === child.guardian_user_id &&
          row.kind === "video",
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    if (nextVideo) {
      for (const row of rows) {
        if (row.child_id !== child.id || row.kind !== "video") continue;
        row.is_featured = row.id === nextVideo.id;
      }
      await writeJson(admin, MATERIALS, rows);
    }
  }

  return { ok: true as const, id: materialId };
}

export async function setTutorPhotoCover(
  admin: SupabaseClient,
  child: TutorChild,
  materialId: string,
) {
  const rows = await readJson<TutorMaterial>(admin, MATERIALS);
  const index = ownMaterialIndex(rows, child, materialId);
  if (index < 0) throw new Error("No encontramos esa foto.");
  if (rows[index].kind !== "photo") {
    throw new Error("Solo una foto puede ser portada.");
  }
  for (const row of rows) {
    if (row.child_id !== child.id || row.guardian_user_id !== child.guardian_user_id) {
      continue;
    }
    if (row.kind === "photo") row.is_cover = row.id === materialId;
  }
  await writeJson(admin, MATERIALS, rows);
  return rows[index];
}

export async function setTutorFeaturedVideo(
  admin: SupabaseClient,
  child: TutorChild,
  materialId: string,
) {
  const rows = await readJson<TutorMaterial>(admin, MATERIALS);
  const index = ownMaterialIndex(rows, child, materialId);
  if (index < 0) throw new Error("No encontramos ese video.");
  if (rows[index].kind !== "video") {
    throw new Error("Solo un video puede ser el destacado.");
  }
  for (const row of rows) {
    if (row.child_id !== child.id || row.guardian_user_id !== child.guardian_user_id) {
      continue;
    }
    if (row.kind === "video") row.is_featured = row.id === materialId;
  }
  await writeJson(admin, MATERIALS, rows);
  return rows[index];
}

/** Temporada / torneo capturado por el tutor (sin academia). */
export interface TutorSeasonStat {
  id: string;
  child_id: string;
  guardian_user_id: string;
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
}

export type TutorSeasonInput = {
  tournament_name: string;
  season_label?: string;
  team_name?: string | null;
  matches?: number;
  goals?: number;
  assists?: number;
  minutes?: number;
  notes?: string | null;
};

function nonNegInt(value: unknown, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.min(Math.round(n), 99999);
}

function normalizeSeason(raw: TutorSeasonStat): TutorSeasonStat {
  return {
    ...raw,
    tournament_name: String(raw.tournament_name ?? "").trim(),
    season_label: String(raw.season_label ?? "").trim(),
    team_name: raw.team_name?.trim() || null,
    matches: nonNegInt(raw.matches),
    goals: nonNegInt(raw.goals),
    assists: nonNegInt(raw.assists),
    minutes: nonNegInt(raw.minutes),
    notes: raw.notes?.trim() || null,
  };
}

export async function listTutorSeasons(admin: SupabaseClient, child: TutorChild) {
  const rows = await readJson<TutorSeasonStat>(admin, SEASONS);
  return rows
    .filter(
      (row) =>
        row.child_id === child.id && row.guardian_user_id === child.guardian_user_id,
    )
    .map(normalizeSeason)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function upsertTutorSeason(
  admin: SupabaseClient,
  child: TutorChild,
  input: TutorSeasonInput,
  seasonId?: string | null,
) {
  assertCanUpload(child);
  const tournament = input.tournament_name.trim();
  if (!tournament) throw new Error("Indica el torneo o competencia.");

  const rows = await readJson<TutorSeasonStat>(admin, SEASONS);
  const now = new Date().toISOString();
  const payload = {
    tournament_name: tournament,
    season_label: (input.season_label ?? "").trim() || "Temporada actual",
    team_name: input.team_name?.trim() || null,
    matches: nonNegInt(input.matches),
    goals: nonNegInt(input.goals),
    assists: nonNegInt(input.assists),
    minutes: nonNegInt(input.minutes),
    notes: input.notes?.trim() || null,
    updated_at: now,
  };

  if (seasonId) {
    const index = rows.findIndex(
      (row) =>
        row.id === seasonId &&
        row.child_id === child.id &&
        row.guardian_user_id === child.guardian_user_id,
    );
    if (index < 0) throw new Error("No encontramos ese registro.");
    rows[index] = normalizeSeason({ ...rows[index], ...payload });
    await writeJson(admin, SEASONS, rows);
    return rows[index];
  }

  const row = normalizeSeason({
    id: randomUUID(),
    child_id: child.id,
    guardian_user_id: child.guardian_user_id,
    created_at: now,
    ...payload,
  });
  rows.unshift(row);
  await writeJson(admin, SEASONS, rows);
  return row;
}

export async function deleteTutorSeason(
  admin: SupabaseClient,
  child: TutorChild,
  seasonId: string,
) {
  const rows = await readJson<TutorSeasonStat>(admin, SEASONS);
  const next = rows.filter(
    (row) =>
      !(
        row.id === seasonId &&
        row.child_id === child.id &&
        row.guardian_user_id === child.guardian_user_id
      ),
  );
  if (next.length === rows.length) throw new Error("No encontramos ese registro.");
  await writeJson(admin, SEASONS, next);
  return { ok: true as const, id: seasonId };
}

export function summarizeTutorSeasons(seasons: TutorSeasonStat[]) {
  return seasons.reduce(
    (acc, row) => ({
      matches: acc.matches + row.matches,
      goals: acc.goals + row.goals,
      assists: acc.assists + row.assists,
      minutes: acc.minutes + row.minutes,
    }),
    { matches: 0, goals: 0, assists: 0, minutes: 0 },
  );
}

export function isPendingVisoriaGuardian(guardianUserId: string) {
  return guardianUserId.startsWith("pending:visoria:");
}

/**
 * Tras registrar visoría: deja una ficha tutor mínima con el mismo MF-…
 * para que `/fut/f/{código}` ya abra algo presentable.
 */
export async function seedTutorFromVisoriaRegistration(
  admin: SupabaseClient,
  reg: {
    id: string;
    folio: string;
    player_full_name: string;
    birth_date: string | null;
    position: string | null;
    current_club: string | null;
    city: string | null;
    guardian_phone: string;
    guardian_email: string | null;
    public_code?: string | null;
  },
) {
  const code = normalizePublicCode(reg.public_code);
  if (!code) return null;

  const { VISORIA_POSITIONS } = await import("@/lib/visoria-event");
  const positionLabel =
    VISORIA_POSITIONS.find((item) => item.value === reg.position)?.label ??
    reg.position;

  const loaded = await loadRoster(admin);
  let roster = loaded.roster;
  let changed = loaded.changed;

  const byCode = roster.find(
    (child) => normalizePublicCode(child.public_code) === code,
  );
  if (byCode) return byCode;

  const phone = phoneKey(reg.guardian_phone);
  const key = nameKey(reg.player_full_name);
  const pendingSame = roster.find(
    (child) =>
      isPendingVisoriaGuardian(child.guardian_user_id) &&
      nameKey(child.player_name) === key &&
      phoneKey(child.guardian_phone) === phone,
  );
  if (pendingSame) {
    if (normalizePublicCode(pendingSame.public_code) !== code) {
      pendingSame.public_code = code;
      changed = true;
    }
    if (changed) await writeJson(admin, ROSTER, roster);
    return pendingSame;
  }

  const childId = randomUUID();
  await ensureTutorPublicCodes(admin, [childId], { [childId]: code });
  const child: TutorChild = {
    id: childId,
    guardian_user_id: `pending:visoria:${reg.id}`,
    guardian_email: (reg.guardian_email ?? "").trim().toLowerCase(),
    guardian_phone: phone || null,
    player_name: reg.player_full_name.trim(),
    membership_until: TUTOR_PILOT_FREE ? "2099-12-31" : null,
    source_folios: reg.folio ? [reg.folio] : [],
    share_token: newShareToken(),
    public_code: code,
    profile: {
      ...emptyProfile(),
      birth_date: reg.birth_date || null,
      position: positionLabel || null,
      club: reg.current_club || null,
      city: reg.city || null,
    },
    created_at: new Date().toISOString(),
    linked_player_id: null,
    linked_academy_id: null,
    linked_academy_name: null,
    linked_player_slug: null,
    linked_at: null,
    explore_opt_in: false,
    explore_opt_in_at: null,
  };
  roster.unshift(child);
  await writeJson(admin, ROSTER, roster);
  return child;
}
